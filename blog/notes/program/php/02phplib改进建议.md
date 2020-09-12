#phplib改进建议
## 1 概述
### 1.2 代码清理
#### 1.2.1 重复代码
* syb/act中base中的登录部分代码存在多份copy
* GameID及对应的wx/qq的appid/securet存在多分重复定义

#### 1.2.2 业务逻辑及基础框架混写在一起
Framework.class.php/Base.class.php

#### 1.2.3 try...catch泛滥
* try...catch框架级统一处理
* 正式环境显示友好异常，不显示具体错误
* 开发及测试环境显示错误详细信息
### 1.2.4 monitor调用方式改进

MONITOR_U_START("0x36600x03lottery");
$ret = lotteryact_lotteryreq($this->uin, $this->qt_proto_appid, $ip_port["ip"], $ip_port["port"], $this->time_out , $activityid, $user, $web_extral);
MONITOR_U_STOP("0x36600x03lottery", $ret["errno"]);
改为：
$ret = Monitor::call('0x36600x03lottery'=>'lotteryact_lotteryreq',array(
    $this->uin, $this->qt_proto_appid, $ip_port["ip"], $ip_port["port"], $this->time_out , $activityid, $user, $web_extral
));

### 1.2.5 php文件结尾不再用?>封闭
- 除模板文件外，不要将php文件以?>结尾，以不小心带出输出空白，导致发送header无效
- json输出，header统一标识为 Content-Type:application/json;


#### 1.2.6 日志简化


### 1.3 目录结构治理
#### 1.3.1 包管理机制引入
#### 1.3.1 php包管理机制



PSR-0规范(09年出，已废弃)
1 命名空间必须与绝对路径一致 
2 类名首字母必须大写 
3 除去入口文件外，其他“.php”必须只有一个类 
4 php类文件必须自动载入，不采用include等 
5 单一入口

PSR-4规范(13年底)
- classes, interfaces, traits及其它类似结构体遵守该规范
- 类名须有顶级全名空间（vendor namespace)/子级命名空间/终级名称
- 类名中的下划线不再有特殊含义
- 类名须没用大小写敏感风格
- 类名
### 1.4 多入口优缺点（相对统一入口）

多入口优点：
控制层前移，无需要路由层，更轻量。

多入口缺点：
入口语法层面的错误框架不能捕获
每个入口都要加载框架
每个入口都要手动运行控制代码

### 1.6 企业级应用框架
达到原生php性能80%以上（意味着框架不能太重)
功能齐全(公共基础类库、业务相关类库)，按需自动加载（无include)
分层清晰而又不过度分层

### 1.7 开发环境改进建议
代码及开发环境在本地
接口请求使用代理/




## 2其它改进建议

### 2.1 不同应用分开

### 2.2 同一应用全部放一起

### 2.3 MVC即可，不用太多分层

### 2.4 最少暴露原理，易于部署



