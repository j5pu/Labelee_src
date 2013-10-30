# terrain.py
from lettuce import before, after, world
from splinter.browser import Browser
from django.test.utils import setup_test_environment, teardown_test_environment
from django.core.management import call_command
from django.db import connection
from django.conf import settings
from tests.runner import init_database


@before.harvest
def initial_setup(server):
    call_command('syncdb', interactive=False, verbosity=0)
    call_command('flush', interactive=False, verbosity=0)
    try:
        if 'map_editor_customuser' not in connection.introspection.table_names():
            call_command('migrate', interactive=False, verbosity=0)
    except:
        pass
    # call_command('loaddata', 'all', verbosity=0)
    setup_test_environment()
    world.browser = Browser('chrome')

@after.harvest
def cleanup(server):
    connection.creation.destroy_test_db(settings.DATABASES['default']['NAME'])
    teardown_test_environment()
    world.browser.quit()

@before.each_scenario
def reset_data(scenario):
    # Clean up django.
    call_command('flush', interactive=False, verbosity=0)
    init_database()
    # call_command('loaddata', 'all', verbosity=0)