
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

try:
    from local_settings import *
except:
    print 'ERROR:local_settings.py should contain your local config, which must exist in the project!'
    exit(0)

SECRET_KEY = '2y62#8#$t0$zae&3(%!(t4i_30y69@5@6$lnw@_oye-fvlx79a'

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'south',
    'news',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'marlboro.urls'

WSGI_APPLICATION = 'marlboro.wsgi.application'


LANGUAGE_CODE = 'zh-CN'

TIME_ZONE = 'Asia/Shanghai'

USE_I18N = True

USE_L10N = False

USE_TZ = False


STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static")

MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = '/media/'

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "global_static"),
)

TEMPLATE_DIRS = (
    os.path.join(BASE_DIR, 'template'),
)
