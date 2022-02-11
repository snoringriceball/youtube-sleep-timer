'use strict';
const alarms = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(async () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlMatches: 'https://.*\.youtube\.com' },
          })
        ],
        actions: [
          new chrome.declarativeContent.SetIcon({
            imageData: {
              16: await loadImageData("images/clock_16.png"),
              32: await loadImageData("images/clock_32.png"),
              48: await loadImageData("images/clock_48.png"),
              128: await loadImageData("images/clock_128.png")
            }
          }),
          chrome.declarativeContent.ShowAction
            ? new chrome.declarativeContent.ShowAction()
            : new chrome.declarativeContent.ShowPageAction()
        ]
      }
    ]);
  });
});

// SVG icons aren't supported yet
async function loadImageData(url) {
  const img = await createImageBitmap(await (await fetch(url)).blob());
  const {width: w, height: h} = img;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

// cannot use async/await here since the message port listening for the response will timeout
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // stores alarms in object form, indicates tabId and init alarm duration
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id + '';
    switch (request.msg) {
      case "startTimer":
        console.log(`start alarm for tab ${tabId}`)
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
        console.log(`cancel alarm for tab ${tabId}`)
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