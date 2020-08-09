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
      Cookies.remove("refresh");
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
      base: "https://cors-anywhere.herokuapp.com/https://www.inoreader.com/reader/api/0/",
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
      request.open("GET", self.base + "subscription/list", true);
      request.setRequestHeader("authorization", "Bearer " + self.jwt);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);
          for (var index = 0; index < resp.subscriptions.length; index++) {
            self.feeds.push({
              name: resp.subscriptions[index].title,
              index: index,
              id: resp.subscriptions[index].id
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
          "stream/contents/" +
          self.feeds[self.currentFeed].id,
        true
      );
      request.setRequestHeader("authorization", "Bearer " + self.jwt);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);
          console.log(resp)

          self.articles = [];
          for (var index = 0; index < resp.items.length; index++) {
            self.articles.push({
              title: resp.items[index].title,
              date: resp.items[index].published / 1000,
              content: resp.items[index].summary.content,
              url: resp.items[index].canonical[0].href,
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

var Login = Vue.component("login", {
  name: "login",
  template: "#login-template",
  data: function data() {
    return {
      base: "https://www.inoreader.com/oauth2/",
      corsBase: "https://cors-anywhere.herokuapp.com/https://www.inoreader.com/oauth2/"
    };
  },
  mounted () {
    if (window.location.search) {
      var params = new URLSearchParams(window.location.search);
      var code = params.get('code');
      if (code) {
        this.login(code);
      }
    }
  },
  methods: {
    authorize: function authorize() {
      window.location.href = this.base + "auth?client_id=999999573&redirect_uri=" + encodeURIComponent(window.location.origin) + "&response_type=code&state=" + new Date().getTime();
    },
    login: function login(code) {
      var self = this;

      var request = new XMLHttpRequest();
      request.open("POST", self.corsBase + "token", true);
      request.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);
          Cookies.set("jwt", resp.access_token, { expires: (resp.expires_in / 60 / 60 / 24) });
          Cookies.set("refresh", resp.refresh_token, { expires: 99999 });
          self.$eventHub.$emit("auth");
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
      };

      request.send(
        "code=" + code + "&redirect_uri=" + window.location.origin + "&client_id=999999573&client_secret=uJxB8QkYD4i9yKG0R1XSSJjdM06EMPHb&scope=&grant_type=authorization_code"
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
      if (!this.jwt) {
        var refresh = Cookies.get("refresh");
        if (refresh) {
          this.refreshToken(refresh)
        }
      }
      this.auth = !(this.jwt == null);
    },
    refreshToken: function refreshToken(refresh) {
      var self = this;

      var request = new XMLHttpRequest();
      request.open("POST", "https://www.inoreader.com/oauth2/token", true);
      request.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var resp = JSON.parse(request.response);
          Cookies.set("jwt", resp.access_token, { expires: (expires_in / 60 / 60 / 24) });
          Cookies.set("refresh", resp.refresh_token, { expires: 99999 });
          self.$eventHub.$emit("auth");
        } else {
          // We reached our target server, but it returned an error
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
      };

      request.send(
        "client_id=999999573&client_secret=uJxB8QkYD4i9yKG0R1XSSJjdM06EMPHb&grant_type=refresh_token&refresh_token=" + refresh
      );
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
