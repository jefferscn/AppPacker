import cheerio from 'cheerio';
import fs from 'fs-extra';
import { configparser } from 'cordova-lib';

function processCode(configXML, appVersion, appPackageName, appName, appDescription, appIcon, androidTargetSdkVersion, appPlatform, release, project, preferences) {
    var configPath = configXML;
    return new Promise(function (resolve, reject) {
        var conf = new configparser(configPath);
        if (appVersion) conf.setVersion(appVersion);
        console.log(`packageName = ${appPackageName}`);
        if (appPackageName) conf.setPackageName(appPackageName);
        if (appName) conf.setName(appName);
        if (appDescription) conf.setDescription(appDescription);
        //TODO icon
        var icons = conf.getIcons(appPlatform);
        // if (appIcon) {
        //     conf.addElement('icon', { 'src': appIcon });
        // }
        //TODO access
        conf.addElement('access', { 'origin': 'cdvfile://*' });
        //TODO preference
        conf.addElement('preference', { 'name': 'WebViewBounce', 'value': 'false' });
        conf.addElement('preference', { 'name': 'DisallowOverscroll', 'value': 'true' });
        conf.addElement('preference', { 'name': 'Orientation', 'value': 'portrait' });
        conf.addElement('preference', { 'name': "SplashScreenDelay", 'value': '0' });
        conf.addElement('preference', { 'name': "fullscreen", 'value': 'false' });
        conf.addElement('preference', { 'name': "android-windowSoftInputMode", 'value': 'stateVisible|adjustResize' });
        conf.addElement('allow-navigation', { 'href': '*' });
        //防止Android6.0（API 23）权限出现问题,强制API为22
        conf.addElement('preference', { 'name': 'android-minSdkVersion', 'value': '17'});
        conf.addElement('preference', { 'name': 'android-targetSdkVersion', 'value': androidTargetSdkVersion || '22' });
        // cordova-ios 版本低于4.5.1不支持XCode 9.4.1 
        conf.addElement('preference', { 'name': 'tools-overrideLibrary', 'value': 'com.nanchen.compresshelper'});
        conf.addElement('engine', { 'name': 'ios', 'spec': '^4.5.1' });
        if(preferences) {
            preferences.forEach(preference=> {
                conf.addElement('preference', preference);
            })
        }
        //splash image
        conf.write();
        try {
            var $ = cheerio.load(fs.readFileSync(configXML), {
                decodeEntities: false,
                xmlMode: true
            });
            if ($) {
                // var splash =
                //     '<platform name="ios">' +
                //     '<splash src="../../res/ios/Default~iphone.png" width="320" height="480"/>' +
                //     '<splash src="../../res/ios/Default@2x~iphone.png" width="640" height="960"/>' +
                //     '<splash src="../../res/ios/Default-Portrait~ipad.png" width="768" height="1024"/>' +
                //     '<splash src="../../res/ios/Default-Portrait@2x~ipad.png" width="1536" height="2048"/>' +
                //     '<splash src="../../res/ios/Default-Landscape~ipad.png" width="1024" height="768"/>' +
                //     '<splash src="../../res/ios/Default-Landscape@2x~ipad.png" width="2048" height="1536"/>' +
                //     '<splash src="../../res/ios/Default-568h@2x~iphone.png" width="640" height="1136"/>' +
                //     '<splash src="../../res/ios/Default-667h.png" width="750" height="1334"/>' +
                //     '<splash src="../../res/ios/Default-736h.png" width="1242" height="2208"/>' +
                //     '<splash src="../../res/ios/Default-Landscape-736h.png" width="2208" height="1242"/>' +
                //     '</platform>';
                var splash = '<platform name="ios">\n' +
                    '<preference name="FadeSplashScreen" value="false"/>' +
                    '<preference name="FadeSplashScreenDuration" value="0"/>\n' +
                    '<splash src="res/ios/1125_2436.png" width="1125" height="2436"/>' +
                    '</platform>\n';
                $('widget').append(splash);
                if (appIcon) {
                    const icon = '    <platform name="ios">\n' +
                        '        <icon src="res/ios/icon-60@3x.png" width="180" height="180" />\n' +
                        '        <icon src="res/ios/icon-60.png" width="60" height="60" />\n' +
                        '        <icon src="res/ios/icon-1024.png" width="1024" height="1024" />\n' +
                        '        <icon src="res/ios/icon-60@2x.png" width="120" height="120" />\n' +
                        '        <icon src="res/ios/icon-76.png" width="76" height="76" />\n' +
                        '        <icon src="res/ios/icon-76@2x.png" width="152" height="152" />\n' +
                        '        <icon src="res/ios/icon-86@2x.png" width="172" height="172" />\n' +
                        '        <icon src="res/ios/icon-98@2x.png" width="196" height="196" />\n' +
                        '        <icon src="res/ios/icon-20.png" width="20" height="20" />\n' +
                        '        <icon src="res/ios/icon-24@2x.png" width="48" height="48" />\n' +
                        '        <icon src="res/ios/icon-27.5@2x.png" width="55" height="55" />\n' +
                        '        <icon src="res/ios/icon-40.png" width="40" height="40" />\n' +
                        '        <icon src="res/ios/icon-40@2x.png" width="80" height="80" />\n' +
                        '        <icon src="res/ios/icon-44@2x.png" width="88" height="88" />\n' +
                        '        <icon src="res/ios/icon-57.png" width="57" height="57" />\n' +
                        '        <icon src="res/ios/icon-57@2x.png" width="114" height="114" />\n' +
                        '        <icon src="res/ios/icon-72.png" width="72" height="72" />\n' +
                        '        <icon src="res/ios/icon-72@2x.png" width="144" height="144" />\n' +
                        '        <icon src="res/ios/icon-167.png" width="167" height="167" />\n' +
                        '        <icon src="res/ios/icon-29.png" width="29" height="29" />\n' +
                        '        <icon src="res/ios/icon-29@2x.png" width="58" height="58" />\n' +
                        '        <icon src="res/ios/icon-29@3x.png" width="87" height="87" />\n' +
                        '        <icon src="res/ios/icon-50.png" width="50" height="50" />\n' +
                        '        <icon src="res/ios/icon-50@2x.png" width="100" height="100" />\n' +
                        '    </platform>\n' +
                        '    <platform name="android">\n' +
                        '        <icon src="res/app.icon" />\n' +
                        '        <hook type="before_build" src="hooks/android.max_aspect.js" />\n' +
                        '        <hook type="after_prepare" src="hooks/add_tools_namespace.js" />\n' +
                        '    </platform>\n';
                    $('widget').append(icon);
                }
                //content
                //<content src="index.html"/>
                if (!release || project.settings.autoUpdate) {
                    $('content').attr('src', 'index.html');
                    // $('content').attr('src', 'serverpath.html');
                } else {
                    $('content').attr('src', 'checkupdate.html');
                }
                fs.writeFile(configXML, $.xml(), function (err, data) {
                    if (err) {
                        reject(new Error(err))
                    }

                    resolve(data);
                });
            }
        } catch (ex) {
            reject(ex)
        }
    });
};
export default processCode;