"""Testing settings."""

from .common import *

# Usaremos sqlite3 como BD para testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'test_db',					  # Or path to database file if using sqlite3.
        'USER': '',					  # Not used with sqlite3.
        'PASSWORD': '',				  # Not used with sqlite3.
        'HOST': '',					  # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',					  # Set to empty string for default. Not used with sqlite3.
    }
}

# Estas aplicaciones solo se usaran en entorno de tests..
INSTALLED_APPS += (
    'selenium',
    'django_nose',
)

# TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'
TEST_RUNNER = 'utils.tests.runner.MyTestRunner'

# NOSE_PLUGINS = [
#     'map_editor.tests.InitializeDBPlugin'
# ]
