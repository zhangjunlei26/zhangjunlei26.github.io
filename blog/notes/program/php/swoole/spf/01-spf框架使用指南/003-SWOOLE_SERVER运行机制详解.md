## 3 SWOOLE_SERVER运行机制详解

[前言] spf是对swoole_server及其子类swoole_http_server/swoole_websocket_server的外层封装，在了解使用spf前，需要对swoole_server的运行机制进行深入理解。

### 3.1 SWOOLE_SERVER 构造

swoole_http_server、swoole_websocket_server都继承自swoole_server，该文中提到的特性，对两者都通用。swoole_server构造函数原型为：

``` shell
$serv = new swoole_server(string $host, int $port, int $mode = SWOOLE_PROCESS,int $sock_type = SWOOLE_SOCK_TCP);

```

- **$host**参数用来指定监听的ip地址
  - IPv4使用 127.0.0.1表示监听本机，0.0.0.0表示监听所有地址
  - IPv6使用::1表示监听本机，:: (0:0:0:0:0:0:0:0) 表示监听所有地址
- **$port**监听的端口，如9501，监听小于1024端口需要root权限，如果此端口被占用$server->start()时会失败
- **$mode**运行的模式，swoole提供了[3种运行模式](http://wiki.swoole.com/wiki/page/353.html)，默认为多进程模式
  - **SWOOLE_BASE：**Base模式，业务代码在Reactor进程中直接执行
  - **SWOOLE_PROCESS：**进程模式，业务代码在Worker进程中执行
  - **SWOOLE_THREAD：**线程模式，由于PHP的ZendVM在多线程模式存在内存错误，多线程模式在v1.6.0版本后已关闭
- **$sock_type**指定socket的类型，支持TCP/UDP、TCP6/UDP6、UnixSock Stream/Dgram 6种

### 3.2 SWOOLE_SERVER 运行模式

#### 3.2.1 BASE模式

为异步非阻塞模式，该模式下，reactor和worker是同一个角色。在reactor内直接回调PHP的函数。如果回调函数中有IO阻塞，会导致Server退化为同步模式。worker_num参数对与BASE模式仍然有效，swoole会启动多个Reactor进程。

**BASE模式的优点：**

- BASE模式没有IPC开销，性能更好
- BASE模式代码更简单，不容易出错

**BASE模式的缺点：**

- TCP连接是在worker进程中维持的，所以当某个worker进程挂掉时，此worker内的所有连接都将被关闭
- worker进程中fd是可以重复的，所以不存在唯一标识符。不同worker的TCP连接之间无法通信
- 少量TCP长连接无法利用到所有Worker进程

**BASE模式的适用场景：**

如果客户端连接之间不需要交互，可以使用BASE模式。如Memcache、Http服务器等。

#### 3.2.2 PROCESS模式

多进程模式是最复杂的方式，用了大量的进程间通信、进程管理机制。适合业务逻辑非常复杂的场景。Swoole提供了完善的进程管理、内存保护机制。 在业务逻辑非常复杂的情况下，也可以长期稳定运行。

Swoole在Reactor线程中提供了Buffer的功能，可以应对大量慢速连接和逐字节的恶意客户端。另外也提供了CPU亲和设置选项，使程序运行的效率更好。



### 3.3 SWOOLE_SERVER相关的进程

#### 3.3.1运行流程图

![img](http://zhangjunlei26.github.io/assets/swoole/001.jpg)

#### 3.3.2进程/线程结构图

![process](http://zhangjunlei26.github.io/assets/swoole/002.jpg)

#### 3.3.3进程说明

##### 3.3.3.1 Master进程

Master进程是swoole的主线程，主要功能为：

- accept新连接，将该连接分配给一个固定的reactor线程，由reactor线程负责监听socket。
- UNIX PROXI信号处理
- 定时器任务



##### 3.3.3.2 Manager进程

Manager进程主要是进行worker/task进程管理。主要功能为：

- worker/task子进程运行结束(如发生PHP异常/错误、被其他程序误杀而异常退出，或达到max_request次数之后正常退出，或收到信号退出)，manager进程负责回收子进程，以免成为僵尸进程，Manager进程会重新拉起(fork)新的Worker/Task进程。
- 服务器关闭时，manager进程发送信号给所有worker/task子进程，通知子进程关闭服务。
- 服务器reload时，manager进程会逐个重启全部work/task子进程。

因业务逻辑运行在worker进程组，建议设置max_request，完成请求数来结束worker进程，以避免worker进程内存泄露。

要注意swoole_server默认运行模式为SWOOLE_PROCESS，异步非阻塞IO运行在该模式下，worker/task达到max_request计数时，会直接退出进程，导致已连接请求，处于pending状态。建议在onWorkerStop回调函数中，对连接进行处理。

为什么不是Master进程呢，主要原因是Master进程是多线程的，不能安全的执行fork操作。



##### 3.3.3.3 Reactor线程

Swoole的主进程是一个多线程的程序。其中有一组很重要的线程，称之为reactor线程。Reactor以**多线程**的方式运行，它是真正处理TCP连接，收发数据的线程。swoole的主线程在Accept新的连接后，会将这个连接分配给一个固定的reactor线程，并由这个线程负责监听此socket。分配的计算方式是fd % serv->reactor_num。主要功能为：

- 在socket可读时，将TCP客户端发来的数据缓冲、拼接、拆分成完整的一个请求数据包，解析协议，再将完整的请求数据，投递到worker进程中。
- 在socket可写时，发送数据发送给TCP客户端。

Reactor线程工作于完全异步非阻塞的模式下，全部为C代码，除Start/Shudown事件回调外，不执行任何PHP代码。



##### 3.3.3.4 Worker进程

顾名思义，worker进程是swoole_server中的工作进程，worker以**多进程**的方式运行，可以异步非阻塞模式，也可以是同步阻塞模式，由Manager进程Fork并管理。主要功能为：

- 接受由reactor线程投递的请求数据包，并执行PHP回调函数处理数据。
- 在该进程中，运行业务逻辑，生成响应数据，发给Reactor线程，由Reactor线程发送给TCP客户端

Worker进程内可以像普通的apache+php或者php-fpm中写代码，工作于同步阻塞模式。不需要像Node.js那样写异步回调的代码。也可以工作在异步非阻塞模式，基于回调代码来调用异步IO。



##### 3.3.3.5 Task进程 

task进程与worker进程很相似，以多进程的方式运行，主要用来辅助worker进程，处理业务逻辑，但它必须工作在同步阻塞模式下，无法运行异步IO，但task进程支持定时器。主要功能为：

- 接受由Worker进程通过`swoole_server->task/taskwait`方法投递的任务
- 处理任务，并将结果数据返回给Worker进程。

task进程全称是task_worker进程，是一种特殊的worker进程，如果设置了task_worker_num>0，则task进程也在onWorkerStart进行启动，与worker相同。

如需区别于worker进程，可以用`swoole_server->taskworker`属性，也可用初始化worker/task时，传递的worker_id来区分。当`worker_id>=swoole_server->setting['worker_num']`时，表示这个进程是task进程，否则该进程是worker进程。通过区分worker与task，可以定义task进程不同于worker进程的初始化资源。

task模块用来做一些异步的慢速任务，比如webim中发广播，发送邮件等。node.js 假如有10万个连接，要发广播时，那会循环10万次，这时候程序不能做任何事情，不能接受新的连接，也不能收包发包。而swoole不同，丢给task进程之后，worker进程可以继续处理新的数据请求。任务完成后会异步地通知worker进程告诉它此任务已经完成。

因task进程与传通PHP运行方式类似，都是同步阻塞模式，也可将一些同步阻塞逻辑代码，由task中完成，适合一些旧的同步阻塞逻辑向swoole中迁移。

当然task模块的作用还不仅如此，实现PHP的数据库/nosql的连接池，异步队列等，还需要进一步挖掘。



##### 3.3.3.6 Reactor/Worker/Task的关系

可以理解为reactor就是nginx，worker就是php-fpm。reactor线程异步并行地处理网络请求，然后再转发给worker进程中去处理。reactor和worker间通过IPC方式通信。

swoole的reactor，worker，task_worker之间可以紧密的结合起来，提供更高级的使用方式。一个更通俗的比喻，假设Server就是一个工厂，那reactor就是销售，帮你接项目订单。而worker就是工人，当销售接到订单后，worker去工作生产出客户要的东西。而task_worker可以理解为行政人员，可以帮助worker干些杂事，让worker专心工作。

底层会为Worker进程、Task进程分配一个唯一的ID。不同的task/worker进程之间可以通过sendMessage接口进行通信。



### 3.4 SWOOLE_SERVER不同进程支持的回调函数

#### 3.4.1 Master进程内的回调函数

- onStart
- onShutdown
- onMasterConnect
- onMasterClose
- onTimer

#### 3.4.2 Manager进程内的回调函数

- onManagerStart
- onManagerStop

#### 3.4.3Worker进程内的回调函数

- onWorkerStart
- onWorkerStop
- onConnect
- onClose
- onReceive
- onFinish
- ~~onTimer~~ ( Swoole1.8.6 起已废弃)
- onRequest (属于swoole_http_server)
- onOpen (属于swoole_websocket_server)
- onMessage (属于swoole_websocket_server)

#### 3.4.4 Task进程内的回调函数

- onTask
- onWorkerStart

#### 3.4.5 事件执行顺序

- 所有事件回调均在$server->start后发生
- 服务器关闭程序终止时最后一次事件是onShutdown
- 服务器启动成功后，onStart/onManagerStart/onWorkerStart会在不同的进程内并发执行，3个事件的执行顺序是不确定的。
- onReceive/onConnect/onClose/onTimer在worker进程(包括task进程)中各自触发
- worker/task进程启动/结束时会分别调用onWorkerStart/onWorkerStop
- onTask事件仅在task进程中发生
- onFinish事件仅在worker进程中发生



### 3.5 Worker与Reactor通信模式

worker进程如何与reactor进程通信，Swoole提供了3种方式。通过swoole_server_set参数中修改dispatch_mode的值来配置。

#### 3.5.1 轮询模式 dispatch_mode = 1

收到的请求数据包会轮询发到每个Worker进程。

#### 3.5.2 FD取模 dispatch_mode = 2 (默认）

数据包根据fd的值%worker_num来分配，这个模式可以保证一个TCP客户端连接发送的数据总是会被分配给同一个worker进程。 这种模式可能会存在性能问题，作为SOA服务器时，不应当使用此模式。因为客户端很可能用了连接池，客户端100个进程复用10个连接，也就是同时只有10个swoole worker进程在处理请求。这种模式的业务系统可以使用dispatch_mode = 3，抢占式分配。

#### 3.5.3 Queue模式 dispatch_mode = 3

此模式下，网络请求的处理是抢占式的，这可以保证总是最空闲的worker进程才会拿到请求去处理。 这个模式的缺点是，客户端连接对应的worker是随机的。不确定哪个worker会处理请求。无法保存连接状态。 当然也可以借助第三方库来实现保存连接状态和会话内容，比如apc/redis/memcache。



### 3.6 配置swoole_server的行为

swoole_server的行为模式，需在初始化swoole_server前进行配置，运行后不能再修改。如下是一个配置swoole_server的示例：

``` javascript
$serv = new swoole_server("127.0.0.1", 9501, SWOOLE_BASE, SWOOLE_SOCK_TCP);
$serv->set(array(
    'worker_num' => 4,    //配置worker进程数
    'daemonize' => true,  //是否以demonize方式运行
    'backlog' => 128,   //listen backlog
    'max_request' => 50, //worker进程完成
    'dispatch_mode'=>1,
    'chroot' => '/tmp/root', //重定向根目录，避免出现安全问题
    'user' => 'www-data', //修改worker进程所属用户
    'group' => 'www-data'//修改worker进程所属用户组
));
```

swoole_server的可配置项详细介绍可查看官方文档：[http://wiki.swoole.com/wiki/page/274.html](http://wiki.swoole.com/wiki/page/274.html)

### 3.7 swoole_server环境下编程注意问题

#### 3.7.1 异常捕获

swoole不支持 set_exception_handler函数，如果你的PHP代码有抛出异常逻辑，**必须在事件回调函数顶层进行try/catch来捕获异常**。

``` javascript
$httpServ->on('Request', function($request,$response) {
    try
    {
        //some code
    }
    catch(\Throwable $e)
    {
        //exception code
    }
}
```

#### 3.7.2 捕获Server运行期致命错误

Server运行期一旦发生致命错误，那客户端连接将无法得到回应。如Web服务器，如果有致命错误应当向客户端发送Http 500 错误信息。在swoole中可以通过register_shutdown_function + error_get_last 2个函数来捕获致命错误，并将错误信息发送给客户端连接。具体代码示例如下：

``` javascript
register_shutdown_function('handleFatal');
function handleFatal()
{
    $error = error_get_last();
    if (isset($error['type']))
    {
      ...
      $this->response->end($someErrorMsg);
    }
}
```

#### 3.7.3 内存泄漏风险防范

`swoole_server`启动后内存管理的底层原理与普通php-cli程序一致。全局变量、对象、资源被申请后，遵循引用计数回收，不会自动销毁。需要注意内存泄露问题。通过以下几个方面来预防。

1、全局变量、对象、类静态变量、函数静态变量、超全局变量及保存在swoole_server对象上的变量，不会被自动释放，程序员自行处理全局变量和对象的销毁工作。

``` javascript
//如下代码会造成内存泄露，严重时可能发生爆内存
class Test
{
    static $array = array();
    static $string = '';
}

function onReceive($serv, $fd, $reactorId, $data)
{
    Test::$array[] = $fd;
    Test::$string .= $data;
}
```

2、同步阻塞并且请求响应式无状态的Server程序可以设置`max_request`，当Worker进程/Task进程结束运行时或达到任务上限后进程自动退出。该进程的所有变量/对象/资源均会被释放回收。

3、程序内在`onClose`或设置`定时器`及时使用`unset`清理变量，回收资源。

#### 3.7.4 swoole中是否可以共用1个redis或mysql连接

绝对不可以。必须每个进程单独创建redis/mysql连接，其他的存储客户端同样也是如此。原因是如果共用1个连接，那么返回的结果无法保证被哪个进程处理。持有连接的进程理论上都可以对这个连接进行读写，这样数据就发生错乱了。**所以在多个进程之间，一定不能共用连接**。

- 在swoole_server中，应当在onWorkerStart中创建连接对象
- 在swoole_process中，应当在swoole_process->start后，子进程回调函数中创建连接对象
- 本页面所述信息对使用pcntl_fork的程序同样有效
