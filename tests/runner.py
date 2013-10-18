from django.contrib.auth.models import Group
from django_nose import NoseTestSuiteRunner
from splinter import Browser


def init_database():
    Group.objects.create(name='enclosure_owners')
    Group.objects.create(name='shop_owners')

global browser

# class MyTestRunner(DjangoTestSuiteRunner):
class MyTestRunner(NoseTestSuiteRunner):
    def setup_databases(self, **kwargs):
        o = super(MyTestRunner, self).setup_databases()
        init_database()
        return o

    def setup_test_environment(self, **kwargs):
        super(MyTestRunner, self).setup_test_environment()
        global browser
        browser = Browser('chrome')

    def teardown_test_environment(self, **kwargs):
        super(MyTestRunner, self).teardown_test_environment()
        global browser
        browser.quit()