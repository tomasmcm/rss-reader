var feedsLibrary = {
  "Engadget": "http://www.engadget.com/rss-full.xml",
  "Hacker News": "http://news.ycombinator.com/rss",
  "Adafruit": "http://www.adafruit.com/blog/feed/",
  "Hackaday": "http://www.hackaday.com/rss.xml",
  "The Verge": "http://www.theverge.com/rss/index.xml",
  "9to5Mac": "http://9to5mac.com/feed/",
  "MacRumors": "http://www.macrumors.com/macrumors.xml"
}

var articlesElement = $(".articles");

// $.each(feedsLibrary, function(feedName, feedUrl) {
//   getFeed(feedName, feedUrl);
// })
var currentFeed = 0, feedName, feedUrl

function init(){
  feedName = Object.keys(feedsLibrary)[currentFeed]
  feedUrl = feedsLibrary[feedName]
  getFeed(feedName, feedUrl)
}
init()

window.previousFeed = function(e){
  currentFeed = (currentFeed - 1) % Object.keys(feedsLibrary).length
  articlesElement.html("")
  init()
}
window.nextFeed = function(e){
  currentFeed = (currentFeed + 1) % Object.keys(feedsLibrary).length
  articlesElement.html("")
  init()
}

function getFeed(feedName, feedUrl){
  var baseUrl = "http://query.yahooapis.com/v1/public/yql?q="
  var queryString = encodeURI("SELECT * FROM feed WHERE url='" + feedUrl + "' LIMIT 10")
  var format = "&format=json"

  var rssFeedPath = baseUrl + queryString + format

  $.getJSON(rssFeedPath, function(response) {
    var feedItems = response.query.results.item
    if(typeof feedItems == "undefined") feedItems = response.query.results.entry
    var titleBar = $('<div class="feed-title">'+feedName+'</div>')
    var itemSource = $('<p class="feed-source">' + feedName + '</p>')
    articlesElement.append(titleBar)

    var articleBar = $('<div class="feed-bar"><div class="feed-bar__item feed-bar__up" onclick="scrollUp()"><svg viewBox="0 0 24 24" style="width:50px;height:50px;"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg></div><div class="feed-bar__item feed-bar__down" onclick="scrollDown()"><svg viewBox="0 0 24 24" style="width:50px;height:50px;"><path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"></path></svg></div><div class="feed-bar__item feed-bar__close" onclick="closeArticle()">×</div></div>')

    $.each(feedItems, function( index ) {
      var item = feedItems[index]
      var itemElement = $('<div class="feed-item" onclick="openArticle()"></div>')
      var itemLink = $('<p class="feed-link" href="' + item.link + '">' + item.title +'</p>')
      
      var itemContent
      if(typeof item.encoded != "undefined"){
        itemContent = $('<div class="feed-content u-hidden"><h1 class="feed-content__title">' + item.title + '</h1>' + item.encoded + '</div>')
      } else if(typeof item.description == "undefined"){
        itemContent = $('<div class="feed-content u-hidden"><h1 class="feed-content__title">' + item.title + '</h1>' + item.content.content + '</div>')
      } else {
        itemContent = $('<div class="feed-content u-hidden"><h1 class="feed-content__title">' + item.title + '</h1>' + item.description + '</div>')
      }
      itemContent.append(articleBar.clone())
      
      itemElement.append(itemLink, itemContent)
      articlesElement.append(itemElement)
    })
  })
}

window.closeArticle = function(){
  event.stopPropagation()
  event.target.parentElement.parentElement.classList.add("u-hidden");
}

window.openArticle = function(){
  event.preventDefault()
  event.target.lastChild.classList.toggle("u-hidden");
}

window.scrollUp = function(){
  event.preventDefault()
  event.stopPropagation();
  event.target.parentElement.parentElement.scrollTop -= window.innerHeight * 0.6
}

window.scrollDown = function(){
  event.preventDefault()
  event.stopPropagation();
  event.target.parentElement.parentElement.scrollTop += window.innerHeight * 0.6
}