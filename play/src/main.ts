import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/base.scss'
import '@falcon-ui/theme/index.scss'

createApp(App).use(router).mount('#app')
