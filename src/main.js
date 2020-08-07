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
  methods: {
    logout: function logout() {
      Cookies.remove("jwt");
      Cookies.remove("id");
      this.$eventHub.$emit("auth");
    }
  }
});

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
    try {
      this.getFeeds();
    } catch (error) {
      alert(error)
    }
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
          try {
            self.getArticles();
          } catch (error) {
            alert(error)
          }
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

var App = Vue.component("app", {
  name: "app",
  template:
    '<div id="app"><Login v-if="!auth" /><Container v-if="auth" :jwt="jwt" /></div>',
  data: function data() {
    return {
      auth: !(Cookies.get("jwt") == null),
      jwt: Cookies.get("jwt")
    };
  },
  created: function created() {
    this.$eventHub.$on("auth", this.checkAuth);
  },
  beforeDestroy: function beforeDestroy() {
    this.$eventHub.$off("auth");
  },

  methods: {
    checkAuth: function checkAuth() {
      this.jwt = Cookies.get("jwt");
      this.auth = !(this.jwt == null);
    }
  },
  components: {
    Login: Login,
    Container: Container
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
      return h(App);
    }
  });
});
