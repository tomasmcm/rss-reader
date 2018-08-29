<template>
  <div id="feeds">
    <HeaderMenu :feeds="feeds" :currentFeed="currentFeed" v-if="showMenu" />
    <div class="feed-articles">
      <div class="feed-title" @click="showMenu = !showMenu">
        {{ (feeds[currentFeed]) ? feeds[currentFeed].name : "" }}
      </div>
      <FeedItem v-for="article in articles" :article="article" :key="article.id" />
    </div>
    <div class="article-container" v-if="article">
      <div class="article-content" @click="doNothing">
        <p class="article-content__date">
          {{ new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" }) + " " + new Date(article.date).toLocaleTimeString("en-GB", { hour12: "numeric", minute: "numeric" }) }}
        </p>
        <h1 class="article-content__title">
          {{ article.title }}
        </h1>
        <div class="article-content__toolbar">
          <p class="article-content__author">
            {{ (feeds[currentFeed]) ? feeds[currentFeed].name : "" }}
          </p>
          <a class="article-content__source" :href="article.url">View Source</a>
        </div>
        <br>
        <img :src="article.image" alt="">
        <br>
        <div class="article-content__html" v-html="article.content"></div>
      </div>
      <div class="feed-bar">
        <div class="feed-bar__item feed-bar__up" @click="scrollUp"></div>
        <div class="feed-bar__item feed-bar__down" @click="scrollDown"></div>
        <div class="feed-bar__item feed-bar__close" @click="closeArticle"></div>
      </div>
    </div>
    <div class="feed-bar">
      <div class="feed-bar__item feed-bar__up" @click="previousFeed"></div>
      <div class="feed-bar__item feed-bar__down" @click="nextFeed"></div>
    </div>
  </div>
</template>

<script>
import HeaderMenu from "./HeaderMenu.vue";
import FeedItem from "./FeedItem.vue";

export default {
  name: "container",
  props: ["jwt"],
  data: function() {
    return {
      base: "https://winds-prod.getstream.io/",
      feeds: [],
      articles: [],
      currentFeed: parseInt(window.location.hash.substr(1)) || 0,
      showMenu: false,
      article: null,
      isLoading: false
    };
  },
  created() {
    this.$eventHub.$on("load-feed", this.loadFeed);
    this.$eventHub.$on("hide-menu", this.hideMenu);
    this.$eventHub.$on("get-article", this.getArticle);
  },
  beforeDestroy() {
    this.$eventHub.$off("load-feed");
    this.$eventHub.$off("hide-menu");
    this.$eventHub.$off("get-article");
  },
  mounted() {
    this.getFeeds();
  },
  methods: {
    getFeeds: function() {
      var self = this;
      $.ajax({
        url: self.base + "follows?type=rss",
        type: "get",
        dataType: "json",
        headers: {
          authorization: "Bearer " + self.jwt
        },
        contentType: "application/json"
      })
        .done(function(data) {
          $.each(data, function(index) {
            self.feeds.push({
              name: data[index].rss.description,
              index: index,
              id: data[index].rss._id
            });
          });
        })
        .then(function() {
          self.getArticles();
        });
    },
    getArticles: function() {
      var self = this;
      $.ajax({
        url:
          self.base +
          "articles?page=1&per_page=10&rss=" +
          self.feeds[self.currentFeed].id +
          "&sort_by=publicationDate,desc",
        type: "get",
        dataType: "json",
        headers: {
          authorization: "Bearer " + self.jwt
        },
        contentType: "application/json"
      }).done(function(data) {
        self.articles = [];
        $.each(data, function(index) {
          var date = new Date(data[index].publicationDate);

          self.articles.push({
            title: data[index].title,
            date: date.getDate() + "·" + ("0" + (date.getMonth() + 1)).slice(-2),
            time: date.getHours() + "h" + ("0" + date.getMinutes()).slice(-2),
            id: data[index]._id
          });
        });
        window.location.hash = self.currentFeed;
      });
    },
    getArticle: function(article_id) {
      if (this.isLoading) return;

      var self = this;
      self.isLoading = true;
      $.ajax({
        url: self.base + "articles/" + article_id + "?type=parsed",
        type: "get",
        dataType: "json",
        headers: {
          authorization: "Bearer " + self.jwt
        },
        contentType: "application/json"
      }).done(function(data) {
        self.isLoading = false;
        self.article = {
          title: data.title,
          url: data.url,
          image: data.image,
          content: data.content,
          date: data.publicationDate
        };
      });
    },
    previousFeed: function() {
      this.currentFeed = this.currentFeed - 1;
      if (this.currentFeed < 0) this.currentFeed = this.feeds.length - 1;
      this.getArticles();
    },
    nextFeed: function() {
      this.currentFeed = (this.currentFeed + 1) % this.feeds.length;
      this.getArticles();
    },
    loadFeed: function(id) {
      this.hideMenu();
      this.currentFeed = id;
      this.getArticles();
    },
    hideMenu: function() {
      this.showMenu = false;
    },
    closeArticle: function(event) {
      event.stopPropagation();
      this.article = null;
    },
    scrollUp: function(event) {
      event.preventDefault();
      event.stopPropagation();
      $(".article-content")[0].scrollTop -= window.innerHeight * 0.8;
    },
    scrollDown: function(event) {
      event.preventDefault();
      event.stopPropagation();
      $(".article-content")[0].scrollTop += window.innerHeight * 0.8;
    },
    doNothing: function(event) {
      event.stopPropagation();
    }
  },
  components: {
    HeaderMenu,
    FeedItem
  }
};
</script>

<style>
.feed-articles {
  width: 100%;
}

.feed-title {
  letter-spacing: 30px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 1.8em;
  padding: 20px 20px;
  padding-left: 132px;
  border-bottom: 4px solid lightgrey;
  height: 92px;
  text-align: center;
  text-transform: uppercase;
  text-shadow: -5px 5px 0 lightgrey;
}
.feed-title:before {
  content: "";
  background-size: 50%;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
  height: 92px;
  width: 92px;
  top: 0px;
  left: 0px;
  border-right: 4px solid lightgrey;
}

.feed-bar {
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: white;
  height: 100px;
  white-space: nowrap;
  font-size: 0px;
}
.feed-bar__item {
  text-align: center;
  border-right: 4px solid black;
  border-top: 4px solid black;
  display: inline-block;
  height: 100px;
  padding: 20px 0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 50px;
}
.feed-bar__item:last-child {
  border-right: none;
}
/* first level of total 2 levels */
.feed-bar__item:nth-child(1):nth-last-child(2),
/* second level of total 2 levels */
.feed-bar__item:nth-child(2):nth-last-child(1) {
  width: 50%;
}
/* first level of total 3 levels */
.feed-bar__item:nth-child(1):nth-last-child(3),
/* second level of total 3 levels */
.feed-bar__item:nth-child(2):nth-last-child(2),
/* third level of total 3 levels */
.feed-bar__item:nth-child(3):nth-last-child(1) {
  height: 100px;
  width: 33.3%;
}
/* first level of total 3 levels */
.feed-bar__item:nth-child(1):nth-last-child(3),
/* second level of total 3 levels */
.feed-bar__item:nth-child(2):nth-last-child(2) {
  padding: 34px 0px;
}
/* third level of total 3 levels */
.feed-bar__item:nth-child(3):nth-last-child(1) {
  font-size: 50px;
  padding: 24px 0px;
}

.article-container {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  background: white;
}
.article-container .feed-bar {
  z-index: 1;
}
.article-content {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  background: white;
  font-size: 1.5em;
  line-height: 1.6em;
  padding: 50px;
  padding-bottom: 110px;
  z-index: 1;
  height: 1168px;
  height: calc(100vh - 100px);
  overflow: scroll;
}
.article-content__title {
  font-size: 1.6em;
  line-height: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
}
.article-content__date {
  font-size: 0.8em;
  color: grey;
  margin-bottom: 30px;
}
.article-content__date:after {
  content: "";
  width: 80px;
  height: 4px;
  background: lightgrey;
  display: block;
  margin-top: 10px;
}
.article-content__toolbar {
  display: -webkit-box;
  -webkit-box-pack: justify;
}
.article-content__author {
  font-size: 0.7em;
  color: grey;
  margin-bottom: 10px;
}
.article-content__source {
  font-size: 0.8em;
}
.article-content__html p {
  margin-bottom: 40px;
}
.article-content img {
  max-width: 100% !important;
  display: block;
  height: auto !important;
}
.article-content__html h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
}
.article-content__html pre {
  font-family: monospace;
  font-size: 0.4em;
  white-space: normal;
}
</style>
