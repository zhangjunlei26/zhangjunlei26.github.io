Title: 安装mysql-proxy
Date:  2015-01-01

安装mysql-proxy
============================

> brew install glib
> brew install lua
>  ./configure --prefix=/opt/tools/dbtest/ --with-mysql=/opt/tools/percona5.6.12/bin/mysql_config --with-lua


启动mysql proxy

＃注意：LUA_PATH="/usr/local/mysql/mysql-proxy/share/mysql-proxy/*.lua"

启动前，增加一下LUA的环境变量，不然用mysql proxy启动mysql时，会报找不到lua，会报以下错误

[root@BlackGhost share]# mysql -u root -h 127.0.0.1 -P 8888


mysql-proxy --proxy-address=127.0.0.1:8888 --proxy-read-only-backend-addresses=192.168.1.75:3306 --proxy-backend-addresses=192.168.1.91:3306 --proxy-lua-script=/usr/local/mysql/mysql_proxy/share/mysql-proxy/rw-splitting.lua &
 
