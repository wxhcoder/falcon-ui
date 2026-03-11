# 组件命名与样式命名规范

用于 Element Plus 二次封装组件的统一命名与样式命名约束。

## 1. 组件命名

1. 组件名统一使用 `Fl` 前缀：`FlXxx`，例如 `FlButton`、`FlInput`、`FlTable`。
2. `defineOptions` 的 `name` 必须与组件名一致，例如 `name: 'FlTable'`。
3. 安装导出名与全局组件名保持 `FlXxx` 形式，不引入其他品牌前缀变体。

## 2. fl 命名空间

1. BEM 命名空间统一为 `fl`。
2. 块级类名形如 `fl-button`、`fl-table`。
3. 元素类名形如 `fl-input__inner`、`fl-table__header-row`。
4. 修饰符类名形如 `fl-tag--success`。
5. 状态类统一走 `is-*` 形式，例如 `is-error`、`is-active`。

## 3. CSS 变量

1. Falcon 自有 CSS 变量统一使用 `--fl-*` 前缀。
2. 能直接复用 Element Plus 变量时直接复用，不新造同义变量。
3. 禁止新增旧命名：`F*`、`f-*`、`--f-*`。

## 4. 禁止事项

1. 不要手写新的非 `fl` 命名空间品牌类名。
2. 不要把结构语义、视觉语义、临时调试语义混进同一个类名。
3. 不要在同一组件内并存新旧命名规范；发现冲突时在当前任务范围内一并收敛。
