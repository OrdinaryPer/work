import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入商品分类需要的树形表
import TreeTable from 'vue-table-with-tree-grid'

axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
// 发起请求时，加上 Authorization 请求头
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
