#!/usr/bin/env node
const fs = require('fs'),
    path = require('path');

module.exports = function (context) {
    const toolsAttribute = "xmlns:tools=\"http://schemas.android.com/tools\"";
    const manifestOpen = "<manifest";

    const manifestPath = path.join(context.opts.projectRoot, 'platforms/android/app/src/main/AndroidManifest.xml');
    let manifest = fs.readFileSync(manifestPath).toString();

    if(manifest.indexOf(toolsAttribute) == -1) {
        manifest = manifest.replace(manifestOpen, manifestOpen + " " + toolsAttribute + " ");
        fs.writeFileSync(manifestPath, manifest, 'utf8');
    }
};
