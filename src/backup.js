"use strict";

var FeedItem = Vue.component("feed-item", {
  name: "feed-item",
  template: "#feed-item-template",
  props: ["article"],
  methods: {
    timeSince: function timeSince(date) {
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
});

var HeaderMenu = Vue.component("header-menu", {
  name: "header-menu",
  template: "#header-menu-template",
  props: ["feeds", "currentFeed"],
});

var Container = Vue.component("container", {
  name: "container",
  template: "#container-template",
  props: ["jwt"],
  data: function data() {
    return {
      feeds: [
        {
          name: "Adafruit",
          url: "https://morss.it/:proxy:format=json:cors/www.adafruit.com/blog/feed/",
          index: 0
        },
        {
          name: "Engadget",
          url: "https://morss.it/:proxy:format=json:cors/https://feeds.proxeuse.com/?action=display&bridge=Engadget&format=Atom",
          index: 1
        },
        {
          name: "Hackaday",
          url: "https://morss.it/:proxy:format=json:cors/hackaday.com/feed/",
          index: 2
        },
        {
          name: "Hacker News",
          url: "https://morss.it/:proxy:format=json:cors/news.ycombinator.com/rss",
          index: 3
        },
        {
          name: "GSM Arena",
          url: "https://morss.it/:format=json:cors/www.gsmarena.com/rss-news-reviews.php3",
          index: 4
        },
        {
          name: "Gizmodo",
          url: "https://morss.it/:format=json:cors/https://gizmodo.com/rss",
          index: 5
        },
        {
          name: "The Verge",
          url: "https://morss.it/:proxy:format=json:cors/www.theverge.com/rss/full.xml",
          index: 6
        }
      ],
      articles: [],
      currentFeed: parseInt(window.location.hash.substr(1)) || 0,
      showMenu: false,
      article: null,
      isLoading: false
    };
  },
  created: function created() {
    this.$eventHub.$on("load-feed", this.loadFeed);
    this.$eventHub.$on("hide-menu", this.hideMenu);
    this.$eventHub.$on("get-article", this.getArticle);
  },
  beforeDestroy: function beforeDestroy() {
    this.$eventHub.$off("load-feed");
    this.$eventHub.$off("hide-menu");
    this.$eventHub.$off("get-article");
  },
  mounted: function mounted() {
    try {
      this.getArticles();
    } catch (error) {
      alert(error)
    }
  },

  methods: {
    getArticles: function getArticles() {
      var self = this;

      var request = new XMLHttpRequest();
      request.open(
        "GET",
        self.feeds[self.currentFeed].url,
        true
      );

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);
          console.log(resp)

          self.articles = [];
          for (var index = 0; index < resp.items.length; index++) {
            self.articles.push({
              title: resp.items[index].title,
              date: Math.round(
                new Date(resp.items[index].time).getTime() / 1000
              ),
              url: resp.items[index].url,
              content: (resp.items[index].desc || '') + (resp.items[index].content || ''),
            });
          }
          window.location.hash = self.currentFeed;
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
        console.log("trying again")
        self.getArticles()
      };

      request.send();
    },
    getArticle: function getArticle(article) {
      if (this.isLoading) return;

      var self = this;
      self.isLoading = true;
      self.article = {
        title: article.title,
        url: article.url,
        content: article.content,
        date: article.date
      };
      self.isLoading = false;
    },
    previousFeed: function previousFeed() {
      this.currentFeed = this.currentFeed - 1;
      if (this.currentFeed < 0) this.currentFeed = this.feeds.length - 1;
      this.getArticles();
    },
    nextFeed: function nextFeed() {
      this.currentFeed = (this.currentFeed + 1) % this.feeds.length;
      this.getArticles();
    },
    loadFeed: function loadFeed(id) {
      this.hideMenu();
      this.currentFeed = id;
      this.getArticles();
    },
    hideMenu: function hideMenu() {
      this.showMenu = false;
    },
    closeArticle: function closeArticle(event) {
      event.stopPropagation();
      this.article = null;
    },
    scrollUp: function scrollUp(event) {
      event.preventDefault();
      event.stopPropagation();
      this.$refs.articleContent.scrollTop -= window.innerHeight * 0.8;
    },
    scrollDown: function scrollDown(event) {
      event.preventDefault();
      event.stopPropagation();
      this.$refs.articleContent.scrollTop += window.innerHeight * 0.8;
    },
    doNothing: function doNothing(event) {
      event.stopPropagation();
    }
  },
  components: {
    HeaderMenu: HeaderMenu,
    FeedItem: FeedItem
  }
});

function ready(fn) {
  if (
    document.attachEvent
      ? document.readyState === "complete"
      : document.readyState !== "loading"
  ) {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(function() {
  Vue.prototype.$eventHub = new Vue();

  new Vue({
    el: "#app",
    render: function render(h) {
      return h(Container);
    }
  });
});
