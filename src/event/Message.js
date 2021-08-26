const utils = require("../tools/Utils");

module.exports = {
    method: (req, res) => {
        let qqNum = utils.getQQNum(req);
        let groupId = utils.getQGroup(req);
        //管理员功能无条件打开
        if (utils.isSuper(qqNum) || utils.isAdmin(qqNum)) {
            let funcInfo = utils.getFuncInfo(utils.getMsg(req));
            if (funcInfo.modName == "AdminFunc") {
                let funcMod = require(`../funcMod/${funcInfo.modName}`)(req, res, funcInfo);
            }
        }
        // 判断是否为私聊消息
        if (req.body.message_type == "private") {
            if (utils.isUser(qqNum) || utils.isAdmin(qqNum) || utils.isSuper(qqNum)) {
                handleMsg(req, res);
            } else {
                console.log("收到",qqNum,"的消息,不在用户名单中")
                utils.doNothing(res);
            }
            // 判断是否为群发消息
        } else if (req.body.message_type == "group") {
            let groupId = utils.getQGroup(req);
            if (utils.isGroup(groupId)) {
                handleMsg(req, res);
            } else {
                console.log("收到",groupId,"的消息,不在群单中");
                utils.doNothing(res);
            }

        }
    }
}

function handleMsg(req, res) {
    let msg = utils.getMsg(req) + "";
    //let funcInfo = utils.getFuncInfo(msg);
    let funcList = utils.getFuncList("user");
    for (let funcMod of funcList) {
        require(`../funcMod/${funcMod.modName}`)(req, res, msg);
    }

    /* 通过关键字加空格的消息分发模式
       console.log(funcInfo);
        if (funcInfo.modName) {
            let funcMod = require(`../funcMod/${funcInfo.modName}`)(req, res, funcInfo);
        } else if (funcInfo) {
            let funcMod = require(`../funcMod/OtherFunc`)(req,res,funcInfo);
        }*/
}