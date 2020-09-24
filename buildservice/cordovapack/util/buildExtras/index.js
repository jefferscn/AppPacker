import fs from 'fs-extra';
import path from 'path';
import plist from 'plist';

function buildExtras() {
    const lintOptions =
        "android {\n" +
        "    lintOptions {\n" +
        "        disable 'MissingTranslation'\n" +
        "        disable 'ExtraTranslation'\n" +
        "    }\n" +
        "}";
    return new Promise(function (resolve, reject) {

        fs.writeFile('platforms/android/build-extras.gradle', lintOptions, function (err, data) {
            if (err) {
                reject(new Error(err))
                return;
            }

            //修改SystemWebViewClient.java
            //platforms/android/CordovaLib/src/org/apache/cordova/engine/SystemWebViewClient.java
            //onReceivedSslError
            fs.copy(path.join(__dirname, 'SystemWebViewClient.java'),
                'platforms/android/CordovaLib/src/org/apache/cordova/engine/SystemWebViewClient.java',
                function (err) {
                    if (err) {
                        reject(new Error(err));
                        return;
                    }
                    try {
                        const config = fs.readFileSync('platforms/android/AndroidManifest.xml', 'utf-8');
                        const result = config.replace(/(android:windowSoftInputMode=").*?(")/, "$1adjustPan$2");
                        fs.writeFileSync('platforms/android/AndroidManifest.xml', result, 'utf-8');
                    } catch (ex) {
                        resject(ex);
                    }
                    resolve();
                }
            );
        });
    });
};

export function buildIOSExtra(o) {
    return new Promise(function (resolve, reject) {
        fs.copy(path.join(__dirname, 'AppDelegate.m'),
            `platforms/ios/${o.appName}/Classes/AppDelegate.m`,
            function (err) {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                fs.copyFileSync(path.join(__dirname, 'cordovapack/util/buildExtras/build.js'),
                `platforms/ios/cordova/lib/build.js`);
                const exportOptionsPath = path.join(process.cwd(), 'platforms/ios/exportOptions.plist');
                var exportOptions = { 'compileBitcode': false, 'method': o.appBuildType==='release'?'enterprise':'development' };
                const provisions = {};
                for(let key in o.appIosMp) {
                    provisions[key] = o.appIosMp[key].UUID;
                }
                exportOptions['provisioningProfiles']=provisions;
                fs.writeFileSync(exportOptionsPath, plist.build(exportOptions));
                resolve();
            }
        );
    });
}

export default buildExtras;
