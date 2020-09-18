import path from 'path';
import addPluginReal from './addPluginReal';
import querystring from 'querystring';

async function addPlugin(appPlugin, evalEnv) {
    console.log('addPlugin');
    console.log('cwd',process.cwd());
    console.log('__dirname', __dirname);
    var pluginPre = path.resolve(process.cwd(),'../../../local_plugin/');
    // return co(function *() {
    var plugin = appPlugin;
    if (typeof plugin != 'undefined' && plugin.length != 0) {
        //为了兼容以前的"cordova-plugin-app-version,cordova-plugin-camera,cordova-plugin-device"类型
        // try {
        //     plugin = JSON.parse(plugin);
        // } catch (e) {
        //     plugin = plugin.split(',');
        // }
        //分类
        var pluginWithVariable = [];
        var pluginWithoutVariable = [];
        var customPluginReg = /^https?:\/\/(www\.)?/i;
        for (var i = 0; i < plugin.length; i++) {
            if (plugin[i].indexOf('?') === -1) {
                if (customPluginReg.test(plugin[i].toString())) {
                    pluginWithoutVariable.push(plugin[i].toString());
                } else {
                    pluginWithoutVariable.push(`${pluginPre}/${plugin[i].toString()}`);
                }
            } else {
                if (customPluginReg.test(plugin[i].toString())) {
                    pluginWithVariable.push(plugin[i].toString());
                } else {
                    pluginWithVariable.push(`${pluginPre}/${plugin[i].toString()}`);
                }
            }
        }
        if (pluginWithoutVariable.length !== 0) {
            for(var j=0; j< pluginWithoutVariable.length; j++) {
                await addPluginReal(pluginWithoutVariable[j]);
            }
        }
        if (pluginWithVariable.length !== 0) {
            for (var i = 0; i < pluginWithVariable.length; i++) {
                //拆分plugin 和 variable
                var plugin = pluginWithVariable[i].toString();
                var pluginName = plugin.split('?')[0].toString();
                var pluginVariable = plugin.split('?')[1];
                //toJson
                var vars = querystring.parse(pluginVariable);
                var variable = {};
                variable.cli_variables = {};
                for(let key in vars) {
                    variable.cli_variables[key] = eval('`' + vars[key] + '`');
                }
                await addPluginReal(pluginName, variable);
            }
        }
    }
    // });
};
export default addPlugin;

