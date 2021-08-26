const utils = require("../tools/Utils");
const $ = require("../tools/Env")("otherFunc");
module.exports = async function main(req, res, msg) {
    // 获取发送者qq号
    let qqNum = utils.getQQNum(req);
    // 群发判断
    let isGroup = utils.isGroupMsg(req);
    // 调用sendMsg时所用的id,(私聊为qq号,群发为群号)
    let id = isGroup ? utils.getQGroup(req) : utils.getQQNum(req);
    let regMsg = /\[CQ:reply,id=([+\-0-9]{5,20})\]/;
    let msgID = regMsg.test(msg) ? regMsg.exec(msg)[1] : null;
    // 判断是否为@或者回复
    let isAtOrPrivate =  utils.isPrivateMsg(req)|| msg.indexOf(utils.getBotQQ()) != -1;
    let isNext = msgID != null && msg.indexOf("下一个") != -1 && $.lastMsgId == msgID;      // 判断是否为下一个小姐姐
    /*console.log("是否为@或者回复" + isAtOrReply + "\r\n"+
        "是否触发下一个小姐姐" + isNext + "\r\n" +
        "当前小姐姐消息id" + $.lastMsgId + "\r\n" +
        "当前消息ID" + msgID + "\r\n" +
        "是否为群消息" + isGroup + "\r\n" +
        `${msgID != null}` + `${msg.indexOf("下一个") != -1}` + `${$.lastMsgId == msgID}` +
        "==================================="
    );*/
    if (msg.trim() == "其他") {
        let query = msg.query ? msg.query : "";
        if (query == "" || query == "帮助" || query == "help") {
            let msg = "其他说明🤣小姐姐 -- 你懂的, 小妹妹 -- 不多解释, 放屁 -- 看似牛逼的格言";
            utils.doNothing(res);
            return utils.sendMsg(id, msg, isGroup);
        }
        return;
    }
    if (msg == "小姐姐" || isNext) {
        let msg = "";
        if (Math.random() <= 0.5) {
            let index = Math.floor(Math.random() * 4) + 1;
            let imgUrl = "";
            switch (index) {
                case 1 :
                    imgUrl = "http://3650000.xyz/random/?mode=5" + `&t=${new Date().getTime()}`;
                    break
                case 2:
                    imgUrl = "http://api.nmb.show/xiaojiejie1.php" + `?t=${new Date().getTime()}`;
                    break
                case 3:
                    imgUrl = "http://3650000.xyz/random/?mode=8" + `&t=${new Date().getTime()}`;
                    break
                case 4:
                    imgUrl = "http://3650000.xyz/random/?mode=66" + `&t=${new Date().getTime()}`;
                    break
                default:
                    imgUrl = "http://api.nmb.show/xiaojiejie1.php" + `?t=${new Date().getTime()}`;
                    break

            }

            msg = "[CQ:at,qq=" + qqNum + "]" + await getWord() + "[CQ:image,file=" + imgUrl + ",c=2]";

        } else {
            let number = Math.floor(Math.random() * 10);
            let beMsg;
            switch (number) {
                case 0:
                    beMsg = "少打✈多做事, 没事不要乱放屁🐶!";
                    break;
                case 1:
                    beMsg = "多读书多看报, 没事就去睡睡觉💤!";
                    break;
                case 2:
                    beMsg = "不要老想搞颜色啊👿, 想想你的下半身该怎么办?";
                    break;
                case 3:
                    beMsg = "人生不如意十有八九,难道你就只能看🐍图来安慰自己?"
                    break;
                case 4:
                    beMsg = "大千世界无奇不有, 不过像你这种lsp我还是头一次见😂"
                    break;
                case 5:
                    beMsg = "看图片已经不能满足你了, 去p站看视频吧!"
                    break;
                default:
                    beMsg = "看看名言吧, 我的伙计, 不要残害身体了: " + await getWord();
            }
            msg = "[CQ:at,qq=" + qqNum + "]" + beMsg;
        }
        utils.doNothing(res);
        $.lastMsgId = await utils.sendMsg(id, msg, isGroup);
        //console.log("当前消息ID: " + $.lastMsgId)

    } else if (msg == "放屁") {
        let msg = `[CQ:at,qq=${qqNum}]` + await getWord();
        return utils.reMsg(msg, res);

    } else if (msg == "小妹妹") {
        let msg = `[CQ:at,qq=${qqNum}]你怕是想进去了吧[CQ:image,file=https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fgss0.baidu.com%2F7Po3dSag_xI4khGko9WTAnF6hhy%2Fzhidao%2Fpic%2Fitem%2F0823dd54564e92585e41b8449682d158ccbf4e26.jpg&refer=http%3A%2F%2Fgss0.baidu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1631956581&t=26bc3117731cb687d34ea2df9fe7e7e3,c=2]`
        return utils.reMsg(msg, res);

        // 在群里@或者回复是触发(私聊也能触发)
    } else if (isAtOrPrivate) {
        let funcList = utils.getFuncList("user");
        let index = Math.floor(Math.random() * utils.getFuncList("user").length);
        let msg = "我搞不懂你在说什么😔, 你可以尝试在群或者私聊里发送: \"" + funcList[index].keyword + "\" ,试试看哦b（￣▽￣）d　";
        utils.reMsg(msg, res);
    } else {
        utils.doNothing(res);
    }
}

function getWord() {
    return new Promise(resolve => {
        let opts = {
            url: "https://v1.hitokoto.cn/",
        }
        $.get(opts, (err, res, data) => {
            if (err) {
                resolve("你觉得很有道理,其实我在放屁!")
                console.log(err);
            }
            data = $.toObj(data);
            if (data || data.id) {
                resolve(data.hitokoto);
            }
        })
    })
}
