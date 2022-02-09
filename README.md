<!--
    Modifications copyright (C) 2017 David Ćavar
 -->
# Disclaimer
I forked this repository from https://github.com/ghouet/chrome-hls. Original extension supports HLS only, I additionally wanted to support MPEG-DASH.
Extension was created purely from the need to easily test and preview HTTP streams using simple mouse click.<br/>
<br/>
I'm a lone developer on this project, and I have a day job as a software developer which consumes most of my time. I spend the rest of my time either pursuing other 
hobbies, spending time with my family, or handling life obligations. That means mostly avoiding stuff related to my work as a developer. Because of that my response and development is slow. Any development I do on this project is
for the satisfaction of giving back to the community which helped me do my job in the first place. If not for that, I would not have published the extension to any major web stores.<br/>
<br/>
The extension is what it is. I may refactor it, rename it, rebrand it, or I may not.<br/>
<br/>
I will try to fix any bugs if I can reproduce them. There are lot of test cases out there and I do not have time to prepare test streams for each of them.
I would appreciate if you could provide as many details as you can when reporting a ticket, and provide a sample stream for which you believe the player 
has a problem with.<br/>
<br/>
Shout out to [ghouet](https://github.com/ghouet) who started the original project. It saved me a lot of time.<br/>
Shout out to all the developers, maintainers, testers and contributors of the [hls.js](https://github.com/video-dev/hls.js) 
and [dash.js](https://github.com/Dash-Industry-Forum/dash.js) project who keep it going.<br/>
<br/>
And thanks everyone who donated, keeps me floating.

# Native HLS + MPEG-Dash Extension

Allows HLS and MPEG-Dash native playback in chrome and firefox browsers

# Usage

1. Install extension from [chrome webstore](https://chrome.google.com/webstore/detail/native-mpeg-dash-%2B-hls-pl/cjfbmleiaobegagekpmlhmaadepdeedn)/[mozilla addons](https://addons.mozilla.org/en-US/firefox/addon/native-mpeg-dash-hls-playback/)
2. Click on any m3u8 or mpd link inside chrome/firefox to play it directly in a new tab

The extension can be disabled by clicking on the icon if the request filter on m3u8 links is too disruptive.

# Build instructions
Requirements:
 - python2
 - jinja2
 - pyyaml

Build targets
 - chrome_debug - Full version including console logs
 - chrome_prod - Full version without console logs
 - firefox_debug - Stripped down version with console logs
 - firefox_prod - Stripped down version without console logs

 AMO(addons.mozilla.org) has some restrictions for publishing the extension on store which requires disabling some functionality 
 such as version selection on extension config. 
 You can still build and use full unpacked chrome version of the extension on Firefox.

Build for Firefox
python build.py -e firefox_debug

Build for Chrome
python build.py -e chrome_debug

Load unpacked extension to Firefox:
 - Type in about:debugging into address bar
 - Click Load Temporary Add-on
 - Navigate to /project_path/dist/debug/firefox/manifest.json

Load unpacked extension to Chrome:
 - Type chrome://extensions/ into address bar
 - Click Load Unpacked
 - Navigate to /project_path/dist/debug/chrome
 - Click Open

build.py is the simple pre-processing script using jinja2 for code inclusion or exclusion based on target. 

# Some Developer Notes

By default, the browser downloads any m3u8 and mpd files that were requested. This plugin checks any links to see if
they match.
If that's the case, it opens a new tab on a video player that uses the [hlsjs][] and [dashjs][] library. This extension
is just a wrapper those players for chrome.

[hlsjs]: https://github.com/dailymotion/hls.js
[dashjs]: https://github.com/Dash-Industry-Forum/dash.js

#License
Released under [Apache 2.0 License](LICENSE)
