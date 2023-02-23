#!/usr/bin/python

import json
import requests
from os.path import exists

def download(url, destination):
    if exists(destination):
        print('Skipping ' + url + '. File already exists')
        return

    print('Downloading ' + url)
    response = requests.get(url)

    with open(destination, 'w') as f:
        f.write(response.content.decode('utf-8'))

versions_list = {
    'hls.js': [],
    'dashjs': [],
    'hasplayer.js': []
}

response = requests.get('https://data.jsdelivr.com/v1/package/npm/dashjs')
lst = json.loads(response.content)
dashjs_versions = lst['versions']

response = requests.get('https://data.jsdelivr.com/v1/package/npm/hls.js')
lst = json.loads(response.content)
hlsjs_versions = lst['versions']

response = requests.get('https://data.jsdelivr.com/v1/package/npm/hasplayer.js')
lst = json.loads(response.content)
hasplayerjs_versions = lst['versions']

for version in hasplayerjs_versions:
    if 'canary' in version:
        continue

    if 'beta' in version:
        continue

    if 'alpha' in version:
        continue

    if 'rc' in version:
        continue

    url = 'https://cdn.jsdelivr.net/npm/hasplayer.js@' + version + '/dist/hasplayer.min.js'
    download(url, 'libs/hasplayerjs/hasplayer-' + version + '.min.js')
    versions_list['hasplayer.js'].append(version)

for version in dashjs_versions:
    if '0.0.0' == version or '1.1.1' == version or '2.0.0-rc4' == version:
        continue

    if 'canary' in version:
        continue

    if 'beta' in version:
        continue

    if 'alpha' in version:
        continue

    if 'rc' in version:
        continue

    url = 'https://cdn.jsdelivr.net/npm/dashjs@' + version + '/dist/dash.all.min.js'
    download(url, 'libs/dashjs/dash-' + version + '.all.min.js')
    versions_list['dashjs'].append(version)


for version in hlsjs_versions:
    if 'canary' in version:
        continue

    if 'beta' in version:
        continue

    if 'alpha' in version:
        continue

    if 'rc' in version:
        continue

    url = 'https://cdn.jsdelivr.net/npm/hls.js@' + version + '/dist/hls.min.js'
    download(url, 'libs/hlsjs/hls-' + version + '.min.js')
    versions_list['hls.js'].append(version)

with open('libs/versions_list.js', 'w') as f:
    f.write('var versions = ' + json.dumps(versions_list))