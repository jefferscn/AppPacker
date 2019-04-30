import request from 'request';
import cache from 'memory-cache';
import sha1 from 'sha1';

const accessTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token';
const ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
const cache_duration = 1000*60*60*2;
export default (url, config) => {
    return new Promise((resolve, reject) => {
        var noncestr = config.nonceStr,
            timestamp = Math.floor(Date.now() / 1000), //精确到秒
            jsapi_ticket;
        if (cache.get('ticket')) {
            jsapi_ticket = cache.get('ticket');
            console.log('1' + 'jsapi_ticket=' + jsapi_ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url);
            resolve({
                debug: false,
                appId: config.appId,
                nonceStr: noncestr,
                timestamp: timestamp,
                // jsapi_ticket: jsapi_ticket,
                signature: sha1('jsapi_ticket=' + jsapi_ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url)
            });
        } else {
            request(accessTokenUrl + '?grant_type=' + config.grant_type + '&appid=' + config.appId + '&secret=' + config.appsecret, function (error, response, body) {
                if(error) {
                    reject(error);
                    return;
                }
                if (response.statusCode == 200) {
                    var tokenMap = JSON.parse(body);
                    if(tokenMap.errorcode) {
                        reject(tokenMap.errmsg);
                        return;
                    }
                    request(ticketUrl + '?access_token=' + tokenMap.access_token + '&type=jsapi', function (error, resp, json) {
                        if(error) {
                            reject(error);
                            return;
                        }
                        if (response.statusCode == 200) {
                            var ticketMap = JSON.parse(json);
                            if(ticketMap.errorcode) {
                                reject(ticketMap.errmsg);
                                return;
                            }
                            cache.put('ticket', ticketMap.ticket, cache_duration);  //加入缓存
                            console.log('jsapi_ticket=' + ticketMap.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url);
                            resolve({
                                debug: false,
                                appId: config.appId,
                                nonceStr: noncestr,
                                timestamp: timestamp,
                                // jsapi_ticket: ticketMap.ticket,
                                signature: sha1('jsapi_ticket=' + ticketMap.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url)
                            });
                        }
                    })
                }
            })
        }
    });
}
