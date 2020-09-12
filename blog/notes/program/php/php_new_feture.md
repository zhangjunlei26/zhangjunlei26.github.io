#php5.2后各版本新添加特性（比较有用的要点)

##php5.3


##php5.4

### 不身后兼容
- break 和 continue 语句不再接受可变参数（ 比如： break 1 + foo() * $bar; ）。break 2; 这样的固定参数仍可使用。受此变化影响，不再允许出现 break 0; 和 continue 0;;
- 不再支持 安全模式。
- 非数字的字符串偏移量
- 保留关键字：callable,insteadof

### 新特性
- 支持trait
- 新增短数组语法，比如 $a = [1, 2, 3, 4]; 或 $a = ['one' => 1, 'two' => 2, 'three' => 3, 'four' => 4]; 。
- 新增支持对函数返回数组的成员访问解析，例如 foo()[0]
- 现在 闭包 支持 $this
- 现在不管是否设置 short_open_tag php.ini 选项，<?= 将总是可用。
- 新增在实例化时访问类成员，例如： (new Foo)->bar() 。
- 现在支持 Class::{expr}() 语法。
- 新增二进制直接量，例如：0b001001101 。
- 改进解析错误信息和不兼容参数的警告。
- SESSION 扩展现在能追踪文件的 上传进度 。
- 内置用于开发的 CLI 模式的 web server 。php -S localhost:8000  / php -S localhost:8000 foo

### 新的函数
- hex2bin
- http_response_code        Get or Set the HTTP response code
- get_declared_traits()
- getimagesizefromstring()
- stream_set_chunk_size()
- socket_import_stream()
- trait_exists()
- header_register_callback()
- session_status()
- session_register_shutdown()
- class_uses()
- mysqli_error_list()
- mysqli_stmt_error_list()
- Closure::bind()
- Closure::bindTo()

### 常量
- PHP 核心：
- ENT_DISALLOWED
- ENT_HTML401
- ENT_HTML5
- ENT_SUBSTITUTE
- ENT_XML1
- ENT_XHTML
- IPPROTO_IP
- IPPROTO_IPV6
- IPV6_MULTICAST_HOPS
- IPV6_MULTICAST_IF
- IPV6_MULTICAST_LOOP
- IP_MULTICAST_IF
- IP_MULTICAST_LOOP
- IP_MULTICAST_TTL
- MCAST_JOIN_GROUP
- MCAST_LEAVE_GROUP
- MCAST_BLOCK_SOURCE
- MCAST_UNBLOCK_SOURCE
- MCAST_JOIN_SOURCE_GROUP
- MCAST_LEAVE_SOURCE_GROUP
Json:
- JSON_PRETTY_PRINT
- JSON_UNESCAPED_SLASHES
- JSON_NUMERIC_CHECK
- JSON_UNESCAPED_UNICODE
- JSON_BIGINT_AS_STRING

### 其它变化

- 在 error_reporting 配置指令中，E_ALL 现在包括了 E_STRICT 级别的错误。
- htmlspecialchars() 和 htmlentities() 现在默认的字符集为 UTF-8，而不再是 ISO-8859-1
- 

## php5.5

### 不向后兼容的变更
- 不再支持 Windows XP 和 2003
### 新的特性
- 新增 Generators (yield 关键字)
- 新增 finally 关键字 
- foreach 现在支持 list() $array = [[1, 2],[3, 4]];foreach ($array as list($a, $b)) echo "A: $a; B: $b\n";
- array and string literal dereferencing (字面非关联化/字面取值) echo [1, 2, 3][0]; echo 'PHP'[0]
- 新的密码哈希 API  password_hash() 
- 改进GD，提供 imageflip/imagecrop/imagecropauto/imagecreatefromwebp/imagewebp
- 为使用 mysqli_options() 新增一个 MYSQLI_SERVER_PUBLIC_KEY 选项。
- MySQLnd 新增 mysqlnd.sha256_server_public_key 配置指令来允许 mysqli 使用新的MySQL 认证协议

### 废弃
- ext/mysql
- preg_replace() 中的 /e 修饰符, 使用 preg_replace_callback() 函数来替代

### 变更函数
- 使用 NULL 作为参数调用 set_error_handler() 将重置错误处理程序。
- 当使用 NULL 调用set_error_handler() 和 set_exception_handler() 时， 现在分别返回上一个错误或异常处理程序。
- pack() 和 unpack() 使用 “a”和“A”格式代码时的行为有所变化。 Detailed notes on these changes are available.

### 新函数
array_column()
boolval()
password_get_info()
password_hash()
password_needs_rehash()
password_verify()



##php5.6

### 新特性
- 使用表达式定义常量 const ONE = 1;const TWO = ONE * 2;class xx{const SENTENCE = 'The value of THREE is '.self::THREE;}
- const ARR=[1,2];
- 使用 ... 运算符定义变长参数函数  function f($req, $opt = null, ...$params)
- 使用 ... 运算符进行参数展开 function add($a, $b, $c) {return $a + $b + $c;} echo add(1, ...[2,3]);
- 使用 ** 进行幂运算
- use function 以及 use const
- 默认字符编码 default_charset用于 htmlentities/html_entity_decode/ htmlspecialchars/iconv(现已废弃)/mbstring，default_charset 的默认值是 UTF-8
- php://input 是可重用的了，可多次打开并读取，同时，这个特性使得在处理 POST 的数据的时候， 可以明显降低对于内存的需求量
- 大文件上传 ，支持大于 2GB 的文件
- GMP 支持运算符重载
- 使用 hash_equals() 比较字符串避免时序攻击
- __debugInfo() 
- $HTTP_RAW_POST_DATA 和 always_populate_raw_post_data

### 废弃
- iconv 和 mbstring 编码设置 使用 default_charset
废弃的选项有：
iconv.input_encoding
iconv.output_encoding
iconv.internal_encoding
mbstring.http_input
mbstring.http_output
mbstring.internal_encoding    

### 新加函数
- gmp_root()/gmp_rootrem()
- hash_equals()
- session_abort()/session_reset()

### OpenSSL changes in PHP 5.6.x 



