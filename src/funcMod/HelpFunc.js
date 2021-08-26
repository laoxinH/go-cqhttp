const utils = require("../tools/Utils");
module.exports = function main (req,res) {
    let funcInfo = utils.getFuncInfo(utils.getMsg(req));
    // 判断是否包含指令关键字

    if (!(funcInfo.keyword && funcInfo.keyword == "帮助")) {
        //console.log( "帮助func开始就结束了")
        return;
    }
    let isGroup = utils.getQGroup(req) ? true : false;
    let id = isGroup ? utils.getQGroup(req) : utils.getQQNum(req);
    let funcList = utils.getFuncList("user");
    //console.log(funcList)
    let msg = utils.funcListToStrMsg("功能列表","-----------------",funcList);
    msg += "\r\n\r\n回复相应的(功能名称 help/帮助)可以查看对应的使用说明\r\n如:涩图 help(或:涩图 帮助)"
    utils.reMsg(msg,res);
}