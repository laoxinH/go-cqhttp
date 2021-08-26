const utils = require("../../tools/Utils");
//const $ = require("../../tools/Env")("获取JDCK");
const JDconfig = require("../JDFuncUtils/JDConfig");
let json,JDUA,$;

module.exports = getJDCookie;
function getJDCookie(request) {
    $ = require("../../tools/Env")("获取JDCK");
    //console.log(request)
    let req = request;
    JDUA = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5 UCBrowser/13.4.2.1122`";
    return new Promise(async (resolve) => {

        json = {};
        let loginData = await loginEntrance().catch(e=>{console.error(e)})
        let formatCookies = await formatSetCookies(loginData.headers,loginData.data).catch(e=>{console.error(e)});
        let data = await generateQrcode(formatCookies,req);
        let ck = await getCookie(formatCookies,data,resolve);

    })
}


function loginEntrance() {
    // let $ = require("../../tools/Env")("获取JDCK");
    return new Promise((resolve) => {
        $.get(taskUrl(), async (err, resp, data) => {
            try {
                if (err) {
                    resolve(false);
                    //json.err = `${$.name} API请求失败，请检查网路重试`;
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    resolve({
                        headers : resp.headers,
                        data: JSON.parse(data)
                    });

                }
            } catch (e) {
                $.logErr(e, resp)
                resolve(false);
            } finally {
                resolve();
            }
        })
    })
}

function generateQrcode(formatSetCookies,req) {
    return new Promise((resolve) => {
        //$.log("获取taken的url",$.toStr(taskPostUrl(formatSetCookies)))
        $.post(taskPostUrl(formatSetCookies), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    $.stepsHeaders = resp.headers;
                    //$.log("data",data)
                    data = JSON.parse(data);
                    let token = data['token'];
                    //$.log('token', token)

                    const setCookie = resp.headers['set-cookie'][0];
                    //okl_token = setCookie.substring(setCookie.indexOf("=") + 1, setCookie.indexOf(";"))
                    let url = 'https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=' + token;
                    url = url.replace(/&/gm, "%26");
                    let QRUrl = await getQrCard(url);
                    let isGroup = utils.getQGroup(req) ? true : false;
                    let id = isGroup ? utils.getQGroup(req) : utils.getQQNum(req);
                    let msg = `[CQ:at,qq=${utils.getQQNum(req)}]\n[CQ:image,file=http:${QRUrl},c=2]`;
                    resolve({
                        token:data['token'],
                        okl_token:setCookie.substring(setCookie.indexOf("=") + 1, setCookie.indexOf(";")),
                    })
                    return utils.sendMsg(id,msg,isGroup);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function checkLogin(formatCookies,data) {
    return new Promise((resolve) => {
        const options = {
            url: `https://plogin.m.jd.com/cgi-bin/m/tmauthchecktoken?&token=${data.token}&ou_state=0&okl_token=${data.okl_token}`,
            body: `lang=chs&appid=300&source=wq_passport&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action`,
            timeout: 10 * 1000,
            headers: {
                'Referer': `https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`,
                'Cookie': formatCookies.cookies,
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent':JDUA || 'jdapp;android;10.0.5;11;0393465333165363-5333430323261366;network/wifi;model/M2102K1C;osVer/30;appBuild/88681;partner/lc001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; M2102K1C Build/RKQ1.201112.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045534 Mobile Safari/537.36',
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    data = JSON.parse(data);
                    data.checkLoginHeaders = resp.headers;

                    // $.log(`errcode:${data['errcode']}`)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function getCookie(formatCookies,data,resolve) {
    let check = setInterval(async () => {
        const checkRes = await checkLogin(formatCookies,data);
        //console.log(checkRes)
        if (checkRes['errcode'] === 0) {
            //扫描登录成功
            //$.log(`扫描登录成功\n`)
            json.msg = "扫码登录成功";
            clearInterval(check);

            await formatCookie(checkRes.checkLoginHeaders,resolve);
            $.done("这是登录成功结束");
        } else if (checkRes['errcode'] === 21) {
            //$.log(`二维码已失效，请重新获取二维码重新扫描\n`);
            json.err = "二维码已失效!请重新获取!";
            resolve(json);
            clearInterval(check);
            $.done("这是失效结束");
        } else if (checkRes['errcode'] === 176) {
            //未扫描登录
        } else {
            json.err = `其他异常：${JSON.stringify(checkRes)}`;
            //$.log(`其他异常：${JSON.stringify(checkRes)}\n`);
            resolve(json);

            console.log("这是其他情况" + JSON.stringify(checkRes))
            clearInterval(check);
            $.done("这是其他情况");
        }
    }, 1000)
}

function formatCookie(headers,res) {
    return new Promise(resolve => {
        let pt_key = headers['set-cookie'][1]
        pt_key = pt_key.substring(pt_key.indexOf("=") + 1, pt_key.indexOf(";"))
        let pt_pin = headers['set-cookie'][2]
        pt_pin = pt_pin.substring(pt_pin.indexOf("=") + 1, pt_pin.indexOf(";"))
        const cookie1 = "pt_key=" + pt_key + ";pt_pin=" + pt_pin + ";";
        json.pin = pt_pin;
        json.cookie = cookie1;
        //console.log(json)
        res(json);
        resolve()
    })
}

function formatSetCookies(headers, body) {
    return new Promise(resolve => {
        let data  = {
            s_token:body['s_token'],
            guid : headers['set-cookie'][0].substring(headers['set-cookie'][0].indexOf("=") + 1,headers['set-cookie'][0].indexOf(";")),
            lsid:headers['set-cookie'][2].substring(headers['set-cookie'][2].indexOf("=") + 1,headers['set-cookie'][2].indexOf(";")),
            lstoken:headers['set-cookie'][3].substring(headers['set-cookie'][3].indexOf("=") + 1,headers['set-cookie'][3].indexOf(";")),

        };
        let cookies = "guid=" + data.guid + "; lang=chs; lsid=" + data.lsid + "; lstoken=" + data.lstoken + "; "
        data.cookies = cookies;
        resolve(data);
    })
}

function taskUrl() {
    return {
        url: `https://plogin.m.jd.com/cgi-bin/mm/new_login_entrance?lang=chs&appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`,
        timeout: 10 * 1000,
        headers: {
            'Connection': 'Keep-Alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-cn',
            'Referer': `https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`,
            'User-Agent':JDUA || 'jdapp;android;10.0.5;11;0393465333165363-5333430323261366;network/wifi;model/M2102K1C;osVer/30;appBuild/88681;partner/lc001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; M2102K1C Build/RKQ1.201112.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045534 Mobile Safari/537.36',
            'Host': 'plogin.m.jd.com'
        }
    }
}

function taskPostUrl(data) {
    return {
        url: `https://plogin.m.jd.com/cgi-bin/m/tmauthreflogurl?s_token=${data.s_token}&v=${Date.now()}&remember=true`,
        body: `lang=chs&appid=300&source=wq_passport&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action`,
        timeout: 10 * 1000,
        headers: {
            'Connection': 'Keep-Alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-cn',
            'Referer': `https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`,
            'User-Agent':JDUA ||  'jdapp;android;10.0.5;11;0393465333165363-5333430323261366;network/wifi;model/M2102K1C;osVer/30;appBuild/88681;partner/lc001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; M2102K1C Build/RKQ1.201112.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045534 Mobile Safari/537.36',
            'Host': 'plogin.m.jd.com'
        }
    }
}

function getQrCard(url) {
    let qrMould = JDconfig.qrMould;

    let opts = {
        url: `https://cli.im/api/qrcode/code?text=${url}&mhid=${qrMould}`
    }
    //console.log(opts.url)
    return new Promise(resolve => {
        $.get(opts, (err, resp, body) => {
            if (err) {
                resolve(new Error(err + "\r\n二维码获取失败!"));
            }
            let reg = /qrcode_plugins_img ="(.*)"/
            if (reg.test(body)) {
                resolve(body.match(reg)[1]);
            } else {
                resolve(new Error("二维码获取失败!"));
            }
        })
    })

}

function getUA(){
    return  `jdapp;iPhone;10.0.10;14.3;${randomString(40)};network/wifi;model/iPhone12,1;addressid/4199175193;appBuild/167741;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
    for (let i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}
