Title: HTTP常用HEADER收集
Date:  2015-01-01


HTTP常用HEADER收集
============================

## cache相关

http协议头Cache-Control ：值可以是public、private、no-cache、no-store、no-transform、must-revalidate、proxy-revalidate、max-age


* Public指示响应可被任何缓存区缓存。
* Private指示对于单个用户的整个或部分响应消息，不能被共享缓存处理。这允许服务器仅仅描述当用户的部分响应消息，此响应消息对于其他用户的请求无效。
* no-cache指示请求或响应消息不能缓存
* no-store用于防止重要的信息被无意的发布。在请求消息中发送将使得请求和响应消息都不使用缓存。
* max-age指示客户机可以接收生存期不大于指定时间（以秒为单位）的响应。
* min-fresh指示客户机可以接收响应时间小于当前时间加上指定时间的响应。
* max-stale指示客户机可以接收超出超时期间的响应消息。如果指定max-stale消息的值，那么客户机可以接收超出超时期指定值之内的响应消息。

Last-Modified/If-Modified-Since

Demo:

	header('Cache-Control: max-age=86400,must-revalidate');
	header('Last-Modified: ' .gmdate('D, d M Y H:i:s') . ' GMT' );
	header("Expires: " .gmdate ('D, d M Y H:i:s', time() + '86400′ ). ' GMT');