/**
 *
 * 基本消息类型分发
 *
 */
const hb = require("./Heartbeat");  // 心跳数据（无需出处理）
const msg = require("./Message");   // 消息类型
const not = require("./Notice");    // 通知类型
const req = require("./Request");   // 请求类型

module.exports = {
    meta_event: hb.handle,
    message: msg.method,
    notice: not.method,
    request: req.method

}