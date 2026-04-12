# FlQrCode 需求文档（QR Code PRD）

## 0. 开发阶段状态

- [x] 阶段 1：需求梳理与目录初始化
- [ ] 阶段 2：组件契约定义（`src/qr-code.ts`）
- [ ] 阶段 3：组件实现（`src/qr-code.vue`）
- [ ] 阶段 4：导出链路接入（components / falcon-ui / global）
- [ ] 阶段 5：单元测试、Play 示例与文档页
- [ ] 阶段 6：质量门禁（lint / test / docs:api / play:build / docs:build）

## 1. 组件目标

- 组件名称：`FlQrCode`
- 组件定位：Falcon UI 内的二维码展示组件，用于渲染可扫码的业务值。
- 目标对齐：核心能力参考 Naive UI `QR Code` 组件。
- 使用场景：
  - 页面展示链接、编码值、业务单号、设备编号等二维码内容
  - 表单详情页、分享页、打印页中的二维码区域
  - 需要切换 `canvas` / `svg` 输出形式的场景

## 2. 参考来源

- Naive UI QR Code 文档：
  `https://www.naiveui.com/zh-CN/os-theme/components/qr-code`
- `qrcode` 库 README：
  `https://raw.githubusercontent.com/soldair/node-qrcode/master/README.md`

## 3. 范围定义

### 3.1 In Scope

- 提供字符串值二维码渲染能力
- 支持 `canvas` 与 `svg` 两种输出模式
- 支持前景色、背景色、尺寸、内边距配置
- 支持错误恢复等级配置
- 支持二维码中心 icon / logo 展示
- 支持文档与 Play 示例中的基础演示

### 3.2 Out of Scope

- 下载二维码图片
- 复制二维码图片或二维码内容
- 长按保存、分享面板接入
- 批量导出二维码
- 动画效果、渐变码点、艺术二维码
- 扫码识别或扫码回填
- 条码 / 一维码切换能力

## 4. 组件 API 草案

### 4.1 Props

| Prop                   | 类型                       | 默认值      | 说明                        |
| ---------------------- | -------------------------- | ----------- | --------------------------- |
| `value`                | `string`                   | `''`        | 需要编码到二维码中的内容    |
| `size`                 | `number`                   | `100`       | 二维码外部显示尺寸，单位 px |
| `color`                | `string`                   | `'#000000'` | 二维码深色模块颜色          |
| `backgroundColor`      | `string`                   | `'#ffffff'` | 二维码浅色背景颜色          |
| `padding`              | `number`                   | `12`        | 二维码内容区外的内边距      |
| `errorCorrectionLevel` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'`       | 错误恢复等级                |
| `iconSrc`              | `string`                   | `''`        | 中心 icon 图片地址          |
| `iconSize`             | `number`                   | `24`        | 中心 icon 尺寸，单位 px     |
| `iconBackgroundColor`  | `string`                   | `'#ffffff'` | icon 背景色                 |
| `iconBorderRadius`     | `number`                   | `4`         | icon 背景圆角，单位 px      |
| `type`                 | `'canvas' \| 'svg'`        | `'canvas'`  | 输出模式                    |

### 4.2 Emits

- v1 不新增自定义事件
- 不提供 `success`、`error`、`rendered` 等事件

### 4.3 Slots / Exposes

- v1 不提供插槽
- v1 不新增自定义 expose

## 5. 渲染策略

### 5.1 基础渲染

- 底层渲染库固定使用 `qrcode`
- `type='canvas'` 时使用 `toCanvas`
- `type='svg'` 时使用 `toString(..., { type: 'svg' })`
- 渲染节点统一包裹在组件根容器中，容器负责尺寸与定位

### 5.2 Icon 叠加策略

- `iconSrc` 不直接写入二维码库内部配置
- 统一采用“二维码渲染层 + 居中覆盖层”的方案
- 覆盖层位于二维码中央，尺寸由 `iconSize` 控制
- 覆盖层背景色由 `iconBackgroundColor` 控制
- 覆盖层圆角由 `iconBorderRadius` 控制
- 该方案对 `canvas` 与 `svg` 两种模式保持一致

### 5.3 客户端渲染时机

- 组件挂载后再执行二维码生成
- `value`、`size`、`color`、`backgroundColor`、`padding`、
  `errorCorrectionLevel`、`type` 变化后触发重绘
- `icon` 相关 props 变化时，仅更新覆盖层表现；若实现更简单，也允许整体验证后重绘

## 6. 异常处理策略

- `value` 为空字符串时，不保留旧二维码，直接清空渲染区
- 二维码生成失败时：
  - 清空当前渲染区
  - 不抛出组件级错误事件
  - 开发环境输出 `console.warn`
- 非法颜色、非法尺寸等异常参数不单独做 UI 提示
- 不引入 `isError`、`fallbackText`、`errorSlot` 等额外能力

## 7. 文档与示例要求

### 7.1 文档页内容

- 基础用法
- 颜色与尺寸配置
- icon 居中展示
- `canvas` 与 `svg` 对比
- API 表格（props / events / slots / exposes）

### 7.2 示例矩阵

- `basic.vue`：最小用法，仅传 `value`
- `color-and-size.vue`：演示 `size`、`color`、`backgroundColor`
- `icon.vue`：演示 `iconSrc`、`iconSize`、`iconBackgroundColor`
- `type.vue`：对比 `canvas` 与 `svg`

## 8. 测试验收

- `value` 变化后二维码内容重绘
- `type` 在 `canvas` 与 `svg` 间切换时能正确切换输出节点
- `size`、`color`、`backgroundColor`、`padding` 变化后会触发重绘
- `errorCorrectionLevel` 变化后会触发重绘
- `iconSrc` 存在时能正确显示中心覆盖层
- `iconSize`、`iconBackgroundColor`、`iconBorderRadius` 生效
- 空值时清空渲染区，不保留旧二维码
- 渲染异常时不抛组件级错误，渲染区被清空

## 9. 下一阶段落地文件

- `packages/components/qr-code/src/qr-code.ts`
- `packages/components/qr-code/src/qr-code.vue`
- `packages/components/qr-code/index.ts`
- `packages/components/qr-code/__test__/qr-code.test.ts`
