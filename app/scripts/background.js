'use strict';

var matches;

function setBadge(text) {
  text = text || '';

  chrome.browserAction.setBadgeText({
    text: text.toString()
  });
}

var loadingBadge = (function () {
  var showLoading = false;
  return {
    show: function () {
      if (showLoading) {
        return;
      }
      showLoading = true;

      var text = '    ...'.split('');

      (function update() {
        if (!showLoading) {
          return;
        }

        setBadge(text.join(''));
        setTimeout(function () {
          text.push(text.shift());
          update();
        }, 100);
      }());
    },
    hide: function () {
      showLoading = false;
      setBadge('');
    }
  }
}());

function loadSettings() {
  var settingsLoader = jQuery.Deferred();

  settingsLoader.done(function (settings) {
    console.log('settings loaded:', settings);
  });

  chrome.storage.local.get(defaultSettings, function (settings) {
    settingsLoader.resolve(settings);
  });
  return settingsLoader.promise();
}

function saveSettings(settings) {
  console.log(settings);
  chrome.storage.local.set(settings, function () {
    console.log('saved');
  });
}

function getMatchID(matchDiv) {
  return +jQuery(matchDiv).children('a')[0].href.match(/\/(\d+)-/)[1];
}

function loadMatchesPage(matchPage) {
  return jQuery
    .when(loadSettings(), jQuery.get(matchPage))
    .always(loadingBadge.hide)
    .then(function (settings, matchesData) {
      matchesData = jQuery(matchesData[0]);

      var parsedMatches = matchesData.find('#m2v-1');
      parsedMatches.find('.p_video > span').remove();
      parsedMatches.children('.clear').remove();

      var matchesDivs = parsedMatches.find('.p_video');
      var parsedIds = matchesDivs
        .toArray()
        .map(getMatchID)
        .sort()
        .reverse();

      console.groupCollapsed('response');
      console.log(parsedMatches);
      console.groupEnd('response');
      console.log(settings.latestMatch, parsedIds);

      var newMatches = [];
      if (settings.latestMatch !== 0) {
        newMatches = parsedIds.filter(function (id) {
          return id > settings.latestMatch;
        });
      }

      setBadge(newMatches.length);

      settings.latestMatch = parsedIds[0];
      saveSettings(settings);

      matches = jQuery('<div></div>')
        .append(matchesDivs.filter(function (div) {
          return newMatches.indexOf(getMatchID(this)) !== -1;
        }))
        .html();

      chrome.runtime.sendMessage({ matches: matches });
    });
}

function initCheck() {
  loadingBadge.show();
  loadMatchesPage(footballify('/'));
}

initCheck();
chrome.alarms.create('initCheck', {
  delayInMinutes: 60,
  periodInMinutes: 60
});
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'initCheck') {
    initCheck();
  }
});
