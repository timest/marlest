### 用Django搭建系统架构 ###

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;为了让我们的项目环境保持Clean，不污染系统的全局环境，同时也作为一种环境的自我保护，我们用 **virtualenv** 来虚拟一个环境出来，我们在里面安装的所有**Package**都和系统的**Package**相互独立，所以不用担心后期升级了系统Package而导致我们项目无法运行!


	$ virtualenv marlboro && cd marlboro
	$ ls
	bin	include	lib
		
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

#### 利用Virtualenv构建虚拟环境 ####
		
###### 启动虚拟环境 ######
		
	$ source bin/activate
运行完命令后，你会发现终端和以前相比，多了一个“(marlboro)”：

	(marlboro)timesttekiMacBook-Pro:marlboro timest$ 
		
（后期显示的终端**“timesttekiMacBook-Pro:marlboro timest”**字符将不显示）
		
###### 离开虚拟环境 ######
	
	$ deactivate
		
用**virtualenv**新建的虚拟环境会自动装好**pip**
		
	(marlboro)$ pip --version
	pip 1.4.1 from /Users/timest/marlboro/lib/python2.7/site-packages (python 2.7)


输入 
	
	(marlboro)$ pip --freeze 
	(marlboro)$

会发现一个**Package**也没有，非常干净的环境。注意，pip会把你$PYTHONPATH里的**Package**引入！

###### 用requirement.txt管理第三方包 ######

我们新建一个requirement.txt,然后在里面输入：

Django==1.6.2

然后终端运行:
		
	(marlboro)$ pip install -r requirement.txt
		

这时系统就会自动安装requirement.txt里的**Package**，稍等片刻Django就安装好了。后期把这个项目给别人，别人只要 pip install -r requirement.txt 就可以安装好所需的**Package**了。

我们用一下命令新建一个django项目，叫marlboro:
	
	(marlboro)$ django-admin.py startproject marlboro
	
