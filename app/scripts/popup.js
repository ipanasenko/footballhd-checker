'use strict';

var bg = chrome.extension.getBackgroundPage();
var $matches = jQuery('#matches');

function insertMatches(matches) {
  matches = matches || bg.matches;

  bg.setBadge('');

  if (!matches) {
    $matches.html('checking for new matches...');
    return;
  }

  bg.saveSettings({ latestMatch: bg.getMatchID(jQuery(matches)[0]) });
  matches = matches.replace(/<img src="/g, '<img src="' + football);
  $matches.html(matches);
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
