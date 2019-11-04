import fs from 'fs-extra';
import path from 'path';

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
                    resolve();
                }
            );
        });
    });
};

export function buildIOSExtra() {
    return new Promise(function (resolve, reject) {
        fs.copy(path.join(__dirname, 'AppDelegate.m'),
            'platforms/ios/test/Classes/AppDelegate.m',
            function (err) {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                resolve();
            }
        );
    });
}

export default buildExtras;
