'use strict';

// needs to be var to be accessible from popup.js
var matches;

function setBadge(text) {
  if (text === '0') {
    text = '';
  }

  chrome.browserAction.setBadgeText({
    text
  });
}

let loadingBadge = (function () {
  let showLoading = false;
  return {
    show() {
      if (showLoading) {
        return;
      }
      showLoading = true;

      let text = '    ...'.split('');

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
    hide() {
      showLoading = false;
      setBadge('');
    }
  }
}());

function loadSettings() {
  let settingsLoader = jQuery.Deferred();

  settingsLoader.done(function (settings) {
  });

  chrome.storage.local.get(defaultSettings, function (settings) {
    settingsLoader.resolve(settings);
  });
  return settingsLoader.promise();
}

function saveSettings(settings) {
  chrome.storage.local.set(settings, function () {
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

      let parsedMatches = matchesData.find('#m2v-1');
      parsedMatches.find('.p_video > span').remove();
      parsedMatches.children('.clear').remove();

      let matchesDivs = parsedMatches.find('.p_video')
        .toArray()
        .sort((div1, div2) => getMatchID(div2) - getMatchID(div1));
      let parsedIds = matchesDivs.map(getMatchID);

      console.groupCollapsed('response');
      console.log(parsedMatches);
      console.groupEnd('response');
      console.log(settings.latestMatch, parsedIds);

      let newMatches = [];
      if (settings.latestMatch !== 0) {
        newMatches = parsedIds.filter(id => id > settings.latestMatch);
      }

      setBadge(String(newMatches.length));

      settings.latestMatch = parsedIds[0];
      saveSettings(settings);

      matches = jQuery('<div></div>')
        .append(matchesDivs)
        .html();

      chrome.runtime.sendMessage({ matches });
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

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: "Check now!",
  contexts: ["browser_action"],
  onclick: initCheck
});
