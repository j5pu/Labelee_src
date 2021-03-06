# -*- coding: utf-8 -*-

# Django settings for a generic project.
import os
from django.utils.translation import ugettext
from databases import *

PROJECT_ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

DEBUG = True
TEMPLATE_DEBUG = DEBUG

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Madrid'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'es'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = os.path.join(PROJECT_ROOT, 'static')

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

PARTIALS_URL = STATIC_URL + 'partials/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_ROOT, 'static-media'),

    os.path.join(PROJECT_ROOT, 'sandbox'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '0tc6gk^8x=lfzyh0&amp;%1u^7tu0wb(aho7o6+6!*yr!=#c#b4c$@'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.gzip.GZipMiddleware',
    'pipeline.middleware.MinifyHTMLMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    #
    # Si queremos desactivar la proteccion csrf comentamos la linea de abajo..
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'utils.force_default_middleware.ForceDefaultLanguageMiddleware',
    'django.middleware.locale.LocaleMiddleware',

    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'wsgi.application'


TEMPLATE_DIRS = (
    os.path.join(PROJECT_ROOT, "templates"),
    # guardamos en la constante TEMPLATE_DIRS la ruta absoluta de 'django_web/templates'
    os.path.join(PROJECT_ROOT, 'static-media/partials'),

    # SANDBOX
    os.path.join(PROJECT_ROOT, 'sandbox'),
)


INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    'django.contrib.admindocs',
    'tastypie',
    'map_editor',
    'modeltranslation',
    'log',
    'dashboard',
    'analytics',
    'coupon_manager',
    'pipeline',
    'memcache_status',
    'django_jenkins'
)

PROJECT_APPS = (
    'route',
    'map',

)
INSTALLED_APPS += PROJECT_APPS

JENKINS_TASKS = (
        'django_jenkins.tasks.with_coverage',
        'django_jenkins.tasks.django_tests',
        'django_jenkins.tasks.run_pep8',
        'django_jenkins.tasks.run_pyflakes',
    )

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'filters': {
#         'require_debug_false': {
#             '()': 'django.utils.log.RequireDebugFalse'
#         }
#     },
#     'handlers': {
#         'mail_admins': {
#             'level': 'ERROR',
#             'filters': ['require_debug_false'],
#             'class': 'django.utils.log.AdminEmailHandler'
#         }
#     },
#     'loggers': {
#         'django.request': {
#             'handlers': ['mail_admins'],
#             'level': 'ERROR',
#             'propagate': True,
#         },
#     }
# }


API_LIMIT_PER_PAGE = 5000

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


EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'alvaro.gutierrez@mnopi.com'
EMAIL_HOST_PASSWORD = '1aragon1'
EMAIL_PORT = 587
from utils.constants import *


LANGUAGES = (
    ('en', 'English'),
    ('es', 'Spanish'),
)

LOCALE_PATHS = (
    os.path.join(PROJECT_ROOT, 'locale'),
)

TEMPLATE_CONTEXT_PROCESSORS = {
    'django.core.context_processors.static',
    'django.core.context_processors.media',
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.i18n',
}


MODELTRANSLATION_AUTO_POPULATE = True
MODELTRANSLATION_FALLBACK_LANGUAGES = ('en', 'es')

LOGIN_URL = '/accounts/login/'

AUTHENTICATION_BACKENDS = (
    'auth_backends.CustomUserModelBackend',
)

from pipeline_settings import *


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}
