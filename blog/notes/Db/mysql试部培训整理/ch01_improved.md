Title: MySQL性能测试
Date:  2015-01-01


MySQL性能测试
============================
---- CH MySQL 培训资料整理

## 1 基准测试

### 1.1 目的

* 了解当前server的性能如何：cpu/memory/多线程/mutex。
* 模拟负载，验证假设，找出可能瓶颈或重现应用的某些异常行为。
* 验证不同的硬件、操作系统、软件的指标差异。
* 规划业务增长。
* 测试应用在可变环境下的能力。（不同配置、不同并发、不同数据分布下的表现）。

#### 局限性
* 不是真实压力测试，真实压力复杂，变化多端。相对于真实压力来说，压力比较简单。
* 大部分压力测试工具不支持对压力进行复杂的控制。

### 1.2 策略

#### 集成式基准测试
* 关注应用的整体性能
* 找出真正的瓶颈
* 检查缓存带来的影响

由于整体基准测试很难建立，甚至正确设置，如果测试设计有问题，结果可能无法正确反映真实的情况，如果基于此错误的结果做出的策略可能也是错误的。

#### 单组件式基准测试
* 针对某个具体问题的测试
* 避免漫长的基准集成式测试。

### 1.3 测试什么指标

* 呑吐量
* 响应时间或延迟
* 并发性
* 可扩展性
* 




### 1.1 测试中推荐关注指标

	sysbench --test=mutex --num-threads=16 --mutex-num=2048 --mutex-locks=1000000 --mutex-loops=5000 run
	sysbench --test=mutex --num-threads=24 --mutex-num=2048 --mutex-locks=1000000 --mutex-loops=5000 run
	sysbench --test=mutex --num-threads=64 --mutex-num=2048 --mutex-locks=1000000 --mutex-loops=5000 run
	
	sysbench --test=memory --memory-block-size=8K --memory-total-size=5G  --num-threads=1 run
	sysbench --test=memory --memory-block-size=8K --memory-total-size=2G  --num-threads=24 run
	sysbench --test=memory --memory-block-size=8K --memory-total-size=5G  --num-threads=24 run
	sysbench --test=memory --memory-block-size=8K --memory-total-size=5G  --num-threads=64 run
	
	sysbench --test=threads --num-threads=4 run
	sysbench --test=threads --num-threads=24 run
	sysbench --test=threads --num-threads=64 run
	






## 2 Mysql性能分析
### 2.1 



## 3 MySQL性能监控


## 4 MySQL参数配置


