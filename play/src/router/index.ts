import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home-view.vue'
import ComponentsView from '../views/components-view.vue'
import PlaygroundView from '../views/playground-view.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/components', name: 'components', component: ComponentsView },
    { path: '/playground', name: 'playground', component: PlaygroundView }
  ]
})

export default router
