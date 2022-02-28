# YouTube Sleep Timer

A sleep timer for YouTube! 

## Usage

Install the plugin from the Chrome [Webstore](https://chrome.google.com/webstore/detail/youtube-timer/gfegfgkiikpkochkfgopiolcfbmkfkll)

Or, download this repo and follow instructions [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked) to load an unpacked extension.

## FAQ

1. Why doesn't the alarm fire on-time?
    This project uses Chrome Alarms API to calculate time. Per Google's [documentation](https://developer.chrome.com/docs/extensions/reference/alarms/#method-create), alarms are limited to one alarm per minute, and the alarms will be delayed by an arbritary amount of time. To support developers, there is no rate limitation when you load the extension unpacked, so we encourage you to download our source code to by-pass this issue.

2. What permissions do you require, and why?
    - declarativeContent: 
    "alarms",
    "scripting",
    "tabs"

## Disclaimer: 

This extension is written with the help from the following references: 

- https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/ 
- https://developer.chrome.com/extensions/getstarted 

Please notify the author if you think this breached any copyrights.


## Licensing and Contributions

This extension uses the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**, please see LICENSE.md for details.

In summary, the license allows sharing and contribution of the licensed material, but disallows all commercial use as opposed to open-source licenses. 
This is to ensure that our beloved sleep timer stays free for as long as possible.