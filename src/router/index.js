import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PositionCalculator from '../views/PositionCalculator.vue';
import BatterProjections from '../views/BatterProjections.vue';
import PitcherProjections from '../views/PitcherProjections.vue';
import NotFound from '../views/NotFound.vue';
import About from '../views/About.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/position-calculator',
    name: 'PositionCalculator',
    component: PositionCalculator
  },
  {
    path: '/batter-projections',
    name: 'BatterProjections',
    component: BatterProjections,
  },
  {
    path: '/pitcher-projections',
    name: 'PitcherProjections',
    component: PitcherProjections,
    props: { type: 'pitching' }
  },
  { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
