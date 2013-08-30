from settings.common import *
from settings.dev import *

#Ramon's local database
#
DATABASES = {
    "default": {
    "ENGINE": "django.db.backends.mysql",
    "NAME": "labelee_test",
    "USER": "root",
    "PASSWORD": "",
    "HOST": "",
    "PORT": "",
    }
}
