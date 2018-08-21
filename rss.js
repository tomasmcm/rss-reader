/*

Login
https://winds-prod.getstream.io/auth/login
base + "auth/login"

Get Feeds
https://winds-prod.getstream.io/follows?type=rss
base + "follows?type=rss"

Get Articles from all feeds
https://winds-prod.getstream.io/users/<user_id>/feeds?page=1&per_page=10&type=article
base + "users/" + id + "/feeds?page=0&per_page=10&type=article"

Get Articles from feed
https://winds-prod.getstream.io/articles?page=1&per_page=10&rss=<feed_id>&sort_by=publicationDate,desc
base + "articles?page=1&per_page=10&rss=" + <feed_id> + "&sort_by=publicationDate,desc"

Get Article content
https://winds-prod.getstream.io/articles/<article_id>?type=parsed

*/

var base = "https://winds-prod.getstream.io/";
var loading = false;

var currentFeed = 0;
var articlesElement = $(".articles");
var articleElement = $(".article-container");
var feedsElement = $(".feeds");
currentFeed = parseInt(window.location.hash.substr(1)) || 0

function init(){
  if (Cookies.get('jwt') == null) {
    $('.login').show();
  } else {
    $('.login').hide();
    
    getFeeds();
  }
}
init();


$("#login_button").click(function(){
  $.ajax({
    url : base + "auth/login",
    type: "post",
    dataType: "json",
    data: '{"email":"' + $('#email').val() + '","password":"' + $('#pass').val() + '"}',
    contentType: "application/json"
  }).done(function(data){
    Cookies.set('jwt', data.jwt, { expires: 99999 });
    Cookies.set('id', data._id, { expires: 99999 });
    init();
  })
});

$("#logout_button").click(function(){
  Cookies.remove('jwt');
  Cookies.remove('id');
  feedsElement.hide();
  currentFeed = 0;
  articlesElement.html("");
  window.location.hash = currentFeed
  init();
});

function getFeeds(){
  $.ajax({
    url : base + "follows?type=rss",
    type: "get",
    dataType: "json",
    headers: {
      "authorization": "Bearer " + Cookies.get('jwt')
    },
    contentType: "application/json"
  }).done(function(data){
    
    if(!window.feeds) window.feeds = [];
    
    $.each(data, function( index ) {
      
      window.feeds.push({
        name: data[index].rss.description,
        id: data[index].rss._id
      })
      
      appendFeed(data[index], index);
    });
  }).then(function(){
    getArticles();
  });
}

function appendFeed(item, index) {
  var feedElement = $('<div class="feed" onclick="loadFeed(\'' + index + '\')">' + item.rss.description +'</div>')
  feedsElement.append(feedElement)
}

function getArticles(){
  $.ajax({
    url : base + "articles?page=1&per_page=10&rss=" + window.feeds[currentFeed].id + "&sort_by=publicationDate,desc",
    type: "get",
    dataType: "json",
    headers: {
      "authorization": "Bearer " + Cookies.get('jwt')
    },
    contentType: "application/json"
  }).done(function(data){
    console.log(data);
    appendArticles(data);
  })
}

function appendArticles(items) {
  articlesElement.html("");
  window.location.hash = currentFeed
  
  var titleBar = $('<div class="feed-title" onclick="toggleMenu()">' + window.feeds[currentFeed].name + '</div>')
  articlesElement.append(titleBar);

  $.each(items, function( index ) {
    var item = items[index]
    var itemElement = $('<div class="feed-item" onclick="getArticle(\'' + item._id + '\')"></div>')
    var date = new Date(item.publicationDate)
    date = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year:'numeric' }) + " " + date.toLocaleTimeString('en-GB', {hour12: 'numeric', minute: 'numeric'})
    var itemName = $('<div class="feed-label"><p class="feed-link">' + item.title +'</p><small class="feed-date">' + date.slice(0, -3) + '</small></div>')
    
    itemElement.append(itemName)
    articlesElement.append(itemElement)
  })
}

window.getArticle = function(article_id) {
  if(loading) return;
  
  loading = true;
  $.ajax({
    url : base + "articles/" + article_id + "?type=parsed",
    type: "get",
    dataType: "json",
    headers: {
      "authorization": "Bearer " + Cookies.get('jwt')
    },
    contentType: "application/json"
  }).done(function(data){
    console.log(data);
    loading = false;
    appendArticle(data);
  })
}

var articleBar = $('<div class="feed-bar"><div class="feed-bar__item feed-bar__up" onclick="scrollUp()"></div><div class="feed-bar__item feed-bar__down" onclick="scrollDown()"></div><div class="feed-bar__item feed-bar__close" onclick="closeArticle()"></div></div>')

function appendArticle(item) {
  var itemContent = $('<div class="feed-content" onclick="doNothing()"><h1 class="feed-content__title">' + item.title + '</h1><a href="' + item.url + '">Source</a><br>' + item.content + '</div>')
  itemContent.append(articleBar.clone())
  
  articleElement.append(itemContent);
  articleElement.show();
}

window.closeArticle = function(){
  event.stopPropagation()
  
  articleElement.hide();
  articleElement.html("");
}

window.scrollUp = function(){
  event.preventDefault()
  event.stopPropagation()
  $(".feed-content")[0].scrollTop -= window.innerHeight * 0.8
}

window.scrollDown = function(){
  event.preventDefault()
  event.stopPropagation()
  $(".feed-content")[0].scrollTop += window.innerHeight * 0.8
}

window.doNothing = function(){
  event.stopPropagation()
}

window.previousFeed = function(e){
  currentFeed = (currentFeed - 1)
  if (currentFeed < 0) currentFeed = window.feeds.length-1
  getArticles();
}
window.nextFeed = function(e){
  currentFeed = (currentFeed + 1) % window.feeds.length
  getArticles();
}
window.loadFeed = function(id){
  feedsElement.hide();
  currentFeed = id
  getArticles();
}

$(".backdrop").click(function(e){
  console.log(e);
  feedsElement.hide();
});

window.toggleMenu = function(){
  feedsElement.toggle();
}