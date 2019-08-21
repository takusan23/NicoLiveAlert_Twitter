'use strict';

const builder = require('electron-builder');
const fs = require('fs');
const packagejson = JSON.parse(fs.readFileSync('./src/package.json', 'utf8'));

builder.build({
    platform: 'win',
    "icon": "./src/images/icon.png",
    config: {
        'appId': `io.github.takusan23.${packagejson.name}`,
        'win': {
            'target': 'zip',
        },
    },
});