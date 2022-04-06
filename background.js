'use strict';
/** alarms in Storage API
 * alarmName: string, key
 * tabId: int
 * duration: int
 */

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
  const { width: w, height: h } = img;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

// cannot use async/await here since the message port listening for the response will timeout
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    const tabId = tabs[0].id;
    switch (request.msg) {
      case "startTimer":
        console.log(`start alarm for tab ${tabId}`)
        const newAlarm = {
          alarmName: tabId + '',
          tabId: tabId,
          duration: request.initTime
        }
        chrome.alarms.create(newAlarm.alarmName, { when: Date.now() + newAlarm.duration });
        await deleteLocalAlarm(newAlarm.tabId);
        await storeNewAlarm(newAlarm);
        sendResponse();
        break;
      case "getTimer":
        const locallySavedAlarm = await findAlarmByTabId(tabId)
        if (!locallySavedAlarm) { sendResponse(); break; }
        chrome.alarms.get(locallySavedAlarm.alarmName, (alarm) => {
          if (alarm)
            sendResponse({ alarm, savedAlarmDuration: locallySavedAlarm.duration });
          else
            sendResponse();
        });
        break;
      case "cancelTimer":
        console.log(`cancel alarm for tab ${tabId}`)
        deleteAlarm(tabId);
        sendResponse();
        break;
      default:
        console.log('invalid msg');
        sendResponse();
    }
  });
  return true;
});

// https://developer.chrome.com/docs/extensions/reference/alarms/#method-create
// There's a 1 minute delay for alarms api
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const localAlarm = await findAlarmByName(alarm.name);
  await chrome.scripting.executeScript({
    target: { tabId: localAlarm.tabId },
    function: togglePlaybackState
  });
  deleteLocalAlarm(localAlarm.tabId);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  deleteAlarm(tabId);
});

chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  modifyTabId(addedTabId, removedTabId);
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

async function storeNewAlarm(newAlarm) {
  const alarms = await fetchAllStoredAlarms();
  alarms.push(newAlarm);
  await chrome.storage.local.set({ alarms });
}

async function fetchAllStoredAlarms() {
  const result = await chrome.storage.local.get('alarms');
  console.log(result)
  return result['alarms'] || [];
}

async function findAlarmByTabId(tabId) {
  const alarms = await fetchAllStoredAlarms();
  return alarms.find(x => x.tabId === tabId);
}

async function findAlarmByName(alarmName) {
  const alarms = await fetchAllStoredAlarms();
  return alarms.find(x => x.alarmName === alarmName);
}

async function deleteAlarm(tabId) {
  await chrome.alarms.clear(deleteLocalAlarm(tabId).alarmName);
}

async function deleteLocalAlarm(tabId) {
  const alarms = await fetchAllStoredAlarms();
  const idx = alarms.findIndex(x => x.tabId === tabId);
  const [alarm] = alarms.splice(idx, 1);
  await chrome.storage.local.set({ 'alarms': alarms });
  return alarm;
}

async function modifyTabId(newTabId, oldTabId) {
  const alarms = await fetchAllStoredAlarms();
  alarms.find(x => x.tabId === oldTabId).tabId = newTabId;
  await chrome.storage.local.set({ 'alarms': alarms });
}