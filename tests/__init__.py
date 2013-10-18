# -*- coding: utf-8 -*-

from django.test import TestCase
from django.contrib.auth.models import Group

def initialize_db():
    """
    Crea los registros necesarios para comenzar el test
    """
    if len(Group.objects.all()) == 0:
        Group.objects.create(name='enclosure_owners')
        Group.objects.create(name='shop_owners')
    else:
        Group.objects.all().delete()


# class InitDBTest(TestCase):
#     @classmethod
#     def setUpClass(cls):
#         """
#         Hook method for setting up class fixture before running tests in the class.
#
#         Cada vez que se ejecuta un test (def test_...) la BD vuelve al estado anterior
#         a ese test (rollback).
#         Queremos que inicialmente la BD no esté vacía, sino que contenga los registros creados
#         en initialize_deb().
#         De esta manera conseguimos que después de ejecutarse 'test_initial_user_groups',
#         se haga rollback hasta el comienzo del test, y así no limpie por completo la BD,
#         conservando por tanto los grupos de usuario y futuros registros que queramos grabar
#         inicialmente.
#
#         Otra opción, mucho más lenta, es usar TransactionTestCase en lugar de TestCase,
#         reiniciando toda la BD por cada test, por lo que cada vez que creemos los registros
#         iniciales por cada test éstos no tendrán IDs diferentes.
#         """
#         initialize_db()
#
#     def test_initial_user_groups(self):
#         self.assertEqual(len(Group.objects.all()), 2)


#
# USANDO NOSE NO ES NECESARIO INDICAR ESTO, YA QUE AUTODESCUBRE TODOS LOS TESTS (AUTODISCOVERY)
# from tests.map_editor. import *
# from .test_views import *