<template>
  <div class="feed-item" @click="$eventHub.$emit('get-article', article.id)">
    <div class="feed-item__date">
      {{ timeSince(article.date) }} ago
    </div>
    <div class="feed-item__title">
      {{ article.title }}
    </div>
  </div>
</template>

<script>
export default {
  name: "feed-item",
  props: ["article"],
  methods: {
    timeSince: function(date) {
      var seconds = Math.floor(new Date().getTime() / 1000 - date),
        interval = Math.floor(seconds / 2592000);
      if (interval >= 1)
        return interval + " month" + (interval == 1 ? "" : "s");

      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval + " day" + (interval == 1 ? "" : "s");

      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval + " hour" + (interval == 1 ? "" : "s");

      interval = Math.floor(seconds / 60);
      return interval + " minute" + (interval == 1 ? "" : "s");
    }
  }
};
</script>
<style scoped>
.feed-item {
  overflow: hidden;
  height: 216px;
  width: 50%;
  float: left;
  padding: 10px;
  font-size: 1.1em;
  margin: 0 -5px;
}
.feed-item__date {
  font-family: "Bookerly", Helvetica, Arial, sans-serif;
  color: darkgrey;
  padding: 7px 0px;
  font-size: 0.8em;
}
.feed-item__date:after {
  content: "";
  width: 80px;
  height: 2px;
  display: block;
  background: lightgrey;
  margin-top: 10px;
}
.feed-item__title {
  color: #111;
  text-decoration: none;
  cursor: pointer;
  line-height: 1.2em;
  font-size: 1.2em;
  pointer-events: none;
  padding-right: 20px;
}
</style>
