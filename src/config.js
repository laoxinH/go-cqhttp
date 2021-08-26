module.exports ={
	"go-cq": {
		"host": "127.0.0.1",     // 如非必要无需改动
		"port": "5701",			 // 监听端口号
		"token": "",
		"botQQ" : "2404271664"   // 机器人QQ号
	},
	"supper": [				// 超级管理员QQ
		910964831,
		1966843839
	],
	"admin": [],			// 管理员QQ暂时没用
	"group": [				// 管理的群列表
		544476981,
		7576849,
		6468497,
		57384978,
		167884675,
		694777919,
		529234647,
		432817970
	],
	"user": [				// 用户白名单，在其中QQ发送消息机器人才会回复
		1966843839
	],
	"func": {				// 功能模块
		"admin": [
			{
				"keyword": "查询管理员",
				"modName": "AdminFunc"
			},
			{
				"keyword": "修改管理员",
				"modName": "AdminFunc"
			},
			{
				"keyword": "删除管理员",
				"modName": "AdminFunc"
			},
			{
				"keyword": "添加管理员",
				"modName": "AdminFunc"
			},
			{
				"keyword": "开启群功能",
				"modName": "AdminFunc"
			},
			{
				"keyword": "关闭群功能",
				"modName": "AdminFunc"
			},
			{
				"keyword": "管理员功能",
				"modName": "AdminFunc"
			}
		],
		"user": [
			{
				"keyword": "帮助",
				"modName": "HelpFunc"
			},
			{
				"keyword": "京东",
				"modName": "JDFunc"
			},
			{
				"keyword": "涩图",
				"modName": "SetuFunc"
			},
			{
				"keyword": "其他",
				"modName": "OtherFunc"
			}
		]
	}
}