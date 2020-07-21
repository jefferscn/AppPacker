import fs from 'fs-extra';

function buildInject(project, buildType, path) {
    var injectContent = "window.projectCfg={\r\n";
    injectContent += `sessionKey:'${project.appId}',`;
    if (project.settings && project.settings[buildType].serverPath) {
        injectContent += `serverpath:'${project.settings[buildType].serverPath}',`;
    }
    injectContent += '}';
    return new Promise(function (resolve, reject) {
        fs.writeFile(path, injectContent, function (err, data) {
            if (err) {
                reject(new Error(err))
            }
            resolve(data);
        });
    });
}

export default buildInject
