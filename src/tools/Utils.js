const config = require("../config");
const fs = require("fs");
const $ = require("./Env")("机器人系统工具");

module.exports = {
    getQQNum: function (req, callback = function () {
    }) {
        let qq = req.body.user_id;
        return qq;
    },
    getQGroup: (req) => {
        let group = req.body.group_id;
        return group;
    },
    getMsg: (req) => {
        return req.body.message;
    },
    getNickName: (req) => {
        return req.sender.nickName;
    }, getBotQQ: () => {
        return config["go-cq"].botQQ;
    },
    //如果没有查询到指令关键字会直接返回消息类容
    getFuncInfo: (msg) => {
        let pattern = /^[\u4e00-\u9fa5]{1,8}(\s)*[\u4e00-\u9fa5_\Sa-zA-Z0-9]*/;
        // 检查消息是否包含指令格式
        if (pattern.test(msg)) {
            // 从消息中抽取指令内容
            let command = pattern.exec(msg)[0];
            let reg = /[\u4e00-\u9fa5_\Sa-zA-Z0-9]{1,}/g;
            let keyword = command.match(reg)[0]; // 指令关键字
            let query = command.match(reg)[1];   // 指令内容()
            //console.log(command)
            //console.log(reg.exec(command).length)
            // 从配置文件中查询是否包含指令
            let funcInfo = mateFunc(keyword);
            if (funcInfo) {
                // 封装查询结果并返回
                return {
                    keyword: funcInfo.keyword,
                    modName: funcInfo.modName,
                    query: query
                }
            }
            return msg;
        } else {
            return msg;
        }
    },
    getAdminList: () => {
        return config.admin;
    },
    getFuncList: (keyword) => {
        return config.func[keyword];
    },
    isUser: (qqNum) => {
        qqNum = parseInt(qqNum);
        return config.user.indexOf(qqNum) != -1;

    },
    isAdmin: (qqNum) => {
        qqNum = parseInt(qqNum);
        return config.admin.indexOf(qqNum) != -1;
    },
    isSuper: (qqNum) => {
        qqNum = parseInt(qqNum);
        return config.supper.indexOf(qqNum) != -1;
    }, isGroup: (groupID) => {
        groupID = parseInt(groupID);
        return config.group.indexOf(groupID) != -1;

    },
    isGroupMsg: (req) => {
        return req.body.message_type == "group";
    },
    isPrivateMsg: (req) => {
        return req.body.message_type == "private";
    },
    funcListToStrMsg: (title, split, list) => {
        let str = "\t\t✨" + title + "✨\t\r\n\r\n";
        for (let i = 1; i < list.length + 1; i++) {
            if (i % 2 == 0) {
                str += "💕" + list[i - 1].keyword + "\t\r\n"
                str += `${split}\t${split}\t\r\n`
            } else {
                str += "💕" + list[i - 1].keyword + "\t"
            }
        }
        return str;
    }, doNothing: (res) => {
        res.json()
    }, listInfoToStr: (title, pre, list) => {
        let str = "\t\t✨" + title + "✨\t\r\n\r\n";
        for (let i = 1; i < list.length + 1; i++) {
            str += pre + i + " : " + list[i - 1] + "\r\n"
        }
        return str;
    }, reMsg: (msgStr, res, notCQ) => {
        let msgJson = {
            reply: msgStr,
            auto_escape: notCQ || false
        }
        // 消息已处理不在回复
        if (res.finished) {
            return;
        }

        try {
            res.json(msgJson);
        } catch (e) {
            console.log("错误，消息发送失败！这个请求已经完成了, 不能再回复该请求了!" + this + e)
        }
    }, addId: async (id, keyword) => {
        let reg = /[0-9]{5,12}/
        if (reg.test(id)) {
            id = parseInt(id);
            if (config[keyword].indexOf(id) != -1) {
                return keyword + "已存在!"
            }
            ;
            config[keyword].push(id);
            let data = "module.exports =" + JSON.stringify(config, null, "\t");
            let flag = false;
            await writeConfig(data).then(err => {
                if (!err) {
                    flag = true;
                }
            })
            if (flag) {
                return "添加成功!"
            } else {
                return "添加失败!"
            }
        } else {
            return "请检查你输入的ID是否正确!"
        }
    }, delId: async (id, keyword) => {
        let reg = /[0-9]{5,12}/; // 用于检测id是否正确的正则
        if (reg.test(id)) {
            id = parseInt(id); // 转换为int类型
            if (config[keyword].indexOf(id) != -1) {
                config[keyword].remove = function (val) {
                    let index = this.indexOf(val);
                    if (index > -1) {
                        this.splice(index, 1);
                    } else {
                        return new Error("数组中没有该元素!");
                    }
                }
                try {
                    config[keyword].remove(id)
                } catch (e) {
                    return "此ID不存在!"
                }
                let data = "module.exports =" + JSON.stringify(config, null, "\t");
                let flag = false;
                await writeConfig(data).then(err => {
                    if (!err) {
                        flag = true;
                    }
                })
                if (flag) {
                    return "删除成功!"
                } else {
                    return "删除失败!"
                }
            } else {
                return "请检查你输入的ID是否正确!"
            }
        }

    }, sendMsg: async (id, msg, isGroup) => {
        let url = isGroup ? "/send_group_msg" : "/send_private_msg";
        let toID = isGroup ? "group_id=" + id : "user_id=" + id;

        const options = {
            url: config["go-cq"].port ? `http://${config["go-cq"].host}:${config["go-cq"].port}${url}?access_token=${config["go-cq"].token}&${toID}` : `http://${config["go-cq"].host}:${config["go-cq"].port}${url}?access_token=${config["go-cq"].token}&${toID}`,
            json: {message: `${msg}`},
            headers: {
                'Content-Type': 'application/json',
            }
        };
        //console.log(options)
        //console.log(options.url)
        return await new Promise(resolve => {
            $.post(options, (err, resp, data) => {
                if (err) {
                    console.log(err);
                    resolve();
                } else {
                    //console.log(data)
                    data = JSON.parse(data);
                    if (data.retcode === 0) {
                        resolve(data.data.message_id)
                    } else if (data.retcode === 100) {
                        console.log(`go-cqhttp发送通知消息异常: ${JSON.stringify(data)}\n${options.json.message}`);
                        resolve();
                    } else {
                        console.log(`go-cqhttp发送通知消息异常\n${JSON.stringify(data)}\n${options.json.message}`);
                        resolve();
                    }
                }
            });


        })

    }, delMsg: (msgId) => {
        if (!msgId) return;
        let url = "/delete_msg";
        const options = {
            url: config["go-cq"].port ? `http://${config["go-cq"].host}:${config["go-cq"].port}${url}?access_token=${config["go-cq"].token}` : `http://${config["go-cq"].host}:${config["go-cq"].port}${url}?access_token=${config["go-cq"].token}`,
            json: {message_id: msgId},
            headers: {
                'Content-Type': 'application/json',
            }
        }
        $.post(options, (err, res, data) => {
            if (err) {
                console.log("撤回消息失败!" + err)
            }
        })
    }
}

function mateFunc(keyword) {
    for (let adminFuncs of config.func.admin) {
        if (adminFuncs.keyword == keyword) {
            return adminFuncs;
        }
    }
    for (let userFunc of config.func.user) {
        if (userFunc.keyword == keyword) {
            return userFunc;
        }
    }
    return null;
}

async function writeConfig(data) {
    return new Promise(resolve => {
        fs.writeFile("./config.js", data, (err) => {
            resolve(err);
        })
    })
}