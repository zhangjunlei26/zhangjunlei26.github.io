# php开发工作总结
一年没做开发了，汇总一下，免得面试时忘了，梳理一下思路

## 1、常用要记函数

	pathinfo   四个常量PATHINFO_FILENAME, PATHINFO_EXTENSION, PATHINFO_DIRNAME, PATHINFO_BASENAME
	parse_url 
	parse_str
	iconv_set_encoding
	iconv_strrpos
	iconv
	
## 	2、项目这点总结

### 2.1 架构

### 2.2 技术输出

1、培训模拟各种网络场景：丢包率、网速极慢、断线等场景。  
2、跟进性能测试，查看项目中存在的问题，解决了一些实质问题：

* backlog/maxconn设置过小，引发的502
* php无响应问题，需写脚本重新拉起问题
* DB锁死问题
* 偶尔出现提交表单无响应问题
* session写入过频繁问题





	
## xx、常见题目

### 函数基础类

1. 写一个函数，尽可能高效的，从一个标准 url 里取出文件的扩展名
  例如: http://www.phpddt.com/abc/de/fg.php?id=1 需要取出 php 或 .php
  
		<?php
	    	$url = "http://www.phpddt.com/abc/de/fg.php?id=1";
	    	$path = parse_url($url);
			echo pathinfo($path['path'],PATHINFO_EXTENSION);  //php
		?>

2. 在 HTML 语言中，页面头部的 meta 标记可以用来输出文件的编码格式，以下是一个标准的 meta 语句  
  <META http-equiv='Content-Type' content='text/html; charset=gbk'>  
  请使用 PHP 语言写一个函数，把一个标准 HTML 页面中的类似 meta 标记中的 charset 部分值改为 big5  
  请注意:  
  (1) 需要处理完整的 html 页面，即不光此 meta 语句  
  (2) 忽略大小写  
  (3) ' 和 " 在此处是可以互换的  
  (4) 'Content-Type' 两侧的引号是可以忽略的，但 'text/html; charset=gbk' 两侧的不行  
  (5) 注意处理多余空格  
  		
		$opts = array(
			'http'=>array(
				'method'=>"GET",
				'header'=>"Accept-language: UTF-8\r\n" .
			          "Cookie: foo=bar\r\n"
				),
				'timeout'=>30,
			);
		$html=file_get_contents("http://host/path/to/test.html")
		//注：gbk与big5没对应关系，要写函数实现转换，这里答题时忽略
		//setlocale(LC_ALL, 'zh_CN');
		iconv("GBK", "UTF-8//IGNORE", $html);
		$out=preg_replace("/(<META\s+http-equiv.*?charset=).*>/i", "\\1\"big5\">", $html);
		
		
4.写一个函数，能够遍历一个文件夹下的所有文件和子文件夹。
		
		function listDirs($dir,$prefix=''){
		$iterator=new DirectoryIterator($dir);
		foreach($iterator as $f)
		{
			if($f->isDot()){
				//不做任何处理
			}elseif($f->isFile()){
				echo $f->getFilename();
			}elseif($f->isDir()){
				echo $d=$f->getFilename();
				listDirs($)
			}
		}
		}
