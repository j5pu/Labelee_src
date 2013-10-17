from django.contrib.auth.models import Group
from django.test.simple import DjangoTestSuiteRunner


def initialize_db():
    """
    Crea los registros necesarios para comenzar el test
    """
    if len(Group.objects.all()) == 0:
        Group.objects.create(name='enclosure_owners')
        Group.objects.create(name='shop_owners')
    else:
        Group.objects.all().delete()


class MyTestRunner(DjangoTestSuiteRunner):
    def setup_databases(self, **kwargs):
        super(MyTestRunner, self).setup_databases()
        initialize_db()
    pass