更多关于Django的详细教程可以移步 [官网文档](@https://docs.djangoproject.com/en/1.6/)!

为了方便后期灵活管理项目，我们用Git做版本控制，终端内输入：

	(marlboro)$ git init
	
##### 配置项目连接数据库的驱动：#####
	
1. 新建 marlboro/local_settings.py ,把本地数据库的配置信息放到里面；然后在marlboro/settings.py的头部引入local_settings.py, 同时删除 DATABASE 和 DEBUG 常量：

		在 settings.py 文件头部 :
		
		try:
		    from local_settings import *
		except:
		    print 'ERROR:local_settings.py should contain your local config, which must exist in the project!'
		    exit(0)
		    
		在 local_settings.py 文件里
		
		#-*- coding: utf-8 -*-
		DATABASES = {
		    'default': {
    		    'ENGINE': 'django.db.backends.mysql',
        		'NAME': 'marlboro',
	        	'USER': 'root',
    		    'PASSWORD': 'xxxxx', #你本地的密码
		        'HOST': '127.0.0.1',
        		'PORT': '3306',
		        'default-character-set':'utf8',
		    }
		}
		
		DEBUG = True
	
* 新建 .gitignore ,将 **local_settings.py** 写入其中,这样就不用担心自己本地的数据库信息泄露了！
* mysql 数据库新建一个marlboro的数据库:
			
		CREATE DATABASE `marlboro` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

* 终端里用syncdb做下数据库的同步:

		(marlboro)$ python manage.py syncdb 

##### 搭建系统的架构 #####
我们的系统初步功能是页面上能显示爬虫爬取的数据，且每条资讯能够进行评论，且只能有一条评论，我们需要在Django里新建一个**Info**的Model和一个**Comment**的model：

1.  我们新建一个叫 news 的APP
    
        (marlboro)$ python manage.py startapp news
        
* 修改 news/models.py 

        #-*- coding: utf-8 -*-
        from django.db import models

        YES_OR_NO = ((0, u'否'), (1, u'是'))
        BULLISH_OR_BEARISH = ((0, u'请选择'), (1, u'利多'), (2, u'利空'))

        class Info(models.Model):
            """ 实时爬取 的资讯 """
            title = models.CharField(u'title', max_length=280)
            add_time = models.DateTimeField(u'添加时间', auto_now_add=True)
            is_breaking_news = models.IntegerField(u'是否劲爆', default=0, choices=YES_OR_NO)
            is_hidden = models.IntegerField(u'是否隐藏', default=0, choices=YES_OR_NO)
            site = models.CharField(u'来源站点', max_length=40, unique=True)
            bullish_or_bearish = models.IntegerField(u'利多?利空?', default=0, choices=BULLISH_OR_BEARISH, null=True)

            def __unicode__(self):
                return self.title

            class Meta:
                verbose_name_plural = u'财经资讯'
                ordering = ['-add_time']

        class Comment(models.Model):
            """ 评论 """
            content_object =  models.ForeignKey(Info, verbose_name=u'资讯')
            text = models.TextField(u'评论', null=True, blank=True)

            def __unicode__(self):
                return self.text

* 修改 marlboro/urls.py

		url(r'^$', 'news.views.home', name='home'),

* 修改 news/views ，因为数据由爬虫编写，所以我们先添加几条死数据进去！
	
		#-*- coding: utf-8 -*-
		from django.shortcuts import render
		
		def home(request):
            infos = [
                {'time':'2014-03-11 10:17', 'title': '周小川：支持香港离岸人民币业务的发展和创新，限制性措施会越来越少 '},
                {'time':'2014-03-11 10:12', 'title': '周小川：在人民币汇率上央行尊重市场选择，央行更关注中期趋势而非短期走势 '},
                {'time':'2014-03-11 10:11', 'title': '周小川：有关人民币汇率走势，一个因素是市场参与者对2月贸易差额看法有分化 ', 'is_breaking_news':1},
                {'time':'2014-03-11 10:07', 'title': '周小川：鼓励台湾人民币业务上支持实体经济活动，在组合投资产品上要适当掌控节奏 '},
                {'time':'2014-03-11 10:05', 'title': '周小川：台湾人民币业务发展已经很快，总体来说这些业务要稳步发展 '},
                {'time':'2014-03-11 10:04', 'title': '周小川：尚未与台湾地区就货币互换展开正式对话 '},
                {'time':'2014-03-11 09:58', 'title': '中国银监会主席：银行业总体风险可控，对个体风险有应对措施 ', 'is_breaking_news':1},
                {'time':'2014-03-11 09:55', 'title': '周小川：中国央行为开展离岸人民币业务创造条件，能否形成离岸中心取决于市场力量 '},
                {'time':'2014-03-11 09:51', 'title': '业内人士：中国央行公开市场28天期正回购中标利率为4.00%，前次为4.00% '},
                {'time':'2014-03-11 09:49', 'title': '国际现货黄金价格刷新日内高点，现报1340.77美元/盎司，涨0.79美元，涨幅0.06% '},
                {'time':'2014-03-11 09:45', 'title': '肖钢：今年将进一步推动中国的证券公司去海外经营发展 ', 'is_breaking_news':1},
                {'time':'2014-03-11 09:43', 'title': '中国证监会主席肖钢：今年将进一步扩大QFII和RQFII的投资额度 '},
                {'time':'2014-03-11 09:43', 'title': '中国央行副行长易纲：跨境资本流动的风险已增加 ', 'is_breaking_news':1},
                {'time':'2014-03-11 09:41', 'title': '周小川：将逐步完成人民币在资本账目上的可兑换性 '},
                {'time':'2014-03-11 09:41', 'title': '周小川：将加快金融市场改革 '},
                {'time':'2014-03-11 09:39', 'title': '周小川：将不会为人民币国际化设定速度及时间框架 ', 'is_breaking_news':1},
                {'time':'2014-03-11 09:36', 'title': '周小川：中国央行不过多推行人民币在国际上的使用，而是创造条件使其可被使用 '},
                {'time':'2014-03-11 09:35', 'title': '中国央行行长周小川：人民币如果真是国际化，还有很多家庭作业没做好 '},
                {'time':'2014-03-11 09:29', 'title': '中国外管局局长：现在跨境资本流动的风险比较突出，要加强监管 '},
                {'time':'2014-03-11 09:29', 'title': '深证成指周二开盘报7103.39点，跌25.15点，跌幅0.21% '},
                {'time':'2014-03-11 09:27', 'title': '沪综指周二开盘报1994.42点，跌4.65点，跌幅0.23% '},
            return render(request, 'index.html', locals())
		
* 修改 marlboro/settings.py 的INSTALL_APP ,新增"news" !
* 因为后期会修改数据，所以我们用著名的Django数据库管理插件South来管理数据库:
	1. requirement.txt 里加上"South==0.8.4";
	2. marlboro/settings.py 的INSTALL_APP ,新增"south" ;
	
* 利用south 去 migrate news ：
		
		(marlboro)$ python manage.py syncdb
		(marlboro)$ python manage.py schemamigration news --init
		(marlboro)$ python manage.py migrate news

##### 前端页面的编写 #####
具体步骤如下：
1. settings.py 里设置好 template 目录

	TEMPLATE_DIRS = (
    	os.path.join(BASE_DIR, 'template'),
	)
* 新建一个 temlate 文件夹
* template 里新建一个base.html 和 index.html 

**因为前端页面篇幅过大，建议看官们可以到github把项目clone下来后阅读。**

