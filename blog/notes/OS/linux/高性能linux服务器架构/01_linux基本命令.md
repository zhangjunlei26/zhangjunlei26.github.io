Title: linux 基本命令
Date:  2015-01-01


linux 基本命令
============================

## ipcs 共享内存使用
vm.nr_hugepages=5000
vm.hugetlb_shm_group=27
kernel.shmmax=1560281088 
kernel.shmall=4194304


见mysql：[开启大页支持](http://dev.mysql.com/doc/refman/5.0/en/large-page-support.html)

	cat /proc/meminfo | grep -i huge
	
	[root@SSCJDH56 ~]# ipcs

	------ Shared Memory Segments --------
	key        shmid      owner      perms      bytes      nattch     status      
	0x00000000 0          root       644        80         2                       
	0x00000000 32769      root       644        16384      2                       
	0x00000000 65538      root       644        280        2                       
	0x00000000 98307      root       600        524288     23         dest         
	0x00000000 360452     mysql      600        29360128   1          dest         
	0x00000000 393221     mysql      600        8585740288 1          dest         

	------ Semaphore Arrays --------
	key        semid      owner      perms      nsems     
	0x00000000 0          root       600        1         
	0x00000000 32769      root       600        1         
	0x000000a7 65538      root       600        1         

	------ Message Queues --------
	key        msqid      owner      perms      used-bytes   messages    


## 磁盘flush算法
<code>
cat /sys/block/sda/queue/scheduler  
noop anticipatory deadline [cfq]  
echo 'deadline'>/sys/block/sda/queue/scheduler  
</code>



## nf_conntrack/ip_conntrack

nf_conntrack/ip_conntrack 跟 nat 有关，用来跟踪连接条目，它会使用一个哈希表来记录 established 的记录。nf_conntrack 在 2.6.15 被引入，而 ip_conntrack 在 2.6.22 被移除，如果该哈希表满了，就会出现：nf_conntrack: table full, dropping packet。  

nf_conntrack 工作在 3 层，支持 IPv4 和 IPv6，而 ip_conntrack 只支持 IPv4。目前，大多的 ip_conntrack_* 已被 nf_conntrack_* 取代，很多 ip_conntrack_* 仅仅是个 alias，原先的 ip_conntrack 的 /proc/sys/net/ipv4/netfilter/ 依然存在，但是新的 nf_conntrack 在 /proc/sys/net/netfilter/ 中。  

### 解决此问题有如下几种思路。

#### 1.不使用 nf_conntrack 模块
首先要移除 state 模块，因为使用该模块需要加载 nf_conntrack。确保 iptables 规则中没有出现类似 state 模块的规则，如果有的话将其移除：
-A INPUT -m state –state RELATED,ESTABLISHED -j ACCEPT

注释 /etc/sysconfig/iptables-config 中的：
IPTABLES_MODULES="ip_conntrack_netbios_ns"

移除 nf_conntrack 模块：
$ sudo modprobe -r xt_NOTRACK nf_conntrack_netbios_ns nf_conntrack_ipv4 xt_state
$ sudo modprobe -r nf_conntrack

现在 /proc/net/ 下面应该没有 nf_conntrack 了。

#### 2.调整 /proc/ 下面的参数
可以增大 conntrack 的条目(sessions, connection tracking entries) CONNTRACK_MAX 或者增加存储 conntrack 条目哈希表的大小 HASHSIZE
默认情况下，CONNTRACK_MAX 和 HASHSIZE 会根据系统内存大小计算出一个比较合理的值：
对于 CONNTRACK_MAX，其计算公式：
CONNTRACK_MAX = RAMSIZE (in bytes) / 16384 / (ARCH / 32)
比如一个 64 位 48G 的机器可以同时处理 48*1024^3/16384/2 = 1572864 条 netfilter 连接。对于大于 1G 内存的系统，默认的 CONNTRACK_MAX 是 65535。

对于 HASHSIZE，默认的有这样的转换关系：
CONNTRACK_MAX = HASHSIZE * 8
这表示每个链接列表里面平均有 8 个 conntrack 条目。其真正的计算公式如下：
HASHSIZE = CONNTRACK_MAX / 8 = RAMSIZE (in bytes) / 131072 / (ARCH / 32)
比如一个 64 位 48G 的机器可以存储 48*1024^3/131072/2 = 196608 的buckets(连接列表)。对于大于 1G 内存的系统，默认的 HASHSIZE 是 8192。

可以通过 echo 直接修改目前系统 CONNTRACK_MAX 以及 HASHSIZE 的值：
$ sudo su -c "echo 100000 > /proc/sys/net/netfilter/nf_conntrack_max"
$ sudo su -c "echo 50000 > /proc/sys/net/netfilter/nf_conntrack_buckets"

还可以缩短 timeout 的值：
$ sudo su -c "echo 600 > /proc/sys/net/ipv4/netfilter/ip_conntrack_tcp_timeout_established"

#### 3.使用 raw 表，不跟踪连接
iptables 中的 raw 表跟包的跟踪有关，基本就是用来干一件事，通过 NOTRACK 给不需要被连接跟踪的包打标记，也就是说，如果一个连接遇到了 -j NOTRACK，conntrack 就不会跟踪该连接，raw 的优先级大于 mangle, nat, filter，包含 PREROUTING 和 OUTPUT 链。
当执行 -t raw 时，系统会自动加载 iptable_raw 模块(需要该模块存在)。raw 在 2.4 以及 2.6 早期的内核中不存在，除非打了 patch，目前的系统应该都有支持:
$ sudo iptables -A FORWARD -m state --state UNTRACKED -j ACCEPT
$ sudo iptables -t raw -A PREROUTING -p tcp -m multiport --dport 80,81,82 -j NOTRACK
$ sudo iptables -t raw -A PREROUTING -p tcp -m multiport --sport 80,81,82 -j NOTRACK

上面三种方式，最有效的是 1 跟 3，第二种治标不治本。

ref:  
http://www.digipedia.pl/usenet/thread/16263/7806/  
http://serverfault.com/questions/72366/how-do-i-disable-the-nf-conntrack-kernel-module-in-centos-5-3-without-recompilin  
http://wiki.khnet.info/index.php/Conntrack_tuning  

<code>
grep nf_conntrack /proc/slabinfo  
查出目前 nf_conntrack 的排名  
cat /proc/net/nf_conntrack | cut -d ' ' -f 10 | cut -d '=' -f 2 | sort | uniq -c | sort -nr | head -n 10  

</code>

## pkg-config 编译依赖
当安装一个库时（从RPM，deb或其他二进制包管理系统），会包括一个后缀名为pc的文件，它会同其他.pc文件一起放入一个文件夹（依赖于你的系统设置）。

在这个文件里包含有数个条目。这些条目通常包含用于其他使用这个库的程序编译时需要的库设置，以及头文件的位置，版本信息和一个简介。  
  
这是一个用于libpng的.pc文件的样例:  
  
<code>   
prefix=/usr/local  
exec_prefix=${prefix}  
libdir=${exec_prefix}/lib  
includedir=${exec_prefix}/include
    
Name: libpng12  
 Description: Loads and saves PNG files  
 Version: 1.2.8  
 Libs: -L${libdir} -lpng12 -lz  
 Cflags: -I${includedir}/libpng12  
</code>

这个文件告诉我们这些库可以在/usr/local/lib找到，头文件可以在/usr/local/include里找到，库的名字是libpng12并且版本号是1.2.8。它也提供了用于编译依赖于libpng的源代码时需要的链接器参数。

这儿是一个编译时使用pkg-config的样例:

`gcc -o test test.c $(pkg-config --libs --cflags libpng)`  



## 内核模块管理

### 1、depmod 分析可载入模块的相依性
depmod可检测模块的相依性，供modprobe在安装模块时使用。  

命令用法：  

<code>
depmod [-adeisvV][-m <文件>][--help][模块名称]  
-a或--all 　分析所有可用的模块。  
-d或debug 　执行排错模式。  
-e 　输出无法参照的符号。  
-i 　不检查符号表的版本。  
-m<文件>或system-map<文件> 　使用指定的符号表文件。  
-s或--system-log 　在系统记录中记录错误。  
-v或--verbose 　执行时显示详细的信息。  
-V或--version 　显示版本信息。  
--help 　显示帮助。   
</code>


### 2、modprobe加载模块

　　insmod 与 modprobe 都是载入 kernel module，不过一般差别于 modprobe 能够处理 module 载入的相依问题。  

　　比方你要载入 a module，但是 a module 要求系统先载入 b module 时，直接用 insmod 挂入通常都会出现错误讯息，不过 modprobe 倒是能够知道先载入 b module 后才载入 a module，如此相依性就会满足。  

　　不过 modprobe 并不是大神，不会厉害到知道 module 之间的相依性为何，该程式是读取 `/lib/modules/2.6.xx/modules.dep` (用`depmod -a`可展示该文件内容)。档案得知相依性的。而该档案是透过 depmod 程式所建立。  

　　补充说明：modprobe可载入指定的个别模块，或是载入一组相依的模块。modprobe会根据depmod所产生的相依关系，决定要载入哪些模块。若在载入过程中发生错误，在modprobe会卸载整组的模块。

　　删除模块的命令是：`modprobe -r filename`。系统启动后，正常工作的模块都在`/proc/modules`文件中列出。使用`lsmod`命今也可显示相同内容。  
在内核中有一个“Automatic kernel module loading"功能被编译到了内核中。当用户尝试打开某类型的文件时，内核会根据需要尝试加载相应的模块。/etc/modules.conf或 /etc/modprobe.conf文件是一个自动处理内核模块的控制文件。  

<code>
modprobe -r nfnetlink_queue  
modprobe -r ip_queue  
modprobe ip_queue  
</code>

ip_conntrack 是状态检测机制，state 模块要用到。当`iptables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT` 时，ip_conntrack 自动加载。 

命令用法：  

<code>
modprobe [-a -n -v ] [-C config ] [ -t type ] pattern OR module1  module2 ...List modules:  
modprobe [-l ] [-C config ] [ -t type ] pattern  
note: wildcard patterns should be escaped  
Show configuration:  
modprobe [-C config ] -c  
Remove module(s) or autoclean:  
modprobe [-C config ] -r [ module ...]  
//详细说明:  
options:  
-a, --all //加载所有匹配模块  
-c, --showconfig //显示当前使用的配置  
-d, --debug //显示调试信息  
-h, --help //帮助  
-k, --autoclean //将指定模块设置为"自动清除"模式.  
modules  
-l, --list //显示所有匹配模块  
-n, --show //仅仅显示要执行的操作,而不实际执行  
-q, --quiet //不显示错误信息  
-r, --remove //若在命令指定模块,则删除指定模块,否则,指定"自动清除"模式  
-s, --syslog //将结果记录到系统记录中  
-t, --type moduletype //指定模块类型  
-v, --verbose //执行时显示详细信息  
-V, --version //显示版本  
-C, --config configfile //指定配置文件.默认使用/etc/modules.conf文件为配置文件  
</code>

举例：

<code>
查看modules的配置文件：  
modprobe -c  

列出内核中所有已经或者未挂载的所有模块：  
modprobe -l  
cat /lib/modules/`uname -r`/modules.dep  

挂载vfat模块  
modprobe vfat  

移除已经加载的模块  
modprobe -r  模块名  
移除已加载的模块，和rmmod 功能相同。注意：模块名是不能带有后缀的，我们通过modprobe -l 所看到的模块，都是带有.ko 或.o后缀  

</code>


### 3、insmod载入模块
Linux有许多功能是通过模块的方式，在需要时才载入kernel。如此可使kernel较为精简，进而提高效率，以及保有较大的弹性。这类可载入的模块，通常是设备驱动程序。  

命令用法：  

<code>
insmod [-fkmpsvxX][-o <模块名称>][模块文件][符号名称 = 符号值]  
-f 　不检查目前kernel版本与模块编译时的kernel版本是否一致，强制将模块载入。  
-k 　将模块设置为自动卸除。  
-m 　输出模块的载入信息。  
-o<模块名称> 　指定模块的名称，可使用模块文件的文件名。  
-p 　测试模块是否能正确地载入kernel。  
-s 　将所有信息记录在系统记录文件中。  
-v 　执行时显示详细的信息。  
-x 　不要汇出模块的外部符号。  
-X 　汇出模块所有的外部符号，此为预设置。  
</code>


