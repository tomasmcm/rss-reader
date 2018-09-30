"use strict";

var HeaderMenu = Vue.component("header-menu", {
  name: "header-menu",
  template: "#header-menu-template",
  props: ["feeds", "currentFeed"],
  methods: {
    logout: function logout() {
      Cookies.remove("jwt");
      Cookies.remove("id");
      this.$eventHub.$emit("auth");
    }
  }
});
