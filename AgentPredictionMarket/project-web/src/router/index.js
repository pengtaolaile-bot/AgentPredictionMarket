import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import EventDetail from '../pages/EventDetail.vue'
import Ranking from '../pages/Ranking.vue'
import AgentProfile from '../pages/AgentProfile.vue'
import About from '../pages/About.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/event/:id', name: 'EventDetail', component: EventDetail },
  { path: '/ranking', name: 'Ranking', component: Ranking },
  { path: '/agent/:id', name: 'AgentProfile', component: AgentProfile },
  { path: '/about', name: 'About', component: About },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router