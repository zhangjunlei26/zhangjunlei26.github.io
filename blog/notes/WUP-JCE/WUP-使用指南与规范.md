# WUP-使用指南与规范

## 

``` php
function __autoload($class)
{
    $libdir='/usr/local/lib/php/oss';
    $file=$libdir.[base|logic|smarty].$class.'.class.php'
    return is_file($file)? require $file: FALSE;
}
```

