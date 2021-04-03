import Vue from 'vue'
import uView from 'uview-ui'
import App from './App'

import '@/style/tailwind.css'
import '@/style/index.scss'

Vue.config.productionTip = false

App.mpType = 'app'
Vue.use(uView)

const app = new Vue({
  ...App,
})
app.$mount()
