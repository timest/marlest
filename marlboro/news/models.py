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