'use strict';

var bg = chrome.extension.getBackgroundPage();
var $matches = jQuery('#matches');

function insertMatches(matches) {
  matches = matches || bg.matches;

  bg.setBadge('');

  if (!matches) {
    $matches.html('No new match reviews. Surf to <a href="http://footballhd.ru">http://footballhd.ru</a> to see all reviews');
    return;
  }

  bg.saveSettings({ latestMatch: bg.getMatchID(jQuery(matches)[0]) });
  matches = matches.replace(/<img src="/g, '<img src="' + football);
  $matches
    .empty()
    .append('<h3>New reviews:</h3>')
    .append(matches);
}

insertMatches();
chrome.runtime.onMessage.addListener(function (request) {
  insertMatches(request.matches);
});

jQuery(document).on('click', 'a', function (e) {
  e.preventDefault();
  chrome.tabs.create({
    url: this.getAttribute('href')
  });
});
