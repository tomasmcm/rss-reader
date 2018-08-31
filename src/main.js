import Vue from 'vue';
import App from './App.vue';
require('url-search-params');
require('es6-promise/auto');

Vue.prototype.$eventHub = new Vue();

new Vue({
  el: '#app',
  render: h => h(App)
});
