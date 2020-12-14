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

                        const projectProps = fs.readFileSync('platforms/android/project.properties', 'utf-8');
                        const projectData = projectProps.replace(/android-25/, "android-26");
                        fs.writeFileSync('platforms/android/project.properties', projectData, 'utf-8');

                        const gradle = fs.readFileSync('platforms/android/build.gradle', 'utf-8');
                        const gradleData = gradle.replace(/VERSION_1_6/g,'VERSION_1_7');
                        fs.writeFileSync('platforms/android/build.gradle', gradleData, 'utf-8');
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
                const cwd = process.cwd();
                fs.copyFileSync(path.join(__dirname, 'cordovapack/util/addKey/Entitlements-Debug.plist'), 
                    path.join(cwd,'platforms/ios',o.appName, 'Entitlements-Debug.plist'));
                fs.copyFileSync(path.join(__dirname, './cordovapack/util/addKey/Entitlements-Release.plist'), 
                    path.join(cwd,'platforms/ios',o.appName, 'Entitlements-Release.plist'));
                resolve();
            }
        );
    });
}

export default buildExtras;
