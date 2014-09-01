## 通过User和Pwd登录远程服务器 ##


    from fabric.api import env, run

    env.user = 'root'
    env.password = 'xxxx'
    env.hosts = ['host1', ]

    def test():
        run('ls')


## 多台Hosts，不同的User和Password登录 ##
官方文档提供了一种解决方案，用env.passwords：
	
	env.hosts = ['root@host1', 'timest@host2']
	env.passwords = {'root@host1':'pwd1', 'timest@host2':'pwd2'}

不知道为什么，我这边用此方案无法成功，网络上找了解决方案依旧不行，不知道是不是版本问题。Local版本是1.8.3 . 

## 通过密钥登录服务器 ##
~/.ssh/config:
	
     Host h1
         User timest
         Port 5678
         HostName xxx.xxx.xxx.xxx
         IdentityFile ~/.ssh/xxx/id_rsa


fabfile.py:

	from fabric.api import env, run

	env.use_ssh_config = True
	env.hosts = ['h1',]

	def test():
    	run('ls')
