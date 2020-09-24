import { cordova } from 'cordova-lib';
import path from 'path';

function buildApp(platform, appBuildType) {
    var buildType = appBuildType === 'release';// ? true : platform == 'ios';
    var options = {
        "slilent": false,
        "device": true,
        "release": buildType,
        "exportOptions": path.join(process.cwd(), 'platforms/ios/exportOptions.plist'),
    };
    return new Promise(function (resolve, reject) {
        cordova.build({
            platforms: [platform],
            options: options,
        }, function (err, data) {
            if (err) {
                reject(new Error(err))
            }
            resolve(data);
        });
    });
};

export default buildApp;