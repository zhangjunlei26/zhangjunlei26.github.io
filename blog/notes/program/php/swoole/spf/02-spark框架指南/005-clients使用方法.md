## 7 Clients异步IO库

### 7.1 TCP

#### 7.1.1 构造函数

其构造原型为

``` javascript
new \spf\Client\Tcp($ip, $port, $data, $timeout);
```

- $ip            TCP Server的IP
- $port        TCP Server的端口
- $data        发送给TCP Server 的数据
- $timeout  超时时间，单位秒

#### 7.1.2 协程中运行

一般用在controller/model等的协程调用。连接到同一个tcp server后，可以重复发送、接收数据，示例如下：

``` javascript

$tcp = new \spf\Client\Tcp('127.0.0.1', 9501, 'hello TCP!', 0.5);
$rs  = yield $tcp->run();//第一次调用
$rs2 = yield $tcp->send('hello TCP again!')->run();//发送新消息，第二次调用
$tcp->close();//关闭该连接资源
```



#### 7.1.3 异步调用

用于传通异步IO，通过回调得到结果，异步回调demo如下：

``` javascript
$tcp = new \spf\Client\Tcp('127.0.0.1', 9501, 'hello TCP!', 0.5);
$tcp->fetch(function($rs,$tcp){
     print_r($rs);
     
});
$tcp->send('hello TCP again!')->fetch(function($rs,$tcp){
         print_r($rs);
         $tcp->close();
     });
```



### 7.2 UDP

#### 7.2.1 构造函数

其构造原型为

``` javascript
new \spf\Client\Udp($ip, $port, $data, $timeout);
```

- $ip           UDP Server的ip
- $port       UDP Server的端口
- $data       发送给UDP Server的数据
- $timeout 超时时间，单位秒


- ​

#### 7.2.2 协程中运行

一般用在controller/model等的协程调用。连接到同一个tcp server后，可以重复发送、接收数据，示例如下：

``` javascript
$udp = new \spf\Client\Udp('127.0.0.1', 9501, 'hello UDP!', 0.5);
$rs  = yield $udp->run();//第一次调用
$rs2 = yield $udp->send('hello UDP again!')->run();//发送新消息，第二次调用
$udp->close();//关闭该连接资源
```



#### 7.2.3 异步调用

用于传通异步IO，通过回调得到结果，异步回调demo如下：

``` javascript
$udp = new \spf\Client\Udp('127.0.0.1', 9501, 'hello UDP!', 0.5);
$udp->fetch(function($rs,$udp){
     print_r($rs);
     $udp->send('hello UDP again!')->fetch(function($rs,$udp){
         print_r($rs);
         $udp->close();
     });
});
```



### 7.3 TASK

#### 7.3.1 Task Client概述

\spf\Client\Task是一个比较特殊的异步IO类，它通过ipc向task进程发送请求，用异步回调接收结果。task进程运行在多进程模式，且工作在同步阻塞方式下，只能采用串行式编程，与传通PHP编码方式类似。

Task进程用途广泛：

- 处理慢速任务，如发邮件、发送消息广播、处理大量文件/DB数据等。
- 实现db/nosql/tcp服务连接沲。
- 一些基于传通的同步阻塞IO代码 (如model/service/api等) 向spf迁移，在task进程中运行，继续提供服务。

当然task模块的作用还不仅如此，能做什么，我们还需要进一步挖掘。

#### 7.3.2  Task client构造函数

``` javascript
new \spf\Client\Task(\swoole_server $server,$args);
```

`$server` 实例用于执行$server->task，发送task任务。

`$args` 参数为数组，组成调用task的接口的参数，可拆分为如下数组格式：

``` javascript
[
  [$class,$method],//要调用的接口类和方法，$class最好继承自容器基类。
  [$arg1,$arg2,...],//要传递给上行的参数，如果无参数，保持为空数组[]
]
```



#### 7.3.3 定义task服务demo

参考3.1章节demo，在/data/www/foo.com/demo目录下创建task/model/Test.php文件，

``` shell
cd /data/www/foo.com/demo
mkdir -p task/model
touch task/model/Test.php
```



编辑Test.php，添加如下同步阻塞IO的MySQL查询demo代码:

``` javascript
<?php
namespace demo\task\model;

use spf\Container\Singleton;
use spf\Exception\Logic;

class Test extends Singleton {
	
    public function fetchTestDbTables() {
        //连接mysqli
        $mysqli = new \mysqli('127.0.0.1', 'root', '951753', 'test', '3306');
        if ($mysqli->connect_errno) {
            $err = printf("Connect failed: %s\n", $mysqli->connect_error);
            throw new Logic(Logic::DB_CONNECT_ERROR, $err, '连接db失败');
        }
        //查询,取结果
        $result = $mysqli->query("show tables");
        $ret = [];
        if ($result) {
            if ($result->num_rows) {
                while ($tmp = $result->fetch_assoc()) {
                    $ret[] = $tmp;
                }
            }
            $result->free_result();
        }
        if ($mysqli->error) {
            //错误
            $err = printf("mysqli error[%d]: %s\n", $mysqli->errno, $mysqli->error);
            $mysqli->close();
            throw new Logic(Logic::DB_CONNECT_ERROR, $err, '查询sql失败');
        } else {
            //返回结果
            $mysqli->close();
            return $ret;
        }
    }
}
```

该例中，Test继承自spf\Container\Singleton，该类是容器化实例的单子模式，仅第一次调用进行实例化，后面的章节会专门对容器使用进行讲解。



#### 7.3.4 在协程中访问Task服务 demo

参考3.1章节demo，在/data/www/foo.com/demo目录下的controller/async.php中添加方法如下：

``` javascript
    public function actionTask() {
        $container = (yield Coroutine::getContainer());
        $server = $container['swoole_server'];
        $task_client = new \spf\Client\Task($server, [
            [
                'demo\task\model\Test',//task类
                'fetchTestDbTables',//要调用的task方法
            ],
            [],//参数
        ]);
        $rs = yield $task_client->run();
        $this->response->display(Json::ret($rs));
    }
```

访问[http://127.0.0.1/demo/async/task](http://127.0.0.1/demo/async/task) 即可看到类似以下输出：

``` json
{
  "code": 0,
  "data": [
    {
      "Tables_in_test": "sample"
    },
    {
      "Tables_in_test": "t"
    },
    {
      "Tables_in_test": "test"
    }
  ],
  "memory_used": "2MB",
  "elapse": "0.006129秒"
}
```

#### 7.3.5 异步访问Task服务 demo

用于传通异步IO，通过回调得到结果，异步回调demo如下：

``` javascript
public function actionTask() {
        $container = (yield Coroutine::getContainer());
        $server = $container['swoole_server'];
        $task_client = new \spf\Client\Task($server, [
            [
                'demo\task\model\Test',//task类
                'fetchTestDbTables',//要调用的task方法
            ],
            [],//参数
        ]);
        $task_client->fetch(function($rs,$task_client){
              $this->response->display(Json::ret($rs));
        });
    }
```



#### 7.3.6 Task服务延伸说明

- 如果需要实现mysql/redis/tcp等服务的连接沲，仅需要将这些连接实例化一次，不关闭连接即可。
- 注意连接沲中的连接可能中断的问题，调用连接失败，须实现自动重连。
- worker中可以控制多个task任务的串行或并行，为了减少IO调用开销，保持逻辑清晰的前提下，将多个串行IO封装成一个总调用入口，在Task中实依次调用，这样task的ipc通信只用进行一次交互。

### 7.4 HttpClient

#### 7.4.1 函数原型

该Client用于请求HTTP Server，获取HTTP响应结果。其构造原型为

``` javascript
$client = new \spf\Client\HttpClient($timeout);//仅有一个超时参数
```

得到实例后，需要初始化http请求，原型如下：

``` javascript
$client->__call($method,$args);
```

- $method是可以使用的http请求小写方法，可用方法为：`get, head, post, put, trace, options, delete, upgrade`，upgrade不是http方法，用来连接websocket。


- `$args`为其它参数，我们这里以post方法为例，对`$args`进行分解，则整个调用方式如下格式：

``` javascript
$client->post($url,$data,$headers,$cookies);
```

- 每个`$args`参数，都有4部分组成：
  - `$url`   string，要请求的url地址，第一次请求须是完整格式，之后请求要以为uri部分。
  - `$data`    array或string，为要发送的数据，一般为post/put方法中，发送到服务端的request body体。
  - `$headers`    array，要添加的header
  - `cookies`    array，要使用的cookie，注意，httpClient中，发送第一次请求后，得到的cookie会自动附带给后续请求，不需要人为指定。该参数用于强制添加cookie。

#### 7.4.2 协程中运行

一般用在controller/model等的协程调用。连接到同一个http server后，可以重复发送、接收数据，示例如下：

``` javascript
//demo1
$client = new \spf\Client\HttpClient(10);
$url = 'http://qt.qq.com/syb/huoxianshike/html/index.shtml';
$rs = yield $client->get($url)->run();
$uri = '/syb/huoxianshike/html/more.shtml';
$rs2 = yield $client->get($uri);//建立连接后，后续请求可以直接用URI，不必用完整url
$client->close();//关闭client

//demo2
$url2 = 'http://www.wx.com/u/1407642250/home?wvr=5&lf=reg';
$client2 = (new \spf\Client\HttpClient(10));
$client2->post(
    $url2,//url
    ['username' => 'test', 'passwork' => '123456'],//post
    [
        'User-Agent'     => 'Chrome/52.0.2743.10',
        'Accept-Encodin' => 'gzip, deflate, sdch',
    ],//header
    ['SUBP' => '0033WrSXqPxfM72-Ws9jqg9P9D9W5k.HzQZNEFYb14'],//cookie
           );
$rs = yield $client2->run();
$client2->close();
```

#### 7.4.3 异步调用

用于传通异步IO，通过回调得到结果，异步回调demo如下：

``` javascript
//demo1
$client = new \spf\Client\HttpClient(10);
$url = 'http://qt.qq.com/syb/huoxianshike/html/index.shtml';
$client->get($url)->fetch(function($rs,$client){
      var_dump($rs);
      $uri = '/syb/huoxianshike/html/more.shtml';//建立连接后，后续请求可以直接用URI
      $client->get($uri)->fetch(function($rs2,$client){
            var_dump($rs);
			$client->close();//关闭client
      });
});
```



### 7.5 MySQL

#### 7.5.1 构造函数

``` 
$client = new \spf\Client\MySQL(array $conf);
```

`$conf`的格式如下示例：

``` javascript
[
  'host'     => '127.0.0.1',
  'port'     => '3306',
  'user'     => 'root',
  'password' => '??????',
  'database' => 'testdb',
  'charset'  => 'utf-8',
];
```



#### 7.5.2 在协程中运行

``` javascript
$client = new \spf\Client\MySQL([
  'host'     => '127.0.0.1',
  'port'     => '3306',
  'user'     => 'root',
  'password' => '??????',
  'database' => 'testdb',
  'charset'  => 'utf-8',
]);
$rs1 = (yield $client->query('show tables')->run());
$rs2 = (yield $client->query('select * from test')->run());
$client->close();

//注意：查询语句，返回结果集。如果为insert/update类语句，返回如下格式数组： ['affected_rows'=>?,'insert_id'=>?]

```

#### 7.5.3 异步回调

``` javascript
$client = new \spf\Client\MySQL([
  'host'     => '127.0.0.1',
  'port'     => '3306',
  'user'     => 'root',
  'password' => '??????',
  'database' => 'testdb',
  'charset'  => 'utf-8',
]);
$client->query('show tables')->fetch(function($rs,$client){
    var_dump($rs);
    $client->query('select * from test')->fetch(function($rs2,$client){
        var_dump($rs2);
        $client->close();
    });
});
```



### 7.6 ParallelProcessor多任务并发

用于并发运行多个异步IO Client，只能用在协程环境中。调用demo如下：

``` javascript
$pp = new \spf\Client\ParallelProcessor();

//得到两个异步client，可以为单例模式已初始化好的
$tcpClient = new \spf\Client\Tcp('127.0.0.1', 9501, 'Hello TCP!', 0.5);
$udpClient = new \spf\Client\Udp('127.0.0.1', 9505, 'Hello UDP!', 0.5);

//添加二个并发执行的异步IO任务,第二个参数为返回结果标识key
$pp->add($tcpClient, 'rs1');
$pp->add($udpClient, 'rs2');
$rs = (yield $pp->run());//并发执行
// 得到$rs类似如下
// ['rs1'=>'tcp server ret','rs2'=>'udp server ret']

//再次添加二批并发任务
$httpClient = (new \spf\Client\Http())->get('http://daxue.qq.com/');
$pp->add($httpClient, 'rs1');
$pp->add($tcpClient->send('Hello TCP again!'), 'rs2');
$pp->add($udpClient->send('Hello UDP again!'), 'rs3');
$rs2 = (yield $pp->run());//第二次并发执行

//关闭client不再复用
$tcpClient->close();
$udpClient->close();
$httpClient->close();

```

需要注意的是，一个并发中，一定不能重复添加同一实例，无法得到正确结构。

``` javascript
//以下为错误的调用方法demo
//省略初始化...
$pp->add($tcpClient, 'rs1');
$pp->add($tcpClient, 'rs2');//这种写法是错误的，与上句是同一实例
$pp->add($tcpClient->send('Hello'), 'rs3');//这种写法也是错误的，也上句也是同一实例，且要发送的消息替换了前二句的消息。
$rs = (yield $pp->run());//并发执行，得到不可预期的结果
$tcp->close();
```





###  