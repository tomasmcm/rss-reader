"use strict";

var Container = Vue.component("container", {
  name: "container",
  template: "#container-template",
  props: ["jwt"],
  data: function data() {
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
    this.getFeeds();
  },

  methods: {
    getFeeds: function getFeeds() {
      var self = this;

      var request = new XMLHttpRequest();
      request.open("GET", self.base + "follows?type=rss", true);
      request.setRequestHeader("authorization", "Bearer " + self.jwt);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);
          for (var index = 0; index < resp.length; index++) {
            self.feeds.push({
              name: resp[index].rss.description,
              index: index,
              id: resp[index].rss._id
            });
          }
          self.getArticles();
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
      };

      request.send();
    },
    getArticles: function getArticles() {
      var self = this;

      var request = new XMLHttpRequest();
      request.open(
        "GET",
        self.base +
          "articles?page=1&per_page=10&rss=" +
          self.feeds[self.currentFeed].id +
          "&sort_by=publicationDate,desc",
        true
      );
      request.setRequestHeader("authorization", "Bearer " + self.jwt);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);

          self.articles = [];
          for (var index = 0; index < resp.length; index++) {
            self.articles.push({
              title: resp[index].title,
              date: Math.round(
                new Date(resp[index].publicationDate).getTime() / 1000
              ),
              id: resp[index]._id
            });
          }
          window.location.hash = self.currentFeed;
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
      };

      request.send();
    },
    getArticle: function getArticle(article_id) {
      if (this.isLoading) return;

      var self = this;
      self.isLoading = true;

      var request = new XMLHttpRequest();
      request.open(
        "GET",
        self.base + "articles/" + article_id + "?type=parsed",
        true
      );
      request.setRequestHeader("authorization", "Bearer " + self.jwt);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);

          self.isLoading = false;
          self.article = {
            title: resp.title,
            url: resp.url,
            image: resp.image,
            content: resp.content,
            date: resp.publicationDate
          };
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
      };

      request.send();
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
