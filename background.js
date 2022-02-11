'use strict';
const alarms = {};

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlMatches: 'https://*.youtube.com' },
      })
      ],
      actions: [
        chrome.declarativeContent.ShowAction
        ? new chrome.declarativeContent.ShowAction()
        : new chrome.declarativeContent.ShowPageAction()
      ]
    }]);
  });
});


// cannot use async/await here since the message port listening for the response will timeout
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // stores alarms in object form, indicates tabId and init alarm duration
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id + '';
    switch (request.msg) {
      case "startTimer":
        chrome.alarms.create(tabId, { when: Date.now() + request.initTime });
        alarms[tabId] = request.initTime;
        sendResponse();
        break;
      case "getTimer":
        chrome.alarms.get(tabId, (alarm) => {
          if (alarm)
            sendResponse({ alarm, savedAlarmDuration: alarms[tabId] });
          else
            sendResponse();
        });
        break;
      case "cancelTimer":
        chrome.alarms.clear(tabId);
        sendResponse();
        delete alarms[tabId];
        break;
      default:
        console.log('invalid msg');
        sendResponse();
    }
  });
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.scripting.executeScript({
    target: { tabId: parseInt(alarm.name) },
    function: togglePlaybackState
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.alarms.clear(tabId.toString());
  delete alarms[tabId];
});

async function togglePlaybackState() {
  const musicButton = document.getElementsByClassName('play-pause-button')[0];
  if (musicButton) {
    //youtube music
    musicButton.click()
  } else {
    //youtube
    document.getElementsByClassName('ytp-play-button')[0].click();
  }
}