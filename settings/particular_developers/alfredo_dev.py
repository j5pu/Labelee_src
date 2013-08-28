from settings.common import *
from settings.dev import *

#Alfredo's local database
#
DATABASES = {
    "default": {
    "ENGINE": "django.db.backends.mysql",
    "NAME": "test_alfredo",
    "USER": "root",
    "PASSWORD": "1aragon1",
    "HOST": "localhost",
    "PORT": "",
    }
}
