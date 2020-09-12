Title: CH MySQL 培训资料整理
Date:  2015-01-01


CH MySQL 培训资料整理
============================

## 1. MySQL概述

| First Header | Second Header | Third Header |
| ------------ | ------------- | ------------ |
| Content Cell | Content Cell  | Content Cell |
| Content Cell | Content Cell  | Content Cell |



### 1.1 MySQL发展概述

### 1.2 MySQL逻辑架构


![image](http://files.jb51.net/file_images/article/201305/2013050211181116.png)
![image](http://images.cnblogs.com/cnblogs_com/hustcat/mysql/mysql01-1.JPG)

Mysql是由SQL接口，解析器，优化器，缓存，存储引擎组成的
### client

### Connection Pool
管理缓冲用户连接，线程处理等需要缓存的需求

### SQL Interface
接受用户的SQL命令，并且返回用户需要查询的结果

### Parser
SQL命令传递到解析器的时候会被解析器验证和解析，并创建一个内部的数据结构——分析树。解析器是由Lex和YACC实现的，是一个很长的脚本。主要功能：

a. 将SQL语句分解成数据结构，并将这个结构传递到后续步骤，以后SQL语句的传递和处理就是基于这个结构的  

b. 如果在分解构成中遇到错误，那么就说明这个sql语句是不合理的  

### Optimizer

用 "选取-投影-联接" 策略进行查询

上步得到内部的数据结构——分析树，然后进行各种优化，例如重写查询、选择读取表的顺序，以及使用哪个索引等。查询优化器不关心一个表所使用的存储引擎，但是存储引擎会影响服务器如何优化查询。优化器通过存储引擎获取一些参数、某个操作的执行代价、以及统计信息等。在解析查询之前，服务器会先访问查询缓存(query cache)——它存储SELECT语句以及相应的查询结果集。如果某个查询结果已经位于缓存中，服务器就不会再对查询进行解析、优化、以及执行。它仅仅将缓存中的结果返回给用户即可，这将大大提高系统的性能。

### Cache & Buffer
表缓存，记录缓存，key缓存，权限缓存等

### Engine

InnoDB支持事务，并且提供行级的锁定，应用也相当广泛。 


### 并发控制
MySQL提供两个级别的并发控制：服务器级(the server level)和存储引擎级(the storage engine level)。加锁是实现并发控制的基本方法，MySQL中锁的粒度：

a. 表级锁：MySQL独立于存储引擎提供表锁，例如，对于ALTER TABLE语句，服务器提供表锁(table-level lock)。

b. 行级锁：InnoDB和Falcon存储引擎提供行级锁，此外，BDB支持页级锁。InnoDB的并发控制机制，下节详细讨论。

另外，值得一提的是，MySQL的一些存储引擎（如InnoDB、BDB）除了使用封锁机制外，还同时结合MVCC机制，即多版本两阶段封锁协议(Multiversion two-phrase locking protocal)，来实现事务的并发控制，从而使得只读事务不用等待锁，提高了事务的并发性。

注：并发控制是DBMS的核心技术之一(实际上，对于OS也一样)，它对系统性能有着至关重要的影响，以后再详细讨论。





## 2.列数据类型与操作符
### 2.1 数值类型
可用UNSIGNED/ZEROFILL修饰

类型名	|	字节		|	有符号范围		|	无符号范围
--------	| --------	|	--------	|	--------
TINYINT 	|	1	|	-128~127		|	0~255
SMALLINT	|	2	|	-32768~32767	|	0~65535
MEDIUMINT	|	3	|	-8388608~8388607	| 0~16777215
INTEGER		|	4   |	-2147483648~2147483647	| 0~4294967295
BITINT		|	8	|	-9223372036854775808~9223372036854775807	| 0~18446744073709551615

	
	BOOL/BOOLEAN			1byte
	BIT						1~64	
	ENUM					
	SET						8byte
	FLOAT					4byte	
	DOUBLE					8byte	
	DECIMAL					(M,D)	
	
类型描述：

	类型 [(M)][UNSIGNED] [ZEROFILL]
	注：M指示最大显示宽度。最大有效显示宽度是255。显示宽度与存储大小或类型包含的值的范围无关。
	
	类型 [(M,D)] [UNSIGNED] [ZEROFILL]
	M是总长度(不算小数点及符号)，D是小数点(标度)后面的位数。

### 2.2日期时间类型
|	类型			|	备注		|
|	----------	|	-----	|
|	DATE		|			
|	DATETIME	|	
|	TIMESTAMP	|	
|	TIME		|	
|	YEAR[(2\|4)]	|

### 2.3 字符串类型
|	类型			|	长度		|	定义语法	|
|	----------	|	-----	|	-------	|
|	CHAR		|	0~255	|	[NATIONAL] CHAR(M) [BINARY\| ASCII \| UNICODE]
|	BINARY		|	0~255	|	BINARY(M)
|	VARCHAR		|	0~65535	|	[NATIONAL] VARCHAR(M) [BINARY]
|	VARBINARY	|	0~65535	|	VARBINARY(M)
|	TINYBLOB	|	0~255	|	TINYBLOB
|	TINYTEXT	|	0~255	|	TINYTEXT
|	BLOG		|	0~65535	|	BLOG[(M)]
|	TEXT		|	0~65535	|	TEXT[(M)]
|	MEDIUMBLOB	|	0~16,777,215 (2<sup>24</sup>–1)		|	MEDIUMBLOB
|	MEDIUMTEXT	|	0~16,777,215 (2<sup>24</sup>–1)	|	MEDIUMTEXT
|	LONGBLOB	|	4,294,967,295或4GB(2<sup>32</sup>–1)	|	LONGBLOB
|	LONGTEXT	|	4,294,967,295或4GB(2<sup>32</sup>–1)	|	LONGTEXT
|	ENUM		|	65535个	|	ENUM('v1','v2',...)
|	SET			|	64个		|	SET('v1','v2','v3')

### 列存储需求

### 选择正确的存储类型
#### 数据超过范围和溢出
* strict SQL mode:  失败并报错
* no restrictive mode:	


注意每个列的最大范围，避免数据溢出后得到意外结果。

## 3 MySQL常用语法

### 3.1 JOIN

### 3.2 ORDER BY

### 3.3 子查询

### 3.4 存储

## 4 常用引擎

### 4.1 MyISAM

### 4.2 InnoDB

#### 4.2.1 表空间

innoDB存储表和索引有两种方式：

a. 共享表空间存储：这种方式下，表的定义位于.frm文件中，数据和索引保存在innodb_data_home_dir和innodb_data_file_path指定的表空间中。 

b.多表空间存储：表的定义仍位于.frm文件，但是，每个InnoDB表和它的索引在它自己的文件(.idb)中，每个表有它自己的表空间。  

对那些想把特定表格移到分离物理磁盘的用户，或者那些希望快速恢复单个表的备份而无须打断其余InnoDB表的使用的用户，使用多表空间会是有益的。你可以往my.cnf的[mysqld]节添加下面行来允许多表空间：  

	[mysqld]
		innodb_file_per_table
重启服务器之后，InnoDB存储每个新创建的表到表格所属于的数据库目录下它自己的文件tbl_name.ibd里。这类似于MyISAM存储引擎所做的，但MyISAM 把表分成数据文件tbl_name.MYD和索引文件tbl_name.MYI。对于InnoDB，数据和所以被一起存到.ibd文件。tbl_name.frm文件照旧依然被创建。
如果你从my.cnf文件删除innodb_file_per_table行，并重启服务器，InnoDB在共享的表空间文件里再次创建表。
innodb_file_per_table只影响表的创建。如果你用这个选项启动服务器，新表被用.ibd文件来创建，但是你仍旧能访问在共享表空间里的表。如果你删掉这个选项，新表在共享表空间内创建，但你仍旧可以访问任何用多表空间创建的表。
InnoDB总是需要共享表空间，.ibd文件对InnoDB不足以去运行，共享表空间包含熟悉的ibdata文件，InnoDB把内部数据词典和undo日志放在这个文件中。


#### 4.2.2 事务处理
##### 事务的ACID特性

##### MVCC与后码锁(next-key locking)

InnoDB将MVCC机制与next-key lock结合起来，实现事务的各个隔离级别，这是非常用意思的。在nodb_locks_unsafe_for_binlog变量被设置或者事务的隔离级别不是SERIALIZABLE的情况下，InnoDB对于没有指定FOR UPDATE 或 LOCK IN SHARE MODE的INSERT INTO ... SELECT, UPDATE ... (SELECT), 和CREATE TABLE ... SELECT语句使用一致性读(参照前面)，在这种情况下，查询语句不会对表中的元组加锁。否则，InnoDB将使用锁。

### 4.3 外键约束
MySQL中，支持外键的存储引擎只有InnoDB，在创建外键时，要求被参照表必须有对应的索引，参照表在创建外键时也会自动创建对应的索引。
