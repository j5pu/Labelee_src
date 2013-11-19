from settings.common import *
from settings.dev import *


ALLOWED_HOSTS = ['*']
DEBUG = True

DATABASES = {
    "default": {
    "ENGINE": "django.db.backends.mysql",
    "NAME": "labelee_dev",
    "USER": "mnopi",
    "PASSWORD": "1aragon1",
    "HOST": "192.168.1.201",
    "PORT": "",
    }
}
