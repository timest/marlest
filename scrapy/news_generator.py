#-*- coding:UTF8 -*-
from mysql import MysqlDriver

import subprocess
import redis
import time
import json




if __name__ == '__main__':
    POOL4 = redis.ConnectionPool(host='127.0.0.1', port=6379, db=4)
    POOL5 = redis.ConnectionPool(host='127.0.0.1', port=6379, db=5)
    r4 = redis.Redis(connection_pool=POOL4)
    r5 = redis.Redis(connection_pool=POOL5)
    r4.flushdb()
    r5.flushdb()
    while(True):
        r4.flushdb()
        subprocess.Popen(['scrapy', 'crawl', 'fx'], stdout=subprocess.PIPE).communicate()[0]
        print 'sleeping.....'
        time.sleep(5)
        for i in sorted(r4.keys()):
            s = json.loads(r4.get(i))
            result = MysqlDriver.getInstance().execute('%s' % s['sql'], commit=True)
            if result == 1:
                MysqlDriver.getInstance().getCursor().execute("select LAST_INSERT_ID()")
                id = MysqlDriver.getInstance().getCursor().fetchone()[0]
                r_s = redis.StrictRedis(host='localhost', port=6379)
                r_s.publish('infos', ' {"id":%s, "title":"%s", "is_breaking_news":"%s" , "add_time":"%s" }' % (id, s['title'], s['is_breaking_news'], s['add_time']) )

        time.sleep(60)
