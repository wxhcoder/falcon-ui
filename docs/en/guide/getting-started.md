# Installation and Usage

## Installation

```bash
pnpm add @falcon-ui/falcon-ui
```

## Full Registration

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FalconUI from '@falcon-ui/falcon-ui'
import '@falcon-ui/falcon-ui/theme/index.css'

createApp(App).use(FalconUI).mount('#app')
```

## On-Demand Imports

```ts
import { FlButton, FlInput, FlInputNumber } from '@falcon-ui/falcon-ui'
```

## Type Hints

If you register all components globally with `app.use(FalconUI)`, add:

```json
{
  "compilerOptions": {
    "types": ["vite/client", "@falcon-ui/falcon-ui/global"]
  }
}
```
