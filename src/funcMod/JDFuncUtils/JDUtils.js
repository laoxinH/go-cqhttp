const evn = require("../../tools/Env");
const config = require("./JDConfig");
const $ = new evn();
const host = config.QL.host;
const port = config.QL.port;
const user = {
    username: config.QL.username,
    password: config.QL.password
}
const time = new Date().getTime();

/**
 * 京东功能工具包（适配青龙面板）
 */

module.exports = {

    getCK: (qqNum) => {
        return new Promise(async resolve => {
            resolve(await getApi("envs", qqNum))
        })

    },
    getCron: (keyword) => {
        return getApi("crons", keyword);
    },
    getNinjaUrl: () => {
        return config.ninja.url;
    },
    addCK:async (json)=>{
        return new Promise(async resolve => {
            resolve(await addApi(json,"envs","post"))
        })
    },
    freshenCK: async (json)=>{
        return new Promise(async resolve => {
            resolve(await addApi(json,"envs","put"))
        })
    }
}

function QLLogin(user) {
    return new Promise(resolve => {
        let reqData = getReqData("/api/login", "", user)
        $.post(reqData, (err, res, body) => {
            if (err) {
                console.error(`登录失败,请检查!${err}`)
                return;
            }
            const result = $.toObj(body);

            if (body && result.code == 200) {
                resolve(result.data.token);
            } else {
                console.log(body)
            }
        })
    })
}

function getReqData(url, token, data) {
    let reqData = {
        headers: {},
        url: url.indexOf("?") != -1 ? `http://${host}:${port}${url}&t=${time}` : `http://${host}:${port}${url}?t=${time}`,
        json: data
    };
    if (token) {
        reqData.headers.Authorization = "Bearer " + token;
    }
    return reqData;
}

function getApi(api, query) {
    return QLLogin(user).then(token => {
        let reqData = getReqData(`/api/${api}?searchValue=${query}`, token);
        //console.log(reqData)
        return new Promise((resolve) => {
            $.get(reqData, (err, res, body) => {
                if (err) {
                    return console.error(err);
                }
                const result = $.toObj(body);
                if (result && result.code == 200) {
                    if (query) {
                        resolve(result.data[0]);
                        //查看返回值
                        //console.log(result.data[0])
                    } else {
                        resolve(result.data);
                    }
                } else {
                    console.log(body);
                }
            })
        })
    })
}
 function addApi(data,api,method) {
     return QLLogin(user).then(token => {
         let reqData = getReqData(`/api/${api}`, token,data);
         reqData.method = method
         //console.log(reqData)

         return new Promise((resolve) => {
             $.post(reqData, (err, res, body) => {
                 if (err) {
                     return console.error(err);
                 }
                 const result = $.toObj(body);
                 if (result && result.code == 200) {
                     //console.log(data)
                     resolve(true);
                 } else {
                     console.log(body);
                 }
             })
         })
     })

 }