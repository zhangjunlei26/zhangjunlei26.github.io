Title: sql优化
Date:  2015-01-01

sql优化
============================

## 关联指定索引

	SELECT  
	    SUM(aggrpt.imps) as imps,  
	    SUM(aggrpt.clicks) as clicks,  
	    SUM(aggrpt.pos) as pos  
	FROM aggrpt  
	LEFT JOIN  
	(  
	    SELECT  
	    DISTINCT ext_group_id, group_id  
	    FROM sub  
	) sub2  ON(sub2.ext_group_id=aggrpt.adgroupid)  
	GROUP BY  
	aggrpt.report_date,  
	aggrpt.campaignid,  
	aggrpt.adgroupid,  
	aggrpt.keywordid  
	ORDER BY NULL  
	INTO OUTFILE '/tmp/test-sub.txt'  
	Query OK, 47827 rows affected (6 min 47.48 sec)

优化时可以考虑拆分为两个sql语句：

		CREATE TEMPORARY TABLE sub_temp SELECT DISTINCT  ext_group_id, group_id FROM sub  
		Query OK, 72385 rows affected (0.81 sec)  
		Records: 72385  Duplicates: 0  Warnings: 0  
		alter table sub_temp add index  i_ext_group_id(ext_group_id)  
		Query OK, 72385 rows affected (0.10 sec)  
		Records: 72385  Duplicates: 0  Warnings: 0  
		SELECT  
		    SUM(aggrpt.imps) as imps,  
		    SUM(aggrpt.clicks) as clicks,  
		    SUM(aggrpt.pos) as pos  
		FROM aggrpt  
		LEFT JOIN sub_temp sub   ON(sub.ext_group_id=aggrpt.adgroupid)  
		GROUP BY  
		    aggrpt.report_date,  
		    aggrpt.campaignid,  
		    aggrpt.adgroupid,  
		    aggrpt.keywordid  
		ORDER BY NULL  
		INTO OUTFILE '/tmp/test-sub-temp.txt'  
		Query OK, 47827 rows affected (10.41 sec)

也可以强制使用索引或字段：

	SELECT  
	    SUM(aggrpt.imps) as imps,  
	    SUM(aggrpt.clicks) as clicks,  
	    SUM(aggrpt.pos) as pos  
	FROM aggrpt  
	LEFT JOIN  
	( 
	    SELECT  
	    DISTINCT ext_group_id, group_id  
	    FROM sub  
	) sub2 <strong>USE INDEX(ext_group_id)</strong>   ON(sub2.ext_group_id=aggrpt.adgroupid)  
	GROUP BY  
	aggrpt.report_date,  
	aggrpt.campaignid,  
	aggrpt.adgroupid,  
	aggrpt.keywordid  
	ORDER BY NULL  
	INTO OUTFILE '/tmp/test-sub-force.txt'  

but again using USE/FORCE INDEX is a hack here (this can also be implemented as hint) with column name; which acts as a hint to optimizer to create an index on that column (if its hint, then on JOIN column).


