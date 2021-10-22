import Vue from 'vue';
import uView from 'uview-ui';
import formRules from '@/utils/formRules';
import setting from '@/setting';

import divider from '@/components/divider';

import App from './App';

import '@/style/tailwind.css';
import '@/style/index.scss';

Vue.component('divider', divider);

Vue.config.productionTip = false;

Vue.prototype.$rules = formRules;

Vue.prototype.$baseUrl = setting.baseUrl;
Vue.prototype.$uploadUrl = setting.baseUrl + 'api/common/file/upload';

Vue.prototype.$showToast = (title, icon = 'none', otherOptions) => {
  uni.showToast({ title, icon, ...otherOptions });
};

App.mpType = 'app';
Vue.use(uView);

const app = new Vue({
  ...App,
});
app.$mount();
