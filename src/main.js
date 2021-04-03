import Vue from 'vue'
import uView from 'uview-ui'

import divider from '@/components/divider'

import App from './App'

import '@/style/tailwind.css'
import '@/style/index.scss'

Vue.component('divider', divider)

Vue.config.productionTip = false

App.mpType = 'app'
Vue.use(uView)

const app = new Vue({
  ...App,
})
app.$mount()