## 死锁案例1

	事项 #25452 已由 曾伟标 更新。
	2013-10-18 14:45:09,175 [ERROR]: SSC|ErrorLogHandler|CDbException( exception ):500:"CDbCommand failed to execute the SQL statement: SQLSTATE[40001]: Serialization failure: 1213 Deadlock found when trying to get lock; try restarting transaction. The SQL statement executed was: UPDATE order_curr FORCE INDEX(PRI) SET `status`=1 WHERE id IN(110761) AND `status`=0" 
	DEADLOCK
	------------------------
	131018 14:45:07
	*** (1) TRANSACTION:
	TRANSACTION 39A7F332, ACTIVE 1 sec fetching rows
	mysql tables in use 5, locked 5
	LOCK WAIT 14 lock struct(s), heap size 14776, 102 row lock(s), undo log entries 1
	MySQL thread id 28811393, OS thread handle 0x7fa91180d700, query id 2016041746 192.168.1.230 replication Searching rows for update
	UPDATE  order_curr  SET `status`=1 WHERE sub_draws_id=69 AND status=0 AND id <= 110561
	*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
	RECORD LOCKS space id 0 page no 2034436 n bits 144 index `PRIMARY` of table `pk_az`.`order_curr` /* Partition `p004` */ trx id 39A7F332 lock_mode X locks rec but not gap waiting
	Record lock, heap no 60 PHYSICAL RECORD: n_fields 17; compact format; info bits 0
	 0: len 4; hex 8001b0a9; asc     ;;
	 1: len 4; hex 00000045; asc    E;;
	 2: len 6; hex 000039a808f0; asc   9   ;;
	 3: len 7; hex 2e001890630110; asc .   c  ;;
	 4: len 4; hex 8005f1b7; asc     ;;
	 5: len 4; hex 80001a8c; asc     ;;
	 6: len 1; hex 0b; asc  ;;
	 7: len 4; hex 5260d8f3; asc R`  ;;
	 8: len 8; hex 8000000016000000; asc         ;;
	 9: len 6; hex 8000000005dc; asc       ;;
	 10: len 8; hex 8000000016000000; asc         ;;
	 11: len 4; hex 800103d9; asc     ;;
	 12: len 1; hex 42; asc B;;
	 13: len 1; hex 01; asc  ;;
	 14: len 4; hex 5260d8f3; asc R`  ;;
	 15: len 2; hex 0000; asc   ;;
	 16: len 1; hex 31; asc 1;;

	*** (2) TRANSACTION:
	TRANSACTION 39A808F0, ACTIVE 0 sec updating or deleting
	mysql tables in use 5, locked 5
	6 lock struct(s), heap size 1248, 2 row lock(s), undo log entries 1
	MySQL thread id 28811717, OS thread handle 0x7fa911709700, query id 2016089658 192.168.1.230 replication Updating
	UPDATE order_curr FORCE INDEX(PRI) SET `status`=1 WHERE id IN(110761) AND `status`=0
	*** (2) HOLDS THE LOCK(S):
	RECORD LOCKS space id 0 page no 2034436 n bits 144 index `PRIMARY` of table `pk_az`.`order_curr` /* Partition `p004` */ trx id 39A808F0 lock_mode X locks rec but not gap
	Record lock, heap no 60 PHYSICAL RECORD: n_fields 17; compact format; info bits 0
	 0: len 4; hex 8001b0a9; asc     ;;
	 1: len 4; hex 00000045; asc    E;;
	 2: len 6; hex 000039a808f0; asc   9   ;;
	 3: len 7; hex 2e001890630110; asc .   c  ;;
	 4: len 4; hex 8005f1b7; asc     ;;
	 5: len 4; hex 80001a8c; asc     ;;
	 6: len 1; hex 0b; asc  ;;
	 7: len 4; hex 5260d8f3; asc R`  ;;
	 8: len 8; hex 8000000016000000; asc         ;;
	 9: len 6; hex 8000000005dc; asc       ;;
	 10: len 8; hex 8000000016000000; asc         ;;
	 11: len 4; hex 800103d9; asc     ;;
	 12: len 1; hex 42; asc B;;
	 13: len 1; hex 01; asc  ;;
	 14: len 4; hex 5260d8f3; asc R`  ;;
	 15: len 2; hex 0000; asc   ;;
	 16: len 1; hex 31; asc 1;;

	*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
	RECORD LOCKS space id 0 page no 2048962 n bits 1192 index `status` of table `pk_az`.`order_curr` /* Partition `p004` */ trx id 39A808F0 lock_mode X locks rec but not gap waiting
	Record lock, heap no 623 PHYSICAL RECORD: n_fields 3; compact format; info bits 0
	 0: len 1; hex 00; asc  ;;
	 1: len 4; hex 8001b0a9; asc     ;;
	 2: len 4; hex 00000045; asc    E;;

	*** WE ROLL BACK TRANSACTION (2)
	------------

	trace:#0 /var/www/ssc/protected/modules/pkFrontend/models/FOrder.php(247): CDbCommand->execute()
	#1 /var/www/ssc/protected/modules/pkFrontend/controllers/OrderController.php(549): FOrder->doCalcOrder('2013-10-18', '389559', Array)
	#2 /var/www/framework/yii.php(3720): OrderController->actionLeftInfo()
	#3 /var/www/framework/yii.php(3223): CInlineAction->runWithParams(Array)
	#4 /var/www/framework/yii.php(3208): CController->runAction(Object(CInlineAction))
	#5 /var/www/framework/yii.php(3198): CController->runActionWithFilters(Object(CInlineAction), Array)
	#6 /var/www/framework/yii.php(1686): CController->run('leftInfo')
	#7 /var/www/framework/yii.php(1606): CWebApplication->runController('pkFrontend/orde...')
	#8 /var/www/framework/yii.php(1135): CWebApplication->processRequest()
	#9 /var/www/ssc/www/index.php(13): CApplication->run()
	#10 {main}(in file /var/www/framework/yii.php on line 8540)
	|192.168.2.239|192.168.1.230|USER-AGENT:Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)
	GET:Array
	(
	    [co] => az123f
	    [r] => pkFrontend/order/leftInfo/
	    [sysFlag] => pk
	    [shortFlag] => f
	    [post_submit] => 
	    [_] => 1379490882450__ajax
	)
	POST:Array
	(
	    [t] => 011|1|1.985|22
	    [v] => 999999
	)
	Request URL:http://sc.load:81/az123f_6796/pk/order/leftInfo/?post_submit&&_=1379490882450__ajaxDomain:sc.load| 

	1.实时报表：UPDATE order_curr SET `status`=1 WHERE sub_draws_id=69 AND status=0 AND id <= 110561
	修改为 UPDATE order_curr FORCE INDEX SET `status`=1 WHERE sub_draws_id=69 AND status=0 AND id <= 110561
	后不再出现死锁。
	2.实时报表有关order_curr的复合查询，采用临时表处理后，对下注的影响明显减小。
	3.报表结算慢的还要继续跟进。


## 案例2

