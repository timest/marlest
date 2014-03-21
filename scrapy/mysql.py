# -*- coding: UTF-8 -*-
import MySQLdb
import threading
import time
class MysqlDriver:
    '''
        配置好数据库信息，保证能成功连接数据库，即可对数据库进行操作。
        此类用了 Singleton 模式，保证多次对数据库的操作只打开一次连接。
    '''
    __conn = None # make it so-called private
    __cursor = None
    __inst = None
    # MySQL configure info
    __HOST = '127.0.0.1'
    __USER = 'root'
    __PORT = 3306
    __PASSWD = 'xxxx' # 改成自己的mysql数据库密码
    __DBNAME = 'marlboro'

    #lock
    __lock = threading.Lock()
    def __init__(self):
        self.__conn = MySQLdb.connect(host=self.__HOST, port=self.__PORT, passwd=self.__PASSWD, user=self.__USER, db=self.__DBNAME )
        self.__conn.set_character_set('utf8')
        self.__cursor = self.__conn.cursor()

    @staticmethod
    def getInstance():
        if not MysqlDriver.__inst:
            MysqlDriver.__inst = MysqlDriver()
        return MysqlDriver.__inst

    def execute(self, sql, commit=False):
        self.__lock.acquire()
        time.sleep(0.1) # 防止被下一个进程修改了result值，让上一个进程有足够多的时间返回result
        result = '' #防止出现  referenced before assignment 错误
        try:
            result = self.__cursor.execute(sql)
            if commit:
                self.__conn.commit()
        except:
            self.__conn.rollback()
        self.__lock.release()
        return result

    def getCursor(self):
        return self.__cursor

    def close(self):
        self.__conn.close()
        self.__inst = None
