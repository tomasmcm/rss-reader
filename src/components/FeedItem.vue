<template>
  <div class="feed-item" @click="$eventHub.$emit('get-article', article.id)">
    <div class="feed-item__date">
      {{ article.time }}
      <small>
        {{ article.date }}
      </small>
    </div>
    <div class="feed-item__title">
      {{ article.title }}
    </div>
  </div>
</template>

<script>
export default {
  name: "feed-item",
  props: ["article"]
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
  display: -webkit-box;
}
.feed-item__date {
  font-size: 1.6em;
  font-family: "Bookerly", Helvetica, Arial, sans-serif;
  color: grey;
}
.feed-item__date small {
  font-size: 0.5em;
  letter-spacing: 0.8em;
  display: block;
  margin-top: 5px;
}
.feed-item__title {
  color: #111;
  text-decoration: none;
  cursor: pointer;
  line-height: 1.2em;
  font-size: 1.2em;
  pointer-events: none;
  padding: 0 10px;
  -webkit-box-flex: 1;
}
</style>
