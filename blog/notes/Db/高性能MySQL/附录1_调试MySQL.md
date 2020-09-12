Title: MySQL异常问题常用解决方法汇总
Date:  2015-01-01


MySQL异常问题常用解决方法汇总
============================

## 一般性检查

1、是否配置问题

	mysqld --skip-new  #禁用新特性
	mysqld --print-defaults #查看使用了哪些配置项
	mysqld --no-defaults #禁用

2、查看进程和状态
  mysqld进程在运行，但不能作出正常响应。可能问题是所有连接数跑满，且都在运行中；也可能是内部锁问题。遇到这类问题，mysqladmin可成功创建连接，并提供当前进程的有用状态信息。

	/*找出有问题的查询*/
	mysqladmin processlist status
	
	/*如果你遇到性能问题或创建新连接失败*/
	mysqladmin -i5 [-r] processlist status
	mysqladmin version
	
3、检查Error Log

选择日志类型

	--console 意为 stderr，如果未配置log-error或syslog则默认为使用这个
	--syslog 进行系统日志，如果设置,console失效
	--log-error=xxx 日志错误，如果设置，则console失效
	--log-warnings=1 默认日志异常警告信息，改为0只日志错误。如果>1，连接中断、access denied、new connection attempts 也会进行日志。
	
如果使用mysqld_safe启用mysqld 默认为--skip-syslog,mysql_safe会查找cnf配置文件中的--log-err选项并选用。  
如果mysqld进程宕掉，mysqld_save会发现并重启mysqld，并记录重启信息到日志。  
	
	输出日志
	FLUSH LOGS; 
	mysqladmin flush-logs
    
    #如果输出到新文件
    sh> mv host_name.err host_name.err.old
    sh> mysqladmin flush-logs
    sh> mv host_name.err.old backup-directory
    
4、运行测试用例

	mysql-test
	sql-bench
	tests/fork_big.pl

5、lockd锁管理器运行不正常

	--skip-external-locking 为mysqld设置该参数。

6、gdb调试
  用gdb启动mysqld，运行测试脚本，打印backtrace、局部变量信息。当mysqld崩溃后，在gdb中运行如下命令：

	backtrace
	info local
	up
	info local
	up
	info local
	#显示线程信息可以用：
	info threads
	#切换到线程 n
	thread n

7、变长字段

  varchar类变长字段一般很少出问题，但动态长度的行本性上更倾向于出错。

8、考虑硬件导致出错的可能性

   有缺陷的硬件或驱动可能导致数据资料损坏，出问题后，排除硬件故障时，也要充分关注你的硬盘、内存等硬件。
	
## 调试MySQL

### 编译MySQL为可调试

* 编译时带上参数 `-DWITH_DEBUG=1`。  
* 运行`mysqld --help`，如果有输出`--debug`标志则说明开启了debug。
* `mysqladmin ver`也可查看
* 也可不指定`-DWITH_DEBUG=1`，但在编译环境`CFLAGS`和`CXXFLAGS`中添加`-g`参数。
* 注意，编译后主服务文件为mysqld-debug，不存在mysqld，如果要启用服务，注意link一个mysqld文件。


### 创建跟踪文件

编译为debug模式后，可添加--debug参数。`mysqld --debug`，windows下还要添加 --standalone：`mysqld --debug --standalone`。默认输出文件为/tmp/mysqld.trace，windows下为c:\mysqld.trace

	mysqld --debug
	#默认参数可能会生成过大的日志。通过以下参数，只输出自己关心的操作，以获得更小的跟踪日志
	mysqld --debug=d,info,error,query,general,where:O,/tmp/mysqld.trace
	

### 使用pdb来创建一个新的 Windows crashdump

### 使用栈跟踪文件

### 使用MySQL服务端日志来查找mysqld错误原因

### 使用测试用例