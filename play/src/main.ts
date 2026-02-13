import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import FalconUI from '@falcon-ui/falcon-ui'
import 'element-plus/dist/index.css'
import './styles/base.scss'
import '@falcon-ui/theme/index.scss'

const app = createApp(App)

app.use(FalconUI)
app.use(router)
app.mount('#app')
