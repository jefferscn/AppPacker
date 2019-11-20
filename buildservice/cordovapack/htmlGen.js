var QRCode = require('qrcode');
var pug = require('pug'),
    fs = require('fs')
    , path = 'iosDist.pug'
    , str = require('fs').readFileSync(path, 'utf8')
    , fn = pug.compile(str, {pretty: true });

function htmlGen(plistUrl,appName,pageUrl){
    return new Promise(function(resolve,reject){
        var locals = {plistUrl:plistUrl,appName:appName};
        QRCode.toDataURL(pageUrl,function(err,url){
            locals.pageUrl = url;
            var html = fn(locals);
            var fileName = 'index.html';
            fs.writeFile(fileName, html, (err) => {
                if (err) {
                    reject(err)
                };
                resolve(`${fileName} was saved!`);
            });
        });

    })
};
module.exports = htmlGen;
