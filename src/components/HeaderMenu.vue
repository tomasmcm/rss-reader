<template>
  <div class="feeds">
    <div class="backdrop" @click="$eventHub.$emit('hide-menu')"></div>
    <p class="u-text-r">
      <button class="c-button u-inline" id="logout_button" @click="logout">LOGOUT</button>
    </p>
    <br>
    <small>FEEDS</small>
    <div v-for="feed in feeds" class="feed" v-bind:class="{ 'is-active': (feed.index == currentFeed) }" :key=" 'loadFeed' + feed.index " @click="$eventHub.$emit('load-feed', feed.index)">
      {{ feed.name }}
    </div>
  </div>
</template>

<script>
var Cookies = require("js-cookie");

export default {
  name: "header-menu",
  props: ["feeds", "currentFeed"],
  methods: {
    logout: function() {
      Cookies.remove("jwt");
      Cookies.remove("id");
      this.$eventHub.$emit("auth");
    }
  }
};
</script>
<style scoped>
.feeds {
  position: absolute;
  left: -4px;
  top: 88px;
  border: 4px solid lightgrey;
  padding: 30px;
  background: white;
  z-index: 999;
  max-width: 80%;
  overflow-x: hidden;
  overflow-y: visible;
}
.backdrop {
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  z-index: -1;
}
.feed {
  white-space: nowrap;
  padding: 0.8em 10px;
  font-size: 1.2em;
  border-bottom: 2px solid lightgrey;
}
.feed.is-active {
  font-weight: bold;
}
.feed:last-child {
  border-bottom: none;
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
.u-inline {
  display: inline-block;
}
</style>
