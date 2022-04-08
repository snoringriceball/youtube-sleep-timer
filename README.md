# YouTube Sleep Timer

A sleep timer for YouTube! 

## Usage

To install the plugin from the Chrome [Webstore](https://chrome.google.com/webstore/detail/youtube-timer/gfegfgkiikpkochkfgopiolcfbmkfkll)

To load it unpacked, download the zip file called yt-sleep-timer.zip from the latest [release](https://github.com/snoringriceball/youtube-sleep-timer/releases), unzip to get a folder called "dist". Then follow instructions [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked) to load an unpacked extension.

## FAQ

1. Why doesn't the alarm fire on-time?
    This project uses Chrome Alarms API to calculate time. Per Google's [documentation](https://developer.chrome.com/docs/extensions/reference/alarms/#method-create), alarms are limited to one alarm per minute, and the alarms will be delayed by an arbritary amount of time. To support developers, there is no rate limitation when you load the extension unpacked, so we encourage you to download our source code to by-pass this issue.

2. What permissions do you require, and why?
    - Declarative Content: This is for validating the website you are on, if it is part of Youtube or Youtube music, then the extension will be enabled, otherwise, it will remain disabled.
    - Alarms: This is for using the Chrome Alarms API. Starting from manifest version 3 (mv3), developers are required to use this API for setting timers. Please note that because this API is managed by Google, we have no control over it's accuracy.
    - Scripting: This is so that we can run some code to play/pause the Youtube Video.
    - Tabs: This is so that we can keep track of which tab is running which timer.


## Dev Setup

This project uses typescript and webpack to compile javascript files in to ./dist folder in the project root directory. After cloning the repo, run `npm install && npm run build` to compile the ts files into js, and load the dist folder as an unpacked extension. 


## Disclaimer: 

This extension is written with the help from the following references: 

- https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/ 
- https://developer.chrome.com/extensions/getstarted 

Please notify the author if you think this breached any copyrights.


## Licensing and Contributions

This extension uses the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**, please see LICENSE.md for details.

In summary, the license allows sharing and contribution of the licensed material, but disallows all commercial use as opposed to open-source licenses. 
This is to ensure that our beloved sleep timer stays free for as long as possible.