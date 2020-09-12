## 5  创建一个完整spf http示例

### 5.1 概述

为了快速熟悉swoole_server编程，我们编写了一个基于spf的全异步IO模式的demo，位于`spf/examples/demo`目录下，demo中代码采用传通的mvc模式编写。接下来，我们基于这个demo，让大家对spf的编程入门，为使用者自行编写框架提供参考。



### 5.2准备工作

我们也可以，假定我们的外部访问域名为demo.com，代码要部署在`/data/www/demo.com/`目录下，修改conf/demo.php中的`root`项为该目录，并将spf/examples/demo文件夹拷贝到该目录下。demo文件结构如下：

``` shell
controller/
    async.php
    index.php
model/
    Test.php
spf/
    App.php
    Controller.php
    Route.php
    Worker.php
task/
    model/
        Test.php
views
    home.php
```

### 5.3 demo核心源码分析

#### 5.3.1 Worker.php

Worker.php用来与spf框架衔接，用来定制swoole_server的worker进程。onRequest方法接收swoole传递过来的request/response对象。创建当前会话容器，保存当前会话中需要用到的对象到容器。调用`App->run($container)`，执行当前请求。

``` java
<?php
namespace demo\spf;

use spf\Container\Container;
use spf\Swoole\Worker\Worker as WorkerBase;

class Worker extends WorkerBase {

    /**
     * worker进程创建时,初始化worker级公用资源
     * $spfContainer是worker级容器，非会话级，用于存储worker级公用资源
     */
    protected function init(Container $spfContainer) {
        parent::init($spfContainer);
       //初始化路由
        Route::register('route', $spfContainer);
    }

    public function onRequest($request = null, $response = null) {
        //创建会话容器
        $container = new Container;
        $container['request'] = $request;
        $container['response'] = $response;
		//调用App.php文件，实例化并注册到容器
        $app = App::register('application', $container);
        $app->run($container);
    }
}
```

#### 5.3.2 App.php

demo中，App.php的主要任务是

- App::run中最外层try…catch，捕获到异常则处理异常。
- 根据uri进行路由，得到对应的`controller`及`action`，执行action中的代码。

``` java
<?php
namespace demo\spf;

use spf\Container\Container;
use spf\Container\SingleInstanceBase;
use spf\Exception\Http;
use spf\Helper\ExceptionRender;
use spf\Log;
use spf\Spf;

class App extends SingleInstanceBase {

    public function __construct(Container $container) {
        $this->response = $container['response'];
        $this->request = $container['request'];
        //swoole中无法try..catch得到,所以直接处理
        register_shutdown_function([$this, 'fatalHandler']);
    }

    public function run(Container $container) {
        try {
            $route = Spf::$container['route'];//得到路由
            //得到controller/action
            list($controller, $action) = $route->parse($container);
            $gen = $controller->$action();
            //如果返回结果是Generator，则交由协程执行
            if ($gen instanceof \Generator) {
                $scheduler = Spf::$container['scheduler'];
                $scheduler->add($gen, $container);
                $scheduler->run();
            }
        } catch (\Throwable $e) {
            $this->exceptionHandler($e);//处理异常  
        }
    }

    public function exceptionHandler(\Throwable $e, $extra = []) {
   		//处理异常
    }

    public function fatalHandler() {
        //处理fatal error
    }
}
```



### 5.4 controller写法示例



#### 5.4.1 index.php

``` javascript
<?php
namespace demo\controller;

use syb\oss\Controller;

class index extends Controller {
    /**
     * 对应的请求路径为: http://127.0.0.1:8081/demo/index/index
     */
    function actionIndex() {
        $msg = "<h1>hello world!</h1>\n";
        //$this->response->end($msg);//swoole_http_response写法
        $this->output($msg);//简化写法
    }
    /**
     * 对应的请求路径为: http://127.0.0.1:8081/demo/index/json
     */
    function actionJson() {
        //输出json
        $this->json([
            'num'  => 1,
            'bt'   => true,
            'bf'   => false,
            'null' => null,
            'str'  => 'hello world!',
        ]);
    }
    /**
     * 对应的请求路径为: http://127.0.0.1:8081/demo/index/jsonerror
     */
    function actionJsonError() {
        //输出json错误
        $this->jsonError(2, '参数错误!');
    }
    /**
     * 如果conf/demo.php中的enviroment不是处于production状态，浏览器页面上，
     * 会显示丰富的错误信息，否则，只会显示简洁的，对用户友好的错误信息。
     * 外部url http://127.0.0.1:8081/demo/index/error
     */
    function actionError() {
        //手工抛出异常
        throw new \Exception('some exception', 1);
        //函数不存在
        test_function();
    }
}
```

