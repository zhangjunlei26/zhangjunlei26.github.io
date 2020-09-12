## 4  协程及异步IO demo

### 4.1 同步阻塞IO还是异步IO

两种IO方式的特点：

- 同步阻塞IO，开发效率高，代码易读，性能差。
- 异步IO，非阻塞，性能好，回调方式接收数据，性能好，但业务稍复杂，层层嵌套回调数据，代码难维护，影响开发效率。



### 4.2 协程管理异步IO

为了兼顾性能与可维护性，我们引入了协程，将异步IO回调在底层做封装，在牺牲一部分性能的基础上，把异步编程转化为同步编程，同步编程，异步调用。消除回调机制带来的麻烦，降低开发的复杂度。关于协程的相关概念，可参阅PHP手册，另外推荐资料如下：

- [Cooperative multitasking using coroutines (in PHP!)](http://nikic.github.io/2012/12/22/Cooperative-multitasking-using-coroutines-in-PHP.html)
-  [在PHP中使用协程实现多任务调度](http://www.laruence.com/2015/05/28/3038.html)

### 4.3 在SPF框架中实现一个异步串行IO DEMO

继3.1章Demo，在/data/www/foo.com/demo/controller目录下创建文件名为async.php的控制器，代码如下：

``` javascript
<?php
namespace demo\controller;

use demo\model\Test as TestModel;
use spf\App\Web\Controller;
use spf\App\Web\Message\Json;
class async extends Controller {

    public function actionIndex() {
        $tcpClient = new \spf\Client\Tcp('127.0.0.1', 9501, 'hello TCP!', 0.5);
        $rs1 = yield $tcpClient->run();
        $rs2 = yield $tcpClient->send('hello TCP again!')->run();
        $ret = ['rs1'=>$rs1,'rs2'=>$rs2];
  		$this->response->display(Json::ret($ret));
    }

}
```

在协程模式下，代码依次执行，先得到`$rs1`后，再顺序执行，得到`$rs2`，最终将`$rs1`,`$rs2`渲染为json格式，返回给浏览器。

### 4.4将业务封装入model

控制器一般不写业务逻辑，在/data/www/foo.com/demo/model目录下创建Test.php，把控制器中的异步IO逻辑，移入synTest方法，代码如下：

``` javascript
<?php
namespace demo\model;
use spf\Coroutine\Coroutine;
class Test {

    public function syncTest() {
  		$tcpClient = new \spf\Client\Tcp('127.0.0.1', 9501, 'hello TCP!', 0.5);
        $rs1 = yield $tcpClient->run();
        $rs2 = yield $tcpClient->send('hello TCP again!')->run();
        //协程的返回方式，不能用return
	    yield Coroutine::ret(['rs1'=>$rs1,'rs2'=>$rs2]);
    }

}
```

重构4.1节的async.php控制器代码如下：

``` javascript
namespace demo\controller;

use demo\model\Test as TestModel;
use spf\App\Web\Controller;
use spf\App\Web\Message\Json;

class async extends Controller { 

    public function actionIndex() {
        //调用syncTest生成器，得到model中返回的结果
        $ret = yield (new TestModel)->syncTest();
        //输出
        $this->response->display(Json::ret($ret);
    }

}
```

通过该例，我们学会了在协程中，调用另一个生成器，得到返回值的方式。

### 4.5 异步并行IO

业务上没有先后依赖关系的逻辑，进行并行调用，可以节省单个请求的耗时。并行调用的调用方式示例如下：

``` javascript
//在上例的model/Test.php中添加以下方法
    public function parallelTest() {
        $pp = new \spf\Client\ParallelProcessor();

        //添加需要并行执行的任务
        $tcp_client = new \spf\Client\Tcp('127.0.0.1', 9501, 'Hello TCP!', 0.5);
        $udp_client = new \spf\Client\Udp('127.0.0.1', 9505, 'Hello UDP!', 0.5);

        //添加一个组发任务
        $pp->add($tcp_client, 'rs1');//第二个参数rs1,rs2为返回结果标识key
        $pp->add($udp_client, 'rs2');
        $rs = (yield $pp->run());//执行 

        //再次添加二组并发任务
        $pp->add($tcp_client->send('Hello TCP again!'), 'rs3');
        $pp->add($udp_client->send('Hello UDP again!'), 'rs4');
        $rs2 = (yield $pp->run());//执行

        //关闭连接
        $tcp_client->close();
        $udp_client->close();

        //返回结果
        yield Coroutine::ret($rs + $rs2);  

    }
```

通过该示例，我们学会可以将一些无依赖关系的任务并行执行，得到第一组并行任务的结果，代码才能继续向下执行，继而得到第二组并行任务的结果，最后返回结果。