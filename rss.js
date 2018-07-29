var feedsLibrary = {
  "Engadget": "http://www.engadget.com/rss-full.xml",
  "Hacker News": "http://news.ycombinator.com/rss",
  "Adafruit": "http://www.adafruit.com/blog/feed/",
  "Hackaday": "http://www.hackaday.com/rss.xml",
  "The Verge": "http://www.theverge.com/rss/index.xml",
  "9to5Mac": "http://9to5mac.com/feed/",
  "MacRumors": "http://www.macrumors.com/macrumors.xml",
  "GSM Arena": "https://www.gsmarena.com/rss-news-reviews.php3",
  "A List Apart": "https://alistapart.com/main/feed"
}

var articlesElement = $(".articles");

// $.each(feedsLibrary, function(feedName, feedUrl) {
//   getFeed(feedName, feedUrl);
// })
var currentFeed = 0, feedName, feedUrl

currentFeed = parseInt(window.location.hash.substr(1)) || 0

function init(){
  articlesElement.html("")
  window.location.hash = currentFeed
  feedName = Object.keys(feedsLibrary)[currentFeed]
  feedUrl = feedsLibrary[feedName]
  getFeed(feedName, feedUrl)
}
init()

window.previousFeed = function(e){
  currentFeed = (currentFeed - 1)
  if (currentFeed < 0) currentFeed = Object.keys(feedsLibrary).length-1
  init()
}
window.nextFeed = function(e){
  currentFeed = (currentFeed + 1) % Object.keys(feedsLibrary).length
  init()
}

function getFeed(feedName, feedUrl){
  var baseUrl = "https://query.yahooapis.com/v1/public/yql?q="
  var queryString = encodeURI("SELECT * FROM feed WHERE url='" + feedUrl + "' LIMIT 10")
  var format = "&format=json"
  
  var rssFeedPath = baseUrl + queryString + format
  
  $.getJSON(rssFeedPath, function(response) {
    var feedItems = response.query.results.item
    if(typeof feedItems == "undefined") feedItems = response.query.results.entry
    var titleBar = $('<div class="feed-title">'+feedName+'</div>')
    var itemSource = $('<p class="feed-source">' + feedName + '</p>')
    articlesElement.append(titleBar)
    
    var articleBar = $('<div class="feed-bar"><div class="feed-bar__item feed-bar__up" onclick="scrollUp()"></div><div class="feed-bar__item feed-bar__down" onclick="scrollDown()"></div><div class="feed-bar__item feed-bar__close" onclick="closeArticle()"></div></div>')
    
    $.each(feedItems, function( index ) {
      var item = feedItems[index]
      var itemElement = $('<div class="feed-item" onclick="openArticle()"></div>')
      var date = item.pubDate || item.published || item.date;
      date = new Date(date)
      date = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year:'numeric' }) + " " + date.toLocaleTimeString('en-GB', {hour12: 'numeric', minute: 'numeric'})
      var itemLink = $('<div class="feed-label"><p class="feed-link" href="' + item.link + '">' + item.title +'</p><small class="feed-date">' + date.slice(0, -3) + '</small></div>')
      
      var itemContent;
      if(typeof item.encoded != "undefined"){
        articleContent = item.encoded;
      } else if(typeof item.description == "undefined"){
        articleContent = item.content.content;
      } else {
        articleContent = item.description;
      }
      
      var itemContent = $('<div class="feed-content u-hidden" onclick="doNothing()"><h1 class="feed-content__title">' + item.title + '</h1><a href="' + item.link + '">Source</a><br>' + articleContent + '</div>')
      itemContent.append(articleBar.clone())
      
      itemElement.append(itemLink, itemContent)
      articlesElement.append(itemElement)
    })
    textFit(document.getElementsByClassName('feed-label'), {multiLine: true, minFontSize:21, alignVert: true});
  })
}

window.closeArticle = function(){
  event.stopPropagation()
  var el = findParentWithClass(event.target, "feed-content");
  el.classList.add("u-hidden");
}

window.openArticle = function(){
  event.preventDefault()
  var el = findParentWithClass(event.target, "feed-item");
  el.lastChild.classList.toggle("u-hidden");
}

window.scrollUp = function(){
  event.preventDefault()
  event.stopPropagation()
  var el = findParentWithClass(event.target, "feed-content");
  el.scrollTop -= window.innerHeight * 0.8
}

window.scrollDown = function(){
  event.preventDefault()
  event.stopPropagation()
  var el = findParentWithClass(event.target, "feed-content");
  el.scrollTop += window.innerHeight * 0.8
}

window.doNothing = function(){
  event.stopPropagation()
}

function findParentWithClass(el, cls) {
  while ((el = el.parentNode) && el.className.indexOf(cls) < 0);
  return el;
}