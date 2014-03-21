marlest
=======

Django+NodeJS+Redis实现实时消息推送


### 一、前言

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;这是一个Django为主，Socket.IO为辅的技术入门文章，通过开发一个实时的资讯推送平台，本系列文章从前段到后端，从数据库到服务器，甚至到爬虫的编写和nginx的配置我们都将“事必躬亲”。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因本人实力有限，很多技术都是现学现卖，故代码可能存在很多不足，还请多多指教！

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;要是在阅读中遇到问题，可以提交问题到Github上，或者发邮件到:timest.lyy#gmail[.]com

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;“我不是一个内向的程序员，只是我很忙！”好了，废话少说，我们开始吧！


### 二、技术列表

#### 前端
+ Bootstrap 3 (IE8+)
+ Html5 / CSS3
+ jQuery 1.10.2

#### 后端
+ Python 2.7.6
+ Django 1.6
+ NodeJs/Socket.io
	用于数据实时推送

#### 数据库
+ MySQL 5.5
+ Redis 2.8.7

#### 服务器
+ Linux / CentOS 6.3
+ Nginx 1.4.4
+ uWSGI 2.0

#### 爬虫
+ Scrapy 0.22.2

#### 项目管理等
+ Git 1.8
+ virtualenv 1.10.1
+ pip 1.4+

### 三、目录
1. 环境的安装
	* Django 的安装
	* MySQL 的安装
	* Python 的安装
	* Redis 的安装
	* NodeJs 的安装
	* Scrapy 的安装
	* Nginx 的安装
	* virtualenv 的安装

+ 用Django搭建系统架构
	* 利用Virtualenv构建虚拟环境
	* 配置项目连接数据库的驱动
	* 搭建系统的架构
	* 前端页面的编写

+ 编写爬虫脚本
	* 编写DOM规则
	* 利用Redis打个辅助
	* Redis连接池和订阅/发布

+ 实时资讯的实现
	* REST接口的编写
	* 前端页面的实现
	* 因csrf引起的403解决方案
	* NodeJs / Socket.IO 实现监听事件

+ 上线的准备
    * Nginx 的配置
    * uWSGI 的配置

+ 浅谈安全
    * csrf安全
    * XSS安全
    * SQL Injection安全
