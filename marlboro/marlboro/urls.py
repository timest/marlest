from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

from news.views import home, info_detail, comment_list

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'news.views.home', name='home'),
    url(r'^comments/$', comment_list),
    url(r'^infos/(?P<pk>[\d]+)/$', info_detail),

    url(r'^admin/', include(admin.site.urls)),
)
