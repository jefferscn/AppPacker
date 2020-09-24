import fs from 'fs-extra';
import xcode from 'xcode';
import path from 'path';

function addKey(appName, appIosMp, buildType, platform) {
    return new Promise(function (resolve, reject) {
        var json = {
            "android": {
                "release": {
                    "keystore": "../../key/android.keystore",
                    "storePassword": "bokesoft",
                    "alias": "android",
                    "password": "bokesoft",
                    "keystoreType": ""
                },
                "debug": {
                    "keystore": "../../key/android.keystore",
                    "storePassword": "bokesoft",
                    "alias": "android",
                    "password": "bokesoft",
                    "keystoreType": ""
                }
            }
            // "ios": {
            //     "debug": {
            //         "codeSignIdentitiy": "iPhone Development",
            //         "packageType": "development",
            //         "developmentTeam": "5C83KHGVSN",
            //         "provisioningProfile": "2538e3a2-e134-4968-9d67-6f3220027cc4"
            //     },
            //     "release": {
            //         "codeSignIdentitiy": "iPhone Distribution",
            //         "packageType": "enterprise",
            //         "developmentTeam": "5C83KHGVSN",
            //         "provisioningProfile": "2538e3a2-e134-4968-9d67-6f3220027cc4"

            //     }
            // }
        };
        //修改mp
        // json.ios.debug.developmentTeam = appIosMp.TeamIdentifier;
        // json.ios.debug.provisioningProfile = appIosMp.UUID;
        // json.ios.release.developmentTeam = appIosMp.TeamIdentifier;
        // json.ios.release.provisioningProfile = appIosMp.UUID;
        //对于IOS将不再使用cordova的默认签名传递方式，直接通过代码修改IOS项目的信息
        //主要是当前的cordova不支持多个签名的情况，无法满足ShareExtension的打包要求
        if (platform === 'ios') {
            const cwd = process.cwd();
            const projectPath = path.join(cwd, "platforms/ios", `${appName}.xcodeproj`, 'project.pbxproj');
            console.log(projectPath);
            const pbxProject = xcode.project(projectPath);
            pbxProject.parseSync();
            const configurations = pbxProject.pbxXCBuildConfigurationSection();
            for (var key in configurations) {
                if (typeof configurations[key].buildSettings !== 'undefined') {
                    var buildSettingsObj = configurations[key].buildSettings;
                    if (typeof buildSettingsObj['PRODUCT_NAME'] !== 'undefined') {
                        var productName = buildSettingsObj['PRODUCT_NAME'];
                        if (productName.indexOf(appName) >= 0) {
                            buildSettingsObj['PROVISIONING_PROFILE'] = appIosMp.UUID;
                            buildSettingsObj['DEVELOPMENT_TEAM'] = appIosMp.TeamIdentifier;
                            buildSettingsObj['CODE_SIGN_STYLE'] = 'Manual';
                            buildSettingsObj['CODE_SIGN_IDENTITY'] = buildType === 'release' ? '"iPhone Distribution"' : '"iPhone Development"';
                        }
                    }
                }
            }
            fs.writeFileSync(projectPath, pbxProject.writeSync());
            console.log('Write buildSettings to XCode project');
            //删除build.xcconfig中定义的全局entitlements文件定义
            const xcconfigFilePath = path.join(cwd, 'platforms/ios/cordova/build.xcconfig');
            const data = fs.readFileSync(xcconfigFilePath, { encoding: 'utf-8' });
            let dataArray = data.split('\n'); // convert file data in an array
            const searchKeyword = 'CODE_SIGN_ENTITLEMENTS'; // we are looking for a line, contains, key word 'user1' in the file
            let lastIndex = -1; // let say, we have not found the keyword

            for (let index = 0; index < dataArray.length; index++) {
                if (dataArray[index].includes(searchKeyword)) { // check if a line contains the 'user1' keyword
                    lastIndex = index; // found a line includes a 'user1' keyword
                    break;
                }
            }

            dataArray.splice(lastIndex, 1); // remove the keyword 'user1' from the data Array

            // UPDATE FILE WITH NEW DATA
            // IN CASE YOU WANT TO UPDATE THE CONTENT IN YOUR FILE
            // THIS WILL REMOVE THE LINE CONTAINS 'user1' IN YOUR shuffle.txt FILE
            const updatedData = dataArray.join('\n');
            fs.writeFileSync(xcconfigFilePath, updatedData);
        }
        var json = JSON.stringify(json);
        fs.writeFile('build.json', json, function (err, data) {
            if (err) {
                reject(new Error(err))
            }
            resolve(data);
        });
    });
}
export default addKey;
