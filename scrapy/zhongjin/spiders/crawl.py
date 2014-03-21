# -*- coding:UTF-8 -*-
#date:01-28
from scrapy.spider import Spider
from scrapy.selector import Selector

import datetime, time
import redis

class Fx678(Spider):
    name = u'fx'
    allowed_domains = ['www.fx678.com']
    start_urls = ['http://www.fx678.com/news/flash/default.shtml' ]

    def parse(self, response):
        sel = Selector(response)
        infos = sel.xpath('//div[@class="list_content01_title"]')
        for i in infos:
            href = i.xpath('div[1]/a/@href').extract()[0].strip()
            title = i.xpath('div[1]/a/text()').extract()[0].strip()[1:]
            add_time = i.xpath('div[2]/text()').extract()[0].strip()
            time_string = '%s/%s' % (datetime.date.today().year, add_time)
            time_struct = time.strptime(time_string, '%Y/%m/%d %H:%M')
            dt = datetime.datetime.fromtimestamp(time.mktime(time_struct))

            site = ''
            if href.endswith('html') and not href.endswith('index.shtml'):
                site = 'fx678_%s' % href.split('/')[-1].split('.')[0]

            r5 = redis.Redis(host='localhost', port=6379, db=5)
            r4 = redis.Redis(host='localhost', port=6379, db=4)

            if site and title and dt:
                print 'site:%s ' %  site
                sql = u"insert into news_info(title, site, add_time, is_breaking_news, is_hidden) value('%s', '%s', '%s', 0, 0)" % (title, site, dt)
                # print sql
                sen = '{"sql":"%s", "title":"%s", "add_time":"%s", "is_breaking_news":"%s" }' % (sql, title, dt, 0)
                if not r5.exists(site):
                    r5.set(site, sen)
                    r4.set(site, sen)
                else: r5.set(site, sen)
            else :
                print 'error'
