Title: Mac优化
Date:  2015-01-01


Mac优化
============================

## 1. 限制最大打开文件数和进程数

<code>
launchctl limit maxfiles 120000 180000
</code>

编辑/etc/sysctl.conf，添加以下行

<code>
kern.maxfiles = 512000  
kern.maxfilesperproc = 256000  
kern.maxproc = 512000  
kern.maxprocperuid = 65535  
  
</code>


编辑 /etc/launchd.conf，添加以下行

<code>
limit maxfiles 256000 512000  
limit maxproc 65535 512000  
</code>


## 2. 设置shell

chsh 可以修改shell  
vipw  
vi /etc/master.passwd  
vi /etc/passwd  


<code>
将root的shell改为bash  
dscl . -change /Users/root UserShell /bin/sh /bin/bash  
将bash 更改为 zsh  
dscl . -change /Users/root UserShell /bin/bash /bin/zsh  
查看当前用户shell
dscl . -read /Users/root UserShell  
echo $0      #-sh su   
</code>

## 3. 设置vpn sec
在/etc/ppp目录下新建一个文件options， 写入下面的内容  
plugin L2TP.ppp l2tpnoipsec 
就可以无需密钥连接了，最后别忘了把高级设置里面"通过VPN连接发送所有流量"钩上。  

## 4. 设置网卡mac地址
ifconfig en3 lladdr 00:10:13:0f:66:fe
ifconfig en3 ether 00:10:13:0f:66:fe
ioctl (set lladdr): network is down

原始mac:
00:10:13:ae:a5:94
