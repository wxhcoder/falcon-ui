# FlBarcode 需求文档（Barcode PRD）

## 0. 开发阶段状态

- [x] 阶段 1：需求梳理与目录初始化
- [ ] 阶段 2：组件契约定义（`src/barcode.ts`）
- [ ] 阶段 3：组件实现（`src/barcode.vue`）
- [ ] 阶段 4：导出链路接入（components / falcon-ui / global）
- [ ] 阶段 5：单元测试、Play 示例与文档页
- [ ] 阶段 6：质量门禁（lint / test / docs:api / play:build / docs:build）

## 1. 组件目标

- 组件名称：`FlBarcode`
- 组件定位：Falcon UI 内的一维码展示组件，用于输出业务场景常见条码。
- 目标范围：提供稳定、轻量、可配置的条码渲染能力。
- 使用场景：
  - 商品编码、出入库单号、物流单号展示
  - 设备编号、序列号、会员码等需要一维码的页面
  - 打印预览、票据页、详情页中的条码区域

## 2. 参考来源

- `JsBarcode` 官方 README：
  `https://raw.githubusercontent.com/lindell/JsBarcode/master/README.md`

## 3. 范围定义

### 3.1 In Scope

- 基于字符串值生成一维码
- v1 固定输出内联 `svg`
- 支持 6 种格式：
  - `CODE128`
  - `CODE39`
  - `EAN13`
  - `EAN8`
  - `UPCA`
  - `UPCE`
- 支持条宽、条高、颜色、背景色配置
- 支持人类可读文本的显示与样式控制
- 支持文档与 Play 示例中的基础演示

### 3.2 Out of Scope

- 二维码与条码的单组件切换
- `canvas` 输出模式
- 下载条码图片
- 复制条码图片或内容
- 扫描解析、扫码枪输入适配
- 批量导出、打印模板编排
- 超出既定 6 种范围的额外格式

## 4. 组件 API 草案

### 4.1 Props

| Prop              | 类型                                                             | 默认值        | 说明                               |
| ----------------- | ---------------------------------------------------------------- | ------------- | ---------------------------------- |
| `value`           | `string`                                                         | `''`          | 需要编码的一维码内容               |
| `format`          | `'CODE128' \| 'CODE39' \| 'EAN13' \| 'EAN8' \| 'UPCA' \| 'UPCE'` | `'CODE128'`   | 条码制式                           |
| `width`           | `number`                                                         | `2`           | 单个条的宽度                       |
| `height`          | `number`                                                         | `100`         | 条码高度                           |
| `color`           | `string`                                                         | `'#000000'`   | 条码线条颜色                       |
| `backgroundColor` | `string`                                                         | `'#ffffff'`   | 条码背景颜色                       |
| `displayValue`    | `boolean`                                                        | `true`        | 是否显示人类可读文本               |
| `text`            | `string`                                                         | `''`          | 自定义显示文本，未传时沿用 `value` |
| `font`            | `string`                                                         | `'monospace'` | 文本字体                           |
| `fontOptions`     | `string`                                                         | `''`          | 文本字体附加样式，如 `bold`        |
| `fontSize`        | `number`                                                         | `20`          | 文本字号                           |
| `textAlign`       | `'left' \| 'center' \| 'right'`                                  | `'center'`    | 文本对齐方式                       |
| `textPosition`    | `'top' \| 'bottom'`                                              | `'bottom'`    | 文本显示位置                       |
| `textMargin`      | `number`                                                         | `2`           | 文本与条码之间的距离               |
| `margin`          | `number`                                                         | `10`          | 条码整体外边距                     |
| `marginTop`       | `number`                                                         | `undefined`   | 顶部外边距，存在时覆盖统一外边距   |
| `marginRight`     | `number`                                                         | `undefined`   | 右侧外边距，存在时覆盖统一外边距   |
| `marginBottom`    | `number`                                                         | `undefined`   | 底部外边距，存在时覆盖统一外边距   |
| `marginLeft`      | `number`                                                         | `undefined`   | 左侧外边距，存在时覆盖统一外边距   |

### 4.2 Emits

- v1 不新增自定义事件
- 不提供 `valid`、`error`、`rendered` 等事件

### 4.3 Slots / Exposes

- v1 不提供插槽
- v1 不新增自定义 expose

## 5. 渲染策略

### 5.1 基础渲染

- 底层渲染库固定使用 `jsbarcode`
- 组件内部固定维护一个 `svg` 容器节点
- 挂载后调用 `JsBarcode(svgElement, value, options)` 生成条码
- `value`、`format`、尺寸、颜色、文本样式变化后触发重绘

### 5.2 SVG 模式约束

- v1 只做 `svg` 输出，不引入 `canvas`
- 文本显示与对齐完全遵循 `JsBarcode` 可支持的配置
- 不额外封装“下载为 png”“转 dataURL”等派生能力

## 6. 校验与失败策略

- `value` 为空字符串时，不保留旧条码，直接清空渲染区
- `format` 与 `value` 组合不合法时：
  - 清空当前渲染区
  - 不抛组件级异常
  - 开发环境输出 `console.warn`
- 参数校验以“保证不炸页面”为目标，不做额外错误 UI
- 不新增 `errorText`、`errorSlot`、`onInvalid` 等能力

## 7. 文档与示例要求

### 7.1 文档页内容

- 基础用法
- 6 种格式示例
- 显示文本与隐藏文本
- 文本位置与字号
- 颜色与尺寸配置
- API 表格（props / events / slots / exposes）

### 7.2 示例矩阵

- `basic.vue`：最小用法，仅传 `value`
- `formats.vue`：展示 6 种格式
- `display-value.vue`：演示 `displayValue`、`text`
- `text-style.vue`：演示 `fontSize`、`textAlign`、`textPosition`
- `size-and-color.vue`：演示 `width`、`height`、`color`、`backgroundColor`

## 8. 测试验收

- `value` 变化后条码内容重绘
- `format` 切换 6 种制式时能正确生成 `svg`
- `width`、`height`、`color`、`backgroundColor` 变化后会触发重绘
- `displayValue=false` 时不显示人类可读文本
- `text` 覆盖默认显示文本
- `font`、`fontOptions`、`fontSize`、`textAlign`、`textPosition`、`textMargin` 生效
- `margin` 与 `marginTop/Right/Bottom/Left` 逻辑正确
- 空值时清空渲染区，不保留旧条码
- 非法输入时不抛组件级异常，渲染区被清空

## 9. 下一阶段落地文件

- `packages/components/barcode/src/barcode.ts`
- `packages/components/barcode/src/barcode.vue`
- `packages/components/barcode/index.ts`
- `packages/components/barcode/__test__/barcode.test.ts`
