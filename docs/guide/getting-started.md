# 安装与使用

## 安装

```bash
pnpm add falcon-ui
```

## 全量注册

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FalconUI from 'falcon-ui'
import 'falcon-ui/theme/index.css'

createApp(App).use(FalconUI).mount('#app')
```

## 按需引入

```ts
import { FlButton, FlInput, FlInputNumber } from 'falcon-ui'
```

## 类型提示

如果使用 `app.use(FalconUI)` 全局注册，建议增加：

```json
{
  "compilerOptions": {
    "types": ["vite/client", "falcon-ui/global"]
  }
}
```
