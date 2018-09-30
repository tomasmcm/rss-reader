"use strict";

var Login = Vue.component("login", {
  name: "login",
  template: "#login-template",
  data: function data() {
    return {
      base: "https://winds-prod.getstream.io/",
      email: "",
      pass: ""
    };
  },
  methods: {
    login: function login() {
      var self = this;

      var request = new XMLHttpRequest();
      request.open("POST", self.base + "auth/login", true);
      request.setRequestHeader(
        "Content-Type",
        "application/json;charset=UTF-8"
      );

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);
          self.email = "";
          self.pass = "";
          Cookies.set("jwt", resp.jwt, { expires: 99999 });
          Cookies.set("id", resp._id, { expires: 99999 });
          self.$eventHub.$emit("auth");
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
      };

      request.send(
        '{"email":"' + self.email + '","password":"' + self.pass + '"}'
      );
    }
  }
});
