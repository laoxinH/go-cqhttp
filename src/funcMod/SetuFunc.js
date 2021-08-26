const $ = require("../tools/Env")("setu");
const utils = require("../tools/Utils");

module.exports = async function main(req, res, msg) {
    let funcInfo = utils.getFuncInfo(msg);
    // 获取发送者qq号
    let qqNum = utils.getQQNum(req);
    // 群发判断
    let isGroup = utils.getQGroup(req) ? true : false;
    // 调用sendMsg时所用的id,(私聊为qq号,群发为群号)
    let id = isGroup ? utils.getQGroup(req) : utils.getQQNum(req);
    // 判断是否包含指令关键字或者是否是"下一个"的指令
    // msgId 是所回复消息的id值
    let reg = /\[CQ:reply,id=([+\-0-9]{5,20})\]/;
    let msgID = reg.test(msg) ? reg.exec(msg)[1] : null;
    let isNext = msgID != null && msg.indexOf("下一个") != -1 && $.lastMsgId == msgID;
    /*    console.log("是否为@或者回复" + 0 + "\r\n"+
            "是否触发下一个小姐姐" + isNext + "\r\n" +
            "当前小姐姐消息id" + $.lastMsgId + "\r\n" +
            "当前消息ID" + msgID + "\r\n" +
            "是否为群消息" + isGroup + "\r\n" +
            `${msgID != null}` + `${msg.indexOf("下一个") != -1}` + `${$.lastMsgId == msgID}` +
            "==================================="
        );*/
    if (!(funcInfo.keyword == "涩图" || isNext)) {
        //console.log($.name + "开始就结束了")
        return "";
    } else {
        // 直接向go-cq返回空消息
        utils.doNothing(res);
        let query = funcInfo.query ? funcInfo.query : "";
        if (query.indexOf("help") != -1 || query.indexOf("帮助") != -1) {
            let msg = "🐍图指南: \r\n" +
                "涩图 -- 获取随机🐍图\r\n" +
                "涩图 关键字 -- 搜索想要的图请(例:涩图 人妖)\r\n\r\n" +
                "高级搜图说明比如: 需要查找“(萝莉或少女)的(白丝或黑丝)的色图\r\n请尝试发送: 涩图(空格)萝莉，少女#白丝，黑丝"
            return utils.sendMsg(id, msg, isGroup);
        } else {
            let setuInfo = await getSetuInfo(query, isNext).catch(e => {
                utils.sendMsg(id, "🐍图获取失败了╰(*°▽°*)╯", isGroup);
            });
            //console.log(setuInfo)

            if (setuInfo) {
                let msg = `[CQ:at,qq=${qqNum}]\n` +
                    "作品名称: " + setuInfo.title + "\n" +
                    "作者名称: " + setuInfo.author + "\n" +
                    "作者ID: " + setuInfo.uid + "\n" +
                    "作品ID: " + setuInfo.pid + "\n" +
                    "上传时间: " + setuInfo.date + "\n" +
                    "[CQ:image,file=" + setuInfo.url + ",c=2]";
                $.lastMsgId = await utils.sendMsg(id, msg, isGroup);
            } else {
                let  msg = `[CQ:at,qq=${qqNum}]你的XP太JB怪了，根本就找不到啊~`
                $.lastMsgId = await utils.sendMsg(id, msg, isGroup);
            }
        }
    }
}


async function getTags(query, isNext) {
    //console.log("我准备发涩图了")
    let tag = [];
    if (!query && !isNext) {
        return tag;
    } else if (isNext) {
        // console.log($.tags)
        return $.tags;
    }
    let tags = query.trim().split("#");
    //console.log(tags)
    for (let i = 0; i < (tags.length <= 3 ? tags.length : 3); i++) {
        let str = tags[i] + "";
        tag.push(str.split("，"));
    }
    //console.log(tags)
    $.tags = tag;
    return tag;
}

async function getSetuInfo(query, isNext) {
    let opts = {
        headers: {
            "Content-Type": "application/json"
        },
        url: "https://api.lolicon.app/setu/v2",
        json: {
            tag: await getTags(query, isNext),
            size: ["regular"]
        }
    }
    //console.log(opts.json.tag);
    return new Promise((resolve, reject) => {
        $.post(opts, (err, res, data) => {
            if (err) {
                reject(new Error(err + "[描述]:涩图获取失败"))
            }
            data = $.toObj(data);
            if (data.error) {
                reject(new Error(data.error + "[描述]:涩图获取失败"));
            } else {
                if (data.data[0]) {
                    let setuInfo = {
                        url: data.data[0].urls.regular,
                        author: data.data[0].author,
                        uid: data.data[0].uid,
                        title: data.data[0].title,
                        pid: data.data[0].pid,
                        date: function () {
                            let update = data.data[0].uploadDate;
                            update = new Date(update);
                            let year = update.getFullYear();
                            let month = update.getMonth() + 1;
                            let date = update.getDate();
                            return year + "-" + month + "-" + date;
                        }()
                    }
                    resolve(setuInfo);
                    //console.log(setuInfo)
                } else {
                    resolve();
                }
            }
        })
    })
}
