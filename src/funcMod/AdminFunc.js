const utils = require("../tools/Utils");
module.exports = function main(req, res) {
    let funcInfo = utils.getFuncInfo(utils.getMsg(req));
    const supper = utils.isSuper(utils.getQQNum(req));
    const admin = utils.isAdmin(utils.getQQNum(req));
    let key = funcInfo.keyword;
    let query = funcInfo.query;
    let isGroup = utils.getQGroup(req) ? true : false;
    let id = isGroup ? utils.getQGroup(req) : utils.getQQNum(req);
    // 判断权限是否能执行功能
    if (!(admin || supper)) {
        return utils.doNothing(res);
    }
    utils.doNothing(res);
    if (key == "查询管理员") {
        if (supper) {
            let adminList = utils.getAdminList();
            let msg = utils.listInfoToStr("管理员信息", "管理员", adminList);
            return utils.sendMsg(id, msg, isGroup);
        } else {
            return utils.sendMsg(id, "权限不够!", isGroup);
        }
    } else if (key == "管理员功能") {
        if (admin || supper) {
            let adminFunc = utils.getFuncList("admin");
            let msg = utils.funcListToStrMsg("管理员功能", "------------", adminFunc);
            //console.log(msg);
            return utils.sendMsg(id, msg, isGroup);
        } else {
            return utils.sendMsg(id, "权限不够!", isGroup);
        }
    } else if (key == "添加管理员") {
        if (supper) {
            if (query) {
                let ids = query.trim();
                let idList = ids.split("#");
                for (let idNum of idList) {
                    utils.addId(idNum, "admin").then((msg) => {
                        utils.sendMsg(id, msg, isGroup)
                    });
                }

            } else {
                return utils.sendMsg(id, "添加管理员使用说明\r\n添加管理员(空格)QQ号#QQ号....(多个QQ用#号分割)\r\n举例:添加管理员 1966843839#46461365",
                    isGroup)
            }
        } else {
            return utils.sendMsg(id, "权限不够!", isGroup);
        }
    } else if (key == "开启群功能") {
        if (supper && query) {
            let ids = query.trim();
            let idList = ids.split("#");
            for (let idNum of idList) {
                utils.addId(idNum, "group").then((msg) => {
                    return utils.sendMsg(id, msg, isGroup)
                });
            }
        } else if (supper && isGroup) {
            utils.addId(id, "group").then((msg) => {
                return utils.sendMsg(id,msg, isGroup)
            });

        } else {
            return utils.sendMsg(id,"开启群功能使用说明\r\n开启群功能(空格)群号#群号....(多个群号用#号分割)\r\n举例:开启群功能 1966843839#46461365",
                isGroup)
        }
    } else if (key == "删除管理员") {
        if (supper && query) {
            let ids = query.trim();
            let idList = ids.split("#");
            for (let idNum of idList) {
                utils.delId(idNum, "admin").then((msg) => {
                    return utils.sendMsg(id, msg, isGroup)
                });
            }
        } else {
            return utils.sendMsg(id,"删除管理员使用说明\r\n开启群功能(空格)QQ#QQ....(多个QQ号用#号分割)\r\n举例:删除管理员 1966843839#46461365",
                isGroup)
        }

    } else if (key == "关闭群功能") {
        if (supper && query) {
            let ids = query.trim();
            let idList = ids.split("#");
            for (let idNum of idList) {
                utils.delId(idNum, "group").then((msg) => {
                    return utils.sendMsg(id, msg, isGroup)
                });
            }
        } else if (supper && isGroup) {
            utils.delId(id, "group").then((msg) => {
                return utils.sendMsg(id,msg, isGroup)
            });

        } else {
            return utils.sendMsg(id,"关闭群功能使用说明\r\n关闭群功能(空格)群号#群号....(多个群号用#号分割)\r\n举例:关闭群功能 1966843839#46461365",
                isGroup)
        }

    }


}


