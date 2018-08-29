<template>
  <div class="login">
    <header>
      <h1 class="main_title">winds.ink</h1>
      <h4 class="main_subtitle">Create an account at
        <a href="https://winds.getstream.io/">winds.getstream.io</a><br>and login with the same credentials here.
      </h4>
    </header>
    <fieldset>
      <label class="c-label" for="email">EMAIL</label>
      <input class="c-input" type="email" name="email" id="email" v-model="email">

      <label class="c-label" for="pass">PASSWORD</label>
      <input class="c-input" type="password" name="pass" id="pass" v-model="pass">

      <button class="c-button c-button--fw" id="login_button" @click="login">LOGIN</button>
    </fieldset>
    <footer>
      <a href="https://tomasmcm.design">tomasmcm</a> © 2018
    </footer>
  </div>
</template>

<script>
var Cookies = require("js-cookie");

export default {
  name: "login",
  data: function() {
    return {
      base: "https://winds-prod.getstream.io/",
      email: "",
      pass: ""
    };
  },
  methods: {
    login: function() {
      var self = this;
      $.ajax({
        url: self.base + "auth/login",
        type: "post",
        dataType: "json",
        data: '{"email":"' + self.email + '","password":"' + self.pass + '"}',
        contentType: "application/json"
      }).done(function(data) {
        self.email = "";
        self.pass = "";
        Cookies.set("jwt", data.jwt, { expires: 99999 });
        Cookies.set("id", data._id, { expires: 99999 });
        self.$eventHub.$emit("auth");
      });
    }
  }
};
</script>
<style scoped>
.main_title {
  font-size: 3em;
  line-height: 1.2em;
  margin: 1em;
  letter-spacing: 30px;
  text-align: center;
  text-transform: uppercase;
  text-shadow: -5px 5px 0 lightgrey;
}
.main_subtitle {
  font-size: 1.2em;
  line-height: 1.5em;
  text-align: center;
  margin-bottom: 1em;
}

.login {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background: white;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-box-pack: justify;
  padding: 1em;
  padding-top: 3em;
}
.c-input {
  border: 1px solid lightgrey;
  font-size: 1.2em;
  padding: 1em;
  margin-bottom: 2em;
  display: block;
  width: 100%;
}
.c-label {
  margin-bottom: .5em;
  display: block;
}

.c-button {
  border: 2px solid #000;
  font-size: 1.5em;
  padding: .6em 2em;
  display: block;
  appearance: none;
  -webkit-appearance: none;
  background: white;
  font-family: "Amazon Ember", Helvetica, Arial, sans-serif;
}
.c-button--fw {
  width: 100%;
}
</style>
