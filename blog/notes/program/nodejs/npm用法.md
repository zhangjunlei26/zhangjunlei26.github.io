##npm获取配置有6种方式，优先级由高到底。

* 命令行参数。 --proxy http://server:port即将proxy的值设为http://server:port。
* 环境变量。 以npm_config_为前缀的环境变量将会被认为是npm的配置属性。如设置proxy可以加入这样的环境变量npm_config_proxy=http://server:port。
* 用户配置文件。可以通过npm config get userconfig查看文件路径。如果是mac系统的话默认路径就是$HOME/.npmrc。
* 全局配置文件。可以通过npm config get globalconfig查看文件路径。mac系统的默认路径是/usr/local/etc/npmrc。
* 内置配置文件。安装npm的目录下的npmrc文件。
* 默认配置。 npm本身有默认配置参数，如果以上5条都没设置，则npm会使用默认配置参数。

##为npm设置代理

    $ npm config set proxy http://server:port
    $ npm config set https-proxy http://server:port
   
如果代理需要认证的话可以这样来设置。

    $ npm config set proxy http://username:password@server:port
    $ npm config set https-proxy http://username:pawword@server:port

如果代理不支持https的话需要修改npm存放package的网站地址。

    $ npm config set registry "http://registry.npmjs.org/"
    $ npm config set registry "http://npm.oa.com/"
    $ npm config set registry "http://proxy.tencent.com:8080/"
