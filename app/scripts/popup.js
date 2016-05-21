'use strict';

let bg = chrome.extension.getBackgroundPage();
let $matches = jQuery('#matches');

function insertMatches(matches) {
  matches = matches || bg.matches;

  bg.setBadge('');

  if (!matches) {
    $matches.html('No new match reviews. Surf to <a href="http://footballhd.ru">http://footballhd.ru</a> to see all reviews');
    return;
  }

  let latestMatch = bg.getMatchID(jQuery(matches)[0]);
  bg.saveSettings({ latestMatch });

  matches = matches.replace(/<img src="\/\//g, '<img src="http://');
  $matches
    .empty()
    .append('<h3>New reviews:</h3>')
    .append(jQuery('<div></div>').append(matches));
}

insertMatches();
chrome.runtime.onMessage.addListener(function (request) {
  insertMatches(request.matches);
});

jQuery(document).on('click', 'a', function (e) {
  e.preventDefault();
  chrome.tabs.create({
    url: 'http:' + this.getAttribute('href')
  });
});
