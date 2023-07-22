import Vue from 'vue'
import VueRouter from 'vue-router'

const LoginCom = () => import('../components/LoginCom')
const HomeCom = () => import('../components/HomeCom')
const HomeWelcome = () => import('../components/HomeWelcome')
const UserManager = () => import('../components/user/UserManager')
const RightsList = () => import('../components/authority/RightsList')
const RolesList = () => import('../components/authority/RolesList')
const GoodsCategory = () => import('../components/goods/GoodsCategory')
const GoodsParameters = () => import('../components/goods/GoodsParameters')

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
      },
      {
        path: '/rights',
        component: RightsList
      },
      {
        path: '/roles',
        component: RolesList
      },
      {
        path: '/categories',
        component: GoodsCategory
      },
      {
        path: '/params',
        component: GoodsParameters
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
