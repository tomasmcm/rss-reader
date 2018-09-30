// import Vue from 'vue';
// import App from './App.vue';
// require('url-search-params');
// require('es6-promise/auto');
'use strict';

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function(){
  Vue.prototype.$eventHub = new Vue();

  new Vue({
    el: "#app",
    render: function render(h) {
      return h(App);
    }
  });
});
