<template>
  <div class="feed-item" @click="$eventHub.$emit('get-article', article.id)">
    <div class="feed-item__title">
      {{ article.title }}
    </div>
    <div class="feed-item__date">
      {{ timeSince(article.date) }} ago
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
  border-bottom: 4px solid lightgrey;
  overflow: hidden;
  height: 108px;

  padding: 10px 20px;
  font-size: 1.1em;
  position: relative;
  display: flex;
}
.feed-item__date {
  font-family: "Bookerly", Helvetica, Arial, sans-serif;
  color: grey;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 7px 10px;
  white-space: nowrap;
}
.feed-item__title {
  color: #111;
  text-decoration: none;
  cursor: pointer;
  line-height: 1.2em;
  font-size: 1.2em;
  pointer-events: none;
  padding: 0 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
