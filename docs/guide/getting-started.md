# 瀹夎涓庝娇鐢?

## 瀹夎

```bash
pnpm add falcon-ui
```

## 鍏ㄩ噺娉ㄥ唽

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FalconUI from 'falcon-ui'
import 'falcon-ui/theme/index.css'

createApp(App).use(FalconUI).mount('#app')
```

## 鎸夐渶寮曞叆

```ts
import { FlButton, FlInput, FlInputNumber } from 'falcon-ui'
```

## 绫诲瀷鎻愮ず

濡傛灉浣跨敤 `app.use(FalconUI)` 鍏ㄥ眬娉ㄥ唽锛屽缓璁鍔狅細

```json
{
  "compilerOptions": {
    "types": ["vite/client", "falcon-ui/global"]
  }
}
```
