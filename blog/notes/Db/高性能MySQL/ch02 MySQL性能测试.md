Title: MySQL性能测试
Date:  2015-01-01


MySQL性能测试
============================
### sysbench 基准测试
### TPCC-MySQL基准测试
#### 安装
#### 使用
	mysqladmin -ureplication -h127.0.0.1 -p123456 -P3301 create tpcc100
	mysql -ureplication -h127.0.0.1 -p123456 -P3301 tpcc100 </usr/local/tpcc-mysql/create_table.sql
	mysql -ureplication -h127.0.0.1 -p123456 -P3301 tpcc100 </usr/local/tpcc-mysql/add_fkey_idx.sql
	nohup tpcc_load 127.0.0.1:3301 tpcc100 replication 123456  100 &

	mysqladmin -ureplication -h127.0.0.1 -p123456 -P3302 create tpcc100
	mysql -ureplication -h127.0.0.1 -p123456 -P3302 tpcc100 </usr/local/tpcc-mysql/create_table.sql
	mysql -ureplication -h127.0.0.1 -p123456 -P3302 tpcc100 </usr/local/tpcc-mysql/add_fkey_idx.sql
	nohup tpcc_load 127.0.0.1:3302 tpcc100 replication 123456  100 &
	
	
