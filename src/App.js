"use strict";

var App = Vue.component("app", {
  name: "app",
  template:
    '<div id="app"><Login v-if="!auth" /><Container v-if="auth" :jwt="jwt" /></div>',
  data: function data() {
    return {
      auth: !(Cookies.get("jwt") == null),
      jwt: Cookies.get("jwt")
    };
  },
  created: function created() {
    this.$eventHub.$on("auth", this.checkAuth);
  },
  beforeDestroy: function beforeDestroy() {
    this.$eventHub.$off("auth");
  },

  methods: {
    checkAuth: function checkAuth() {
      this.jwt = Cookies.get("jwt");
      this.auth = !(this.jwt == null);
    }
  },
  components: {
    Login: Login,
    Container: Container
  }
});
