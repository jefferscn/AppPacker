import 'babel-polyfill';
import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import plistGen from './plistGen';
import unzip from 'unzip2';
import createIcons from 'createicon';
import download from './util/download';
import fileExist from './util/fileExist';
import updateProject from './util/updateProject';
import installCertificate from './util/installCertificate';
import installMobileProvision from './util/installMobileProvision';
import config from '../config';
import {
    addPlatform,
    emptyDir,
    buildApp,
    addKey,
    buildExtras,
    addPlugin,
    processCode,
    createCordova,
    changelibConfigJSPath,
    projectDirName,
    getSvn,
    preparePack,
    addBaiduMapScript,
    Logger,
    upload,
    buildIOSExtra,
    buildInject,
    getAllPluginVariables
} from './util/';

const workingDir = path.resolve(__dirname, 'working');
const originDir = path.resolve(__dirname, '.');

async function pack(cfg) {

    //console.log(cfg);
    const o = new Object();
    o.id = cfg.id;
    // o.baseSvn = cfg.baseSvn;
    // o.projectSvn = cfg.projectSvn;
    o.appName = cfg.project.name;
    // o.appEnglish = cfg.appEnglishName;
    o.appDescription = cfg.project.desc;
    o.appIcon = 'www/app.icon';
    // o.appContent = cfg.appContent;
    // o.appPlugin = cfg.appPlugin || cfg['appPlugin[]'];
    // o.projectSvnUser = cfg.projectSvnUser;
    // o.projectSvnPassword = cfg.projectSvnPassword;
    o.appPlatform = cfg.platform;
    o.appNameSpace = cfg.project.appId;
    // o.svnDir = `${o.appName}/www`;
    // o.baseSvnUser = 'zhouzy';
    // o.baseSvnPassword = 'zhouzy';
    o.wwwPath = `${o.appName}/www`;
    o.resPath = `${o.appName}/res`;
    o.hooksPath = `${o.appName}/hooks`;
    o.iconPath = `${o.resPath}/app.icon`;
    o.configXML = `${o.appName}/config.xml`;
    o.htmlPath = `${o.appName}/www/index.html`;
    const defaultPlugins = ["cordova-plugin-app-version",
        "cordova-plugin-camera",
        "cordova-plugin-device",
        "cordova-plugin-file",
        "cordova-plugin-file-opener2",
        "cordova-plugin-file-transfer",
        "cordova-plugin-inappbrowser",
        "cordova-plugin-whitelist",
        // "cordova-plugin-x-socialsharing",
        // "phonegap-plugin-barcodescanner",
        "ionic-plugin-keyboard",
        "cordova-plugin-network-information",
        "cordova-plugin-statusbar",
        // "cordova-plugin-dialogs",
        // "cordova-plugin-crosswalk-webview",
        "com.lampa.startapp",
        "cordova-plugin-appavailability",
        "com-sarriaroman-photoviewer"];
    o.appPlugin = defaultPlugins;
    if (cfg.project.plugins) {
        const plugins = cfg.project.plugins.filter(v => v && (!v.platform || v.platform == o.appPlatform));
        for (let i = 0; i < plugins.length; i++) {
            if (plugins[i].url.startsWith('jpush-phonegap-plugin')) {
                o.appPlugin.push('cordova-plugin-jcore');
            }
            o.appPlugin.push(plugins[i].url);
        }
    }
    // o.projectPath = `${o.svnDir}/js/lib/`;
    // o.projectDir = `${o.svnDir}/js/lib/${projectDirName(o.projectSvn)}`;
    // console.log(o.svnDir);
    // o.libConfigJSPath = path.resolve(__dirname, 'working', o.svnDir, 'js/lib/config/config.js');
    // console.log('改变后', o.libConfigJSPath);
    o.package = url.resolve(config.server.baseUrl, cfg.package.url);
    o.icon = url.resolve(config.server.baseUrl, cfg.project.icon.url);
    o.platform = cfg.platform;
    o.release = cfg.release;
    o.appBuildType = cfg.debug ? 'debug' : 'release';
    o.appPackageName = cfg.project.appId;
    o.appVersion = cfg.version;
    o.appIosMp = {};
    // if (o.appPlatform == 'ios') {
    //     if (o.appBuildType==='release') {
    //         o.mobileProvisionUrl = url.resolve(config.server.baseUrl, cfg.project.ios.mobileProvision.url);
    //     } else {
    //         o.mobileProvisionUrl = url.resolve(config.server.baseUrl, cfg.project.ios.mobileProvisionDev.url);
    //     }
    //     o.certificateUrl = url.resolve(config.server.baseUrl, cfg.project.ios.certificate.file.url);
    //     o.certificatePwd = cfg.project.ios.certificate.password;
    //     o.appPlugin.push('org.frd49.cordova.exitapp');
    // }
    // o.yigoVersion = cfg.yigoVersion;

    // o.apkLink = cfg.apkDownloadLink;
    // o.ipaLink = cfg.ipaLink;
    o.androidTargetSdkVersion = cfg.androidTargetSdkVersion;

    const logFile = `log/${cfg.id}.log`;
    const logger = Logger(logFile);

    const evalEnv = {};
    o.build = async function () {
        logger.info('pack enviroment initializing......');
        // await preparePack();
        await emptyDir(workingDir);
        process.chdir(workingDir);
        logger.info('pack enviroment initialize success');

        if (o.appPlatform == 'ios') {
            if (o.appBuildType === 'release') {
                if (!cfg.project.ios.mobileProvision) {
                    throw "mobileProvision missing!";
                }
                o.mobileProvisionUrl = url.resolve(config.server.baseUrl, cfg.project.ios.mobileProvision.url);
            } else {
                if (!cfg.project.ios.mobileProvisionDev) {
                    throw "mobileProvision missing!";
                }
                o.mobileProvisionUrl = url.resolve(config.server.baseUrl, cfg.project.ios.mobileProvisionDev.url);
            }
            o.certificateUrl = url.resolve(config.server.baseUrl, cfg.project.ios.certificate.file.url);
            o.certificatePwd = cfg.project.ios.certificate.password;
            if (cfg.project.ios.shareProvision && cfg.project.ios.shareProvision.url) {
                o.shareProvisionUrl = url.resolve(config.server.baseUrl, cfg.project.ios.shareProvision.url);
            }
            o.appPlugin.push('org.frd49.cordova.exitapp');
        }
        if (o.appPlatform == 'ios') {
            try {
                logger.info('Install p12 begin ');
                await installCertificate(o.certificateUrl, o.certificatePwd);
                logger.info('Install p12 success.');

                logger.info('Install mobile provision begin');
                const mobileProvision = await installMobileProvision(o.mobileProvisionUrl);
                logger.info('Install mobile provision success.');
                if (o.shareProvisionUrl) {
                    console.log('install share Provision');
                    const shareProvision = await installMobileProvision(o.shareProvisionUrl, 'share.mobileprovision');
                    evalEnv.shareProvisionUUID = shareProvision.UUID;
                    evalEnv.shareTeamIdentifier = shareProvision.TeamIdentifier;
                    o.appIosMp[`${o.appNameSpace}.shareextension`] = shareProvision;
                }
                evalEnv.provisionUUID = mobileProvision.UUID;
                evalEnv.teamIdentifier = mobileProvision.TeamIdentifier;
                o.appIosMp[o.appNameSpace] = mobileProvision;
            } catch (ex) {
                console.log(ex);
            }
        }

        logger.info('create cordova begin');
        await createCordova(o.appName, o.appNameSpace);
        logger.info('create cordova success');
        await emptyDir(o.resPath);
        await emptyDir(o.hooksPath);
        await emptyDir(o.wwwPath);
        logger.info('download icon begin');
        await download(o.icon, o.iconPath);
        console.log(__dirname);
        if (o.appPlatform == 'ios') {
            await createIcons(o.appPlatform, o.iconPath, `${o.appName}/res/${o.appPlatform}/`);
            fs.createReadStream(path.resolve(__dirname, '1125_2436.png')).pipe(fs.createWriteStream(path.resolve(`${o.resPath}/${o.appPlatform}`, '1125_2436.png')));
        }
        logger.info('download icon OK');
        console.log(evalEnv);
        var vars = getAllPluginVariables(o.appPlugin, evalEnv);
        var preferences = [];
        for (let key in vars) {
            preferences.push({
                name: key,
                value: vars[key],
            });
        }
        console.log(preferences);
        await processCode(o.configXML, o.appVersion, o.appPackageName, o.appName, o.appDescription, o.appIcon, null, o.appPlatform, o.release, cfg.project, preferences);
        logger.info('process config.xml success');

        // 解压缩任务中的压缩包
        const file = "tmp.zip";
        console.log(o.package);
        await download(o.package, file);
        await extract(file, o.wwwPath);
        logger.info('unzip www OK');
        buildInject(cfg.project, o.appBuildType, `${o.wwwPath}/inject.js`);
        logger.info('build inejctjs');
        fs.createReadStream(path.resolve(__dirname, 'serverpath.html')).pipe(fs.createWriteStream(path.resolve(o.wwwPath, 'serverpath.html')));
        logger.info('copy serverpath.html OK');
        fs.createReadStream(path.resolve(__dirname, 'checkupdate.html')).pipe(fs.createWriteStream(path.resolve(o.wwwPath, 'checkupdate.html')));
        logger.info('copy checkupdate.html OK');
        if (o.appPlatform == 'android') {
            logger.info('add hook begin');
            fs.createReadStream(path.resolve(__dirname, './cordovapack/hooks/android.max_aspect.js')).pipe(fs.createWriteStream(path.resolve(o.hooksPath, 'android.max_aspect.js')));
            fs.createReadStream(path.resolve(__dirname, './cordovapack/hooks/add_tools_namespace.js')).pipe(fs.createWriteStream(path.resolve(o.hooksPath, 'add_tools_namespace.js')));
            logger.info('add hook OK');
        }
        // await addBaiduMapScript(o.htmlPath, o.appPlugin);

        process.chdir(o.appName);
        await addPlatform(o.appPlatform);
        //修改app delegate，使ios支持cookie
        if (o.appPlatform === 'ios') {
            await buildIOSExtra(o);
        }
        logger.info('cordova add platform OK');
        await addPlugin(o.appPlugin, evalEnv);
        logger.info('cordova add plugins OK');
        if (o.appPlatform === 'android') {
            await buildExtras(); // android
        }
        await addKey(o.appName, o.appIosMp[o.appNameSpace], o.appBuildType, o.appPlatform);
        logger.info('cordova add licence key OK');
        await buildApp(o.platform, o.appBuildType);
        logger.info('cordova build application OK');
        // await releaseFile(o.platform, o.appPlugin, o.appBuildType, o.apkLink, o.ipaLink, o.appName);
        let src = null;
        // process.chdir(originDir);
        if (o.appPlatform === 'ios') {
            // let dest = o.ipaLink;
            // const reg = new RegExp('^(.+)\/(?:[^/]+)$');
            // dest = reg.exec(dest)[1];
            src = ['platforms/ios/build/device/', o.appName, '.ipa'].join('');
            const data = await upload(config.server.upload, src);
            const ipaUrl = data.url;
            // const plistUrl = `${SERVER}yigomobile/public/ios/${o.id}/manifest.plist`;
            // const pageUrl = `${SERVER}yigomobile/public/ios/${o.id}/index.html`;
            const plistUrl = await plistGen(o, ipaUrl);
            // await htmlGen(plistUrl, o.appName, pageUrl);
            // fs.copySync('manifest.plist', `${dest}/manifest.plist`);
            cfg.targetUrl = plistUrl;
            cfg.save();
            // fs.copySync('index.html', `${dest}/index.html`);
        } else {
            var isCrosswalk = /crosswalk/;
            if (isCrosswalk.test(o.appPlugin.toString())) {
                src = ['platforms/android/build/outputs/apk/android-armv7-', o.appBuildType, '.apk'].join('');

            } else {
                src = ['platforms/android/build/outputs/apk/android-', o.appBuildType, '.apk'].join('');
            }
            const data = await upload(config.server.upload, src);
            cfg.targetUrl = data.url;
            cfg.save();
        };
        if (o.release) {
            await updateProject(cfg.projectId, o.appPlatform, {
                url: cfg.targetUrl,
                taskId: cfg.id,
                version: o.appVersion,
                releaseDate: Date.now(),
            });
        }
    };
    try {
        cfg.status.code = 'processing';
        await cfg.save();
        await o.build();
        cfg.status.code = 'done';
        await cfg.save();
    } catch (e) {
        console.log(e);
        logger.error(e.message);
        cfg.status.code = 'error';
        await cfg.save();
    } finally {
        process.chdir(originDir);
        const isExist = await fileExist(logFile);
        if (!isExist) {
            console.log('logfile not exist!');
            return;
        }
        const uploadLogData = await upload(config.server.upload, logFile);
        console.log(uploadLogData);
        cfg.status.log = uploadLogData.url;
        await cfg.save();
        fs.remove(logFile);
    }
}
const extract = (file, dir) => {
    return new Promise((resolve, reject) => {
        var res = fs.createReadStream(file).pipe(unzip.Extract({ path: dir }));
        res.on('error', (error) => {
            reject(error);
        });
        res.on('close', () => {
            resolve();
        });
    });
}
export default pack;
