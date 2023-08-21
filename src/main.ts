import Vue from 'vue';
import App from './App.vue';
import uView from 'uview-ui';
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(Element);
Vue.use(uView);
Vue.config.productionTip = false;

new App().$mount();
