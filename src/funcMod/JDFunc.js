const JDUtils = require("./JDFuncUtils/JDUtils");
const JDbeanChange = require("./JDFuncUtils/JDbeanChange");
const utils = require("../tools/Utils");
const JDGetCookie = require("./JDFuncUtils/JDGetCookie");

module.exports = async function main(req, res) {
    let funcInfo = utils.getFuncInfo(utils.getMsg(req));
    // 判断是否包含指令关键字
    let keyword = funcInfo.keyword;


    if (!(funcInfo.keyword && funcInfo.keyword == "京东")) {
        //console.log("京东开始就结束了")
        return;
    }

    let isGroup = utils.getQGroup(req) ? true : false;
    let id = isGroup ? utils.getQGroup(req) : utils.getQQNum(req);
    const supper = utils.isSuper(utils.getQQNum(req));
    const admin = utils.isAdmin(utils.getQQNum(req));
    let key = funcInfo.keyword;
    let query = funcInfo.query ? funcInfo.query : "";
    if (query == "帮助" || query == "help" || query == "") {
        let msg = "京D使用指北:\n" +
            "京东 帮助 -- 查看使用说明\n" +
            "京东 查询 -- 查询\n" +
            "京东 登录 -- 登录开始挂机";
        utils.doNothing(res);
        return utils.sendMsg(id, msg, isGroup);
    }
    if (query == "京豆" || query == "查询") {
        let msg = "";
        utils.doNothing(res);
        JDUtils.getCK(utils.getQQNum(req)).then(async (ck) => {
            if (ck) {
                let cookies = [];
                cookies.push(ck.value);
                msg = `[CQ:at,qq=${utils.getQQNum(req)}]\n` + await JDbeanChange(cookies);
            } else {
                msg = `[CQ:at,qq=${utils.getQQNum(req)}]当前账号未绑定哦\r\n请发送：京东 登录`;
            }
            return utils.sendMsg(id, msg, isGroup);
        })
        return;
    } else if (query == "登录") {
        utils.doNothing(res);
        let msg = "";
        let data = await JDGetCookie(req);
        //console.log(data)
        if (data.cookie) {
            let ckJson = await JDUtils.getCK(data.pin);
            //console.log(ckJson)
            if (ckJson) {
                //环境变量种中已经存在
                let envData = {"name": ckJson.name, "value": data.cookie, "remarks": ckJson.remarks, "_id": ckJson._id};
                await JDUtils.freshenCK(envData).then(flag=>{
                    if (flag){
                        msg = `[CQ:at,qq=${utils.getQQNum(req)}]CK更新成功!`;
                    } else {
                        msg = `[CQ:at,qq=${utils.getQQNum(req)}]扫码添加失败!请手动打开: ${JDUtils.getNinjaUrl()}
        手机推荐使用浏览器登录,选择跳转app登录更方便
        设置昵称(备注)为自己的QQ号,方便查询信息`;
                    }
                }).catch(e=>{
                    console.error(e);
                });
            } else {
                // 不存在此环境变量的情况
                let envData = [{"value": data.cookie, "name": "JD_COOKIE", "remarks": "remark=" + utils.getQQNum(req) + ";"}]
                await JDUtils.addCK(envData).then((flag) => {
                    if (flag) {
                        msg = `[CQ:at,qq=${utils.getQQNum(req)}]账号添加成功了，enjoy！！!`
                    } else {
                        msg = `[CQ:at,qq=${utils.getQQNum(req)}]扫码添加失败!请手动打开: ${JDUtils.getNinjaUrl()}
        手机推荐使用浏览器登录,选择跳转app登录更方便
        设置昵称(备注)为自己的QQ号,方便查询信息`
                    }
                }).catch(e=>{
                    console.log(e);
                });
            }
        } else {
            msg = `[CQ:at,qq=${utils.getQQNum(req)}]扫码登录暂不可用或未扫码,请打开: ${JDUtils.getNinjaUrl()}
        手机推荐使用浏览器登录,选择跳转app登录更方便
        设置昵称(备注)为自己的QQ号,方便查询信息`
        }
        return utils.sendMsg(id, msg, isGroup).catch(e=>{
            console.log(e);
        });
    } else {
        return utils.doNothing(res);
    }
}
