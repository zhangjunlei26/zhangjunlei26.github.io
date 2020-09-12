#常用配置说明

Sublime SFTP for: Junlei Zhang
Quantity: 1

{
"email": "zhangjunlei26@gmail.com",
"product_key": "b16e81-5b7175-2ea80d-dcd435-396c91"
}

Sublime SVN for: Junlei Zhang
Quantity: 1

{
"email": "zhangjunlei26@gmail.com",
"product_key": "4ff3e5-a7fdcb-4cd71c-a25eb5-3c98c8"
}

##sublime text 3配置
Ctrl+`调出console

    import urllib.request,os; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); open(os.path.join(ipp, pf), 'wb').write(urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ','%20')).read())

##包含大量配色主题的插件包

* Colorsublime
* 

##常用插件
* emmet (zen coding) 
* Bracket Highlighter 类似于代码匹配，可以匹配括号，引号等符号内的范围。
* GBK to UTF8 将文件编码从GBK转黄成UTF8，快捷键Ctrl+Shift+C
* Git
* JsMinifier
* sublimeLinter 代码错误提示
* Nettuts Fetch 如果你在用一些公用的或者开源的框架，比如 Normalize.css或者modernizr.js，但是，过了一段时间后，可能该开源库已经更新了，而你没有发现，这个时候可能已经不太适合你的项目了，那么你就要重新折腾一遍或者继续用陈旧的文件。Nettuts Fetch可以让你设置一些需要同步的文件列表，然后保存更新。
* 安装Markdown Preview/Markdown Editing插件 
* 搜索format
* BufferScroll 折叠状态保留插件
* SideBarEnhancements 侧边栏增强
* Hex-to-HSL-Color Hex颜色模式转HSL颜色模式 在用CSS3的一些属性时会用到HSL颜色模式，用软件转来转去确实麻烦，用Hex-to-HSL-Color这个插件便可轻松解决，鼠标选中一个或多个十六进制颜色代码，按下Shift+Ctrl+U立马转换为HSL颜色模式
* CSScomb CSS属性排序 选中要排序的CSS代码，按Ctrl+Shift+C
* CSS Compact Expand CSS属性展开收缩  每个人写CSS都有不同的风格，有些人喜欢写成一行，有些人喜欢写成多行，各有各的好处，我倒喜欢将CSS写成一行，这样能减少CSS文件大小，且屏幕能显示更多的Class方便查找。如果阅读别人的代码不符合自己的习惯，可以用CSS Compact Expand这个插件将CSS格式化一下，按 Ctrl+Alt+[ 收缩CSS代码为一行显示，按 Ctrl+Alt+] 展开CSS代码为多行显示，此插件由sublime textQQ群里一个牛人封装。
* JsFormat javascript格式化  有时从网上扒了人家的js代码来学习学习，打开发现被压缩了，这时就可以用JsFormat插件格式化js代码，恢复未压缩时候的排版，挺给力的。按快捷键Ctrl+Alt+F即可格式化当前的js文件了。 插件下载：https://github.com/jdc0589/JsFormat
* javascript-API-Completions  支持Javascript、JQuery、Twitter、Bootstrap框架、HTML5标签属性提示的插件，是少数支持sublime text 3的后缀提示的插件，HTML5标签提示sublime text 3自带，不过JQuery提示还是很有用处的，也可设置要提示的语言。
* SublimeTmpl 快速生成文件模板 



##SublimeTmpl默认的快捷键

    ctrl+alt+h html
    ctrl+alt+j javascript
    ctrl+alt+c css
    ctrl+alt+p php
    ctrl+alt+r ruby
    ctrl+alt+shift+p python


##Markdown Preview
如果我们想要直接在浏览器中预览效果的话，可以自定义快捷键：点击 Preferences --> 选择 Key Bindings User，输入：

    "keys": ["alt+m"], "command": "markdown_preview", "args": { "target": "browser"} 

保存后，直接输入快捷键：Alt + M 就可以直接在浏览器中预览生成的HTML文件了。

设置语法高亮和mathjax支持

在Preferences -> Package Settings -> Markdown Preview -> Setting - User中添加如下参数：

    {
        /*Enable or not mathjax support.*/
        "enable_mathjax": true,

        /*Enable or not highlight.js support for syntax highlighting.*/
        "enable_highlight": true,
    }

##Sublime Text 3常用快捷键
1) 选择

###以下是一些Sublime Text选择文本的快捷键：

    Command + D 选中一个单词
    Command + L 选中一行
    Command + A 全选
    Ctrl + Command + M` 选中括号内所有内容 (编写CSS或JS时非常实用)

Sublime Text还支持一次选中多行的操作：Furthermore, Sublime Text brings lets us select multiple lines at once, which can significantly boost your productivity. There are several ways to perform this feature:

    Command 按住Command键再点击想选中的行
    Command + Ctrl + G (选中部分文本时) 按此键选中所有相同文本
    Command + D (选中部分文本时) 直接选中下一次出现的该文本

###2) CSS排序

CSS属性的顺序一般不重要，因为无论何种顺序浏览器都能正确渲染。但排序所有的属性还是有助于代码的整洁。在Sublime Text中，选中CSS属性后按F5就可以按字母顺序排序。

###3) 命令面板（Command Palette
使用命令面板可以快速完成多重任务。按Command + Shift + P调出面板，键入需要的命令即可。看以下的几个示例：
rename Syntax Snippet

###4) 切换标签页与工程

在同时打开多个标签页时，可以用以下的热键切换：

    Command + T 列出所有的标签页
    Command + Shift + ] 下一标签页
    Command + Shift + [ 上一标签页
    Command + Ctrl + P 切换侧边栏显示的工程

###5) 跨文件编辑

同一个编辑操作可以在多个文件中同时重复。举个例子，多个文件中有同一段代码时，可用以下的步骤快速编辑：

    按Command + Shift + F在Find框中输入待查找的代码。可按Command + E快速使用选择中的代码段。
    在Where框中指定需要查找的文件范围，或填写<open files>表示查找目前打开的文件。
    在Replace框中输入要替换成的代码，按Replace按钮批量替换。


###6) 文件爬虫

按Command + R可以列出文档中所有的CSS选择器。可以选择并立刻跳转查看。这个操作比使用一般的“查找”功能快得多。  @..navbar

###7) 拼写检查

如果你经常使用Sublime Text从事英文创作，那么启用拼写检查就非常有用处了。选择Preferences > Settings – User菜单，添加以下代码：
    
    "spell_check": true,      

###8) 增强侧边栏

SideBarEnhancements 插件有效地改进了Sublime Text的侧边栏。安装插件后在侧边栏上点击右键，可以找到一下新功能：在资源管理器中打开、新建文件、新建文件夹、以…打开、在浏览器中打开。

###10) 更换Sublime Text程序图标

不仅主题可以更换，图标也可以。在Dribbble上有大量重新设计的Sublime Text精美图标。更换方法：

    下载一个图标，有.icns格式的最好。如果没有，用iConvert转换之。
    终端执行：open /Applications/Sublime\ Text.app/Contents/Resources/
    替换Sublime Text 3.icns或Sublime Text 2.icns文件。

###11) 同步选项

如果在多台计算机上工作，同步选项设置应该是一个好主意。我们借用Dropbox完成这一任务。

首先在终端中运行以下命令上传设置文件：

mkdir $HOME/Dropbox/sublime-text-3/  
mv "$HOME/Library/Application Support/Sublime Text 3/Packages" "$HOME/Dropbox/sublime-text-3/"  
mv "$HOME/Library/Application Support/Sublime Text 3/Installed Packages" "$HOME/Dropbox/sublime-text-3/"  

然后在所有需要同步的计算机上运行以下命令下载设置：

DSTPATH="$HOME/Library/Application Support/Sublime Text 3"  
DROPBOX_PATH="$HOME/Dropbox/sublime-text-3"  
rm -rf "$DSTPATH/Installed Packages"  
rm -rf "$DSTPATH/Packages"  
mkdir -p "$DSTPATH"  
ln -s "$DROPBOX_PATH/Packages" "$DSTPATH/Packages"  
ln -s "$DROPBOX_PATH/Installed Packages" "$DSTPATH/Installed Packages"  

### 12) 可点击的URL

使用小插件ClickableURLs可以让文件中的URL能够点击。



### 13) 快捷键组合   功能
shift + cmd + p     打开命令面板
control + `     控制台
cmd + n     新建标签
cmd + 数字    标签切换
cmd + option + 2    分成两屏
control + 数字    分屏时移动到不同的屏幕
cmd + delelte   删除光标前所有字符, 貌似是Mac快捷键
cmd + f     查找
option + cmd + f    查找替换
cmd + t     文件跳转
control + g  行跳转, 类似vim中的num + g
cmd + r     函数跳转
cmd + /     给选中行添加或去掉注释
cmd + [或 cmd + ]    智能行缩进
cmd + k + b     开关侧边栏
ctrl+j 合并行
ctrl+l 选中行
ctrl+shift+k 删除行
ctrl+shift+d 重复行

更多快捷键可查看 官方文档 

参考: [12个不可不知的Sublime Text应用技巧和诀窍](http://segmentfault.com/a/1190000000505218)
