'use strict';
const minToMs = 60000;
const hrToMs = 3600000;

window.addEventListener("load", async function (event) {
  if (await validateSite())
    loadAlarmPage();
  else
    loadInvalidSitePage();
});

async function validateSite() {
  const tab = await getCurrentTab();
  const url = tab.url;
  return /^https:\/\/.*\.youtube\.com\/watch.*$/.test(url);
}

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function loadInvalidSitePage() {
  const body = document.body;
  body.innerHTML = `
  <p>The timer is only accessible on youtube.com and music.youtube.com</p>
  `;
}

async function loadAlarmPage() {
  const prevAlarm = await loadPrevAlarm();
  let timerInterval;
  if (!prevAlarm)
    timerInterval = document.getElementById("timer-label").innerText = formatTimeLeft(0);
  else
    timerInterval = startTimerAnimation(prevAlarm.alarm.scheduledTime - Date.now(), prevAlarm.savedAlarmDuration)

  const form = document.getElementById('time-selection');
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearInterval(timerInterval);
    // calculate number of milliseconds to wait for
    const formData = new FormData(form);
    const data = {};
    for (let pair of formData.entries()) {
      data[pair[0]] = pair[1];
    }
    if (!isNaN(data.value)) {
      const initTime = data.value * (data.unit === 'min' ? minToMs : hrToMs);
      timerInterval = startTimerAnimation(initTime, initTime);
      chrome.runtime.sendMessage(
        { msg: 'startTimer', initTime }
      );
    }
  });
  document.getElementById('cancel-timer').addEventListener("click", function (event) {
    chrome.runtime.sendMessage(
      { msg: 'cancelTimer' }
    );
    clearInterval(timerInterval);
    document
      .getElementById("time-remaining")
      .setAttribute("stroke-dasharray", `282.6`);
    document.getElementById("timer-label").innerText = formatTimeLeft(0);
  });
}

async function loadPrevAlarm() {
  return await chrome.runtime.sendMessage({ msg: 'getTimer' });
}

function formatTimeLeft(time) {
  const hours = Math.floor(time / hrToMs);

  const minutes = Math.floor((time % hrToMs) / minToMs);

  let seconds = Math.floor((time % hrToMs) % minToMs / 1000);

  // If less than 10 secs, display leading zero
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${hours}:${minutes}:${seconds}`;
}

function startTimerAnimation(timeLeft, initTime) {
  updateProgressBar(timeLeft, initTime);
  document.getElementById("timer-label").innerText = formatTimeLeft(timeLeft);
  const interval = setInterval(() => {
    timeLeft -= 1000;
    if (timeLeft <= 0) {
      timeLeft = 0;
      clearInterval(interval);
    }
    updateProgressBar(timeLeft, initTime);
    // The time left label is updated
    document.getElementById("timer-label").innerText = formatTimeLeft(timeLeft);
  }, 1000);
  return interval;
}

/**
 * we can cut the circle into pizza-like slices and fill in with color as time passes to animate a progress bar
 * full len of progress bar is 2πr = 2 * π * 45 = 282,6
 * we split it into eaten and not eaten parts
 */
function updateProgressBar(timeLeft, initTime) {
  let pizzaLeft = timeLeft / initTime;
  pizzaLeft = pizzaLeft - (1 / initTime) * (1 - pizzaLeft);
  pizzaLeft = pizzaLeft * 282.6;
  document
    .getElementById("time-remaining")
    .setAttribute("stroke-dasharray", `${pizzaLeft} 282.6`);
}