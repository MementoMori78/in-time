import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'
import Calendar from 'v-calendar';

Vue.config.productionTip = false;


Vue.use(Calendar, {
  componentPrefix: 'vc', 
  locale: 'uk'
});

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')