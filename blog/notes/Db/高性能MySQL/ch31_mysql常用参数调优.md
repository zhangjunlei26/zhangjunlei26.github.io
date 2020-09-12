Title: 常用参数调优
Date:  2015-01-01


常用参数调优
============================

## innodb参数

### 1、how to clear/flush mysql innodb buffer pool?
Im perf tuning a large query, and want to run it from the same baseline before and after, for comparison.

I know about the mysql query cache, but its not relevant to me, since the 2 queries would not be cached anyway.

What is being cached, is the innodb pages, in the buffer pool. Is there a way to clear the entire buffer pool so I can compare the two queries from the same starting point?

Whilst restarting the mysql server after running each query would no doubt work, Id like to avoid this if possible

WARNING : The following only works for MySQL 5.5 and MySQL 5.1.41+ (InnoDB Plugin)

Tweek the duration of entries in the InnoDB Buffer Pool with these settings:

	SET GLOBAL innodb_old_blocks_time=250; // This is 0.25 seconds
	SET GLOBAL innodb_old_blocks_pct=5;
	SET GLOBAL innodb_max_dirty_pages_pct=0;

When you are done testing, setting them back to the defaults:

	SET GLOBAL innodb_old_blocks_time=0;
	SET GLOBAL innodb_old_blocks_pct=37;
	SET GLOBAL innodb_max_dirty_pages_pct=90; // 75 for MySQL 5.5/MySQL 5.1 InnoDB Plugin

Check out the definition of these settings

    MySQL 5.5
        innodb_old_blocks_time
        innodb_old_blocks_pct
        innodb_max_dirty_pages_pct

