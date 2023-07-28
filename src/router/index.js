import Vue from 'vue'
import VueRouter from 'vue-router'

const LoginCom = () => import('../views/LoginCom')
const HomeCom = () => import('../views/HomeCom')
const HomeWelcome = () => import('../views/HomeWelcome')
const UserManager = () => import('../components/user/UserManager')
const RightsList = () => import('../components/authority/RightsList')
const RolesList = () => import('../components/authority/RolesList')
const GoodsCategory = () => import('../components/goods/GoodsCategory')
const GoodsParameters = () => import('../components/goods/GoodsParameters')
const GoodsList = () => import('../components/goods/GoodsList')
const GoodsAdd = () => import('../components/goods/GoodsAdd')
const OrderList = () => import('../components/order/OrderList')
const ReportTable = () => import('../components/report/ReportTable')

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
      },
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/goods/add',
        component: GoodsAdd
      },
      {
        path: '/orders',
        component: OrderList
      },
      {
        path: '/reports',
        component: ReportTable
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
