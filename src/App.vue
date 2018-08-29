<template>
  <div id="app">
    <Login v-if="!auth" />
    <Container v-if="auth" :jwt="jwt" />
  </div>
</template>

<script>
import Login from "./components/Login.vue";
import Container from "./components/Container.vue";
var Cookies = require("js-cookie");

export default {
  name: "app",
  data: function() {
    return {
      auth: !(Cookies.get("jwt") == null),
      jwt: Cookies.get("jwt")
    };
  },
  created() {
    this.$eventHub.$on("auth", this.checkAuth);
  },
  beforeDestroy() {
    this.$eventHub.$off("auth");
  },
  methods: {
    checkAuth: function() {
      this.jwt = Cookies.get("jwt");
      this.auth = !(this.jwt == null);
    }
  },
  components: {
    Login,
    Container
  }
};
</script>
