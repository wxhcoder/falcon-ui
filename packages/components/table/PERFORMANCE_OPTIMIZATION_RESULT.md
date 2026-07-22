# FlTable 键盘焦点 P0 优化结果

## 结论

本轮只实施了方案中的 P0-A 和 P0-B，没有实施 P1～P3。

P0 已消除“每次方向键让 2,500 个表体单元格重新计算 class”的主要问题。四个场景中，
用户 `cellClassName` / `headerCellClassName` 探针每键都从 2,500/50 次降为 0。plain 场景
p50 下降约 95%，说明焦点 class 的全表重算确实是纯文本表格卡顿的主因。

editor 场景仍有明显延迟。新的 Trace 显示其主要时间已经不在 class 回调或 editor registry
扫描，而在浏览器对 2,500 个编辑器 DOM 做渲染层重建；无条件 `scrollIntoView` 仍是最突出
的组件相关采样点。因此可以把 P1 作为下一轮实验，但本轮没有修改滚动逻辑。

## 实施内容

### P0-A：焦点 class 差量更新

1. ElTable 的 body/header class 回调改读普通焦点快照，不再订阅 `activeCell`。
2. 焦点变化后，只比较旧/新焦点需要的 class 集合：
   - cross off：只改旧、新活动格；
   - cross on：只改受影响的行、列、表头和控制格，共享的 class 不重复移除再添加。
3. 同一帧内复用行、列 DOM 查询结果，避免为行列中的每个格重复遍历整张表。
4. 数据、列结构和 crossHighlight 变化后重新同步；清焦点和卸载只删除 FlTable 自有 class。

### P0-B：editor registry 单元格索引

1. 响应式 endpoint 数组改为普通 `Map` / `WeakMap`。
2. 注册时记录 editor 所属的真实 `td.el-table__cell`。
3. 查询活动 editor 时只校验目标格候选，不再过滤全部 2,500 个 endpoint。
4. 数据或列结构变化时把索引标为失效，在下一次查询前安全重建。

## 同条件复测

配置：Chrome 1440×900、CPU 1×、无网络限速；每组预热后执行 12 次 ArrowRight 和
12 次 ArrowDown。页面耗时从 keydown capture 开始，到第二个 `requestAnimationFrame`，
因此它包含事件处理、样式/渲染和下一次稳定绘制，不等同于 JavaScript 函数自身耗时。

| 场景               |   基线 p50 | P0 后 p50 |   变化 |   基线 p95 | P0 后 p95 |   基线最大 | P0 后最大 |
| ------------------ | ---------: | --------: | -----: | ---------: | --------: | ---------: | --------: |
| plain / cross off  |   448.6 ms |   23.1 ms | -94.9% |   515.2 ms |   35.0 ms |   539.1 ms |   59.2 ms |
| plain / cross on   |   680.3 ms |   38.9 ms | -94.3% |   750.1 ms |   58.3 ms |   764.1 ms |   75.1 ms |
| editor / cross off | 1,744.4 ms |  201.2 ms | -88.5% | 2,104.6 ms |  348.0 ms | 2,131.6 ms |  489.6 ms |
| editor / cross on  |   564.0 ms |  216.5 ms | -61.6% |   963.3 ms |  352.0 ms | 1,020.3 ms |  356.4 ms |

editor/cross-on 的基线单次录制比 editor/cross-off 异常地快，不能把两者的绝对排序解释成
cross 开关的因果影响。更可靠的证据是四组固定为 0 的 callback 计数、源码调用栈和同一场景
优化前后的变化。

| 场景               | 基线 body/header 回调每键 | P0 后 body/header 回调每键 |
| ------------------ | ------------------------: | -------------------------: |
| plain / cross off  |                  2500 / 0 |                      0 / 0 |
| plain / cross on   |                 2500 / 50 |                      0 / 0 |
| editor / cross off |                  2500 / 0 |                      0 / 0 |
| editor / cross on  |                 2500 / 50 |                      0 / 0 |

## 残余延迟证据

压缩原始 Trace 的主线程分析如下。时间是完整 24 键录制区间的累计值；Trace 本身有采样
开销，因此用于判断热点构成，不用于承诺生产环境的绝对延迟。

| 场景               |  主线程忙碌 | scripting | rendering | Layerize 累计 |
| ------------------ | ----------: | --------: | --------: | ------------: |
| plain / cross off  |  1,082.1 ms |     36.6% |     48.8% |      338.6 ms |
| plain / cross on   |  1,734.7 ms |     35.8% |     47.5% |      383.9 ms |
| editor / cross off | 13,888.9 ms |      7.0% |     90.7% |   11,977.5 ms |
| editor / cross on  | 15,969.1 ms |     11.1% |     88.1% |   13,156.7 ms |

独立的 Chrome DevTools 交互 Trace 在 editor/cross-off 下录制 4 次 ArrowRight，最慢
keydown 的 INP 为 693 ms，其中 input delay 0.9 ms、事件处理 414 ms、提交下一帧 278 ms。
它与原始 Trace 一致地证明：P0 后仍存在用户可感知的编辑模式延迟。

源码采样中：

1. `resolveCrossClass` 和全表用户 class 回调不再是热点。
2. `getEditorsInCells` 只出现极少量采样；单元测试进一步证明快速路径不会读取其他格 editor。
3. editor 两组约 90% 主线程忙碌时间属于 rendering，Layerize 是最大事件项。
4. `scrollIntoView` 是四组中最稳定、最突出的剩余组件相关调用点；横纵移动进入滚动边界后，
   editor 样本明显变慢。

## 下一步判断（本轮不实施）

建议下一轮只验证 P1：目标格完全可见时不滚动，越界时只修改必要的表体滚动量，并把读取
几何位置、焦点 class 写入和滚动写入安排在同一帧。依据不是“滚动可能比较慢”，而是：

1. P0 已把 body/header callback 固定降为 0，但 editor 延迟仍存在。
2. 新 Trace 中 editor 时间由 rendering/Layerize 主导，不再由 P0 的脚本路径主导。
3. `scrollIntoView` 持续出现在采样热点，且慢样本集中在横纵滚动阶段。

只有 P1 复测后行列位置解析仍是显著热点，才进入 P2；P3 仍只面向比 50×50 更大的长期
虚拟化需求。

## 证据文件

- 基线报告：`docs/performance/fl-table-keyboard-focus-baseline.md`
- 基线 Trace：`docs/performance/artifacts/*.trace.json.gz`
- P0 后 Trace：`docs/performance/artifacts/p0-after/*.trace.json.gz`
- P0 后页面指标：`docs/performance/artifacts/p0-after/*.metrics.json`
- P0 后截图：`docs/performance/artifacts/p0-after/*.png`
- P0 后统一分析：`docs/performance/artifacts/p0-after/trace-analysis.json`

四份 P0 后 `.trace.json.gz` 均由 Chrome DevTools Protocol 原始 trace stream 压缩生成，
并已成功解压、解析出主线程、24 个 keydown 范围和 CPU profile，可重新导入浏览器分析工具。
