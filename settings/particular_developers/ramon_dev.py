from settings.common import *
from settings.dev import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.1.37']


#Ramon's local database
#
DATABASES = {
    "default": {
    "ENGINE": "django.db.backends.mysql",
    "NAME": "labelee_dev",
    "USER": "root",
    "PASSWORD": "",
    "HOST": "",
    "PORT": "",
    }
}

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.mysql",
#         "NAME": "labelee_dev",
#         "USER": "mnopi",
#         "PASSWORD": "1aragon1",
#         "HOST": "192.168.1.201",
#         "PORT": "",
#         }
# }

ADMINS = (
    ('Labeloncio', 'labelee_server@yahoo.com'),
)

MANAGERS = ADMINS
