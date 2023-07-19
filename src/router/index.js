import Vue from 'vue'
import VueRouter from 'vue-router'

const LoginCom = () => import('../components/LoginCom')
const HomeCom = () => import('../components/HomeCom')
const HomeWelcome = () => import('../components/HomeWelcome')
const UserManager = () => import('../components/user/UserManager')

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: LoginCom
  },

  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/home',
    component: HomeCom,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: HomeWelcome
      },
      {
        path: '/users',
        component: UserManager
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  console.log(to)
  if (to.path !== '/login') {
    const token = window.sessionStorage.getItem('token')
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
  next()
})

export default router
