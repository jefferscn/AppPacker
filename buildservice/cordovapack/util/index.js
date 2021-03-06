import addPlatform from './platform';
import emptyDir from './emptyDir';
import buildApp from './buildApp';
import releaseFile from './releaseFile';
import addKey from './addKey';
import buildExtras, { buildIOSExtra } from './buildExtras';
import addPlugin, { getAllPluginVariables } from './addPlugin';
import preparePlatform from './preparePlatform';
import processCode from './processCode';
import createCordova from './createCordova';
import changelibConfigJSPath from './changelibConfigJSPath';
import projectDirName from './projectDirName';
import getSvn from './getSvn';
import preparePack from './preparePack';
import addBaiduMapScript from './addBaiduMapScript';
import Logger from './logger';
import upload from './upload';
import buildInject from './inject';

export {
    addPlatform,
    emptyDir,
    buildApp,
    releaseFile,
    addKey,
    buildExtras,
    addPlugin,
    preparePlatform,
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
    getAllPluginVariables,
}
