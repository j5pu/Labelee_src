# -*- coding: utf-8 -*-
from django.contrib.auth.models import Group

from django.test import TestCase, Client
from map_editor.factories import *
from utils.testing_actions import logout, log_staff, initialize_database


#
# Las clases se van ejecutando por orden alfabético.
# Por cada test (def test_..) la base de datos retorna al estado anterior (rollback)

class LoginTest(TestCase):
    def test_logout(self):
        resp = logout()
        self.assertEqual(resp.status_code, 302)

    def test_login_for_staff(self):
        resp = log_staff()
        self.assertEqual(resp.status_code, 200)


class ModelTest(TestCase):
    def test_staff_creation(self):
        staff = StaffFactory()
        self.assertNotEqual(staff.id, None)
        self.assertTrue(staff.is_staff)

    def test_enclosure_owner_creation(self):
        enclosure_owner = EnclosureOwnerFactory()
        self.assertNotEqual(enclosure_owner.id, None)
        self.assertEqual(len(enclosure_owner.groups.all()), 1)
        self.assertEqual(enclosure_owner.groups.all()[0].id, 1)

    def test_site_owner_creation(self):
        site_owner = SiteOwnerFactory()
        self.assertNotEqual(site_owner.id, None)
        self.assertEqual(len(site_owner.groups.all()), 1)
        self.assertEqual(site_owner.groups.all()[0].id, 2)

    def test_enclosure_creation(self):
        enclosure = EnclosureFactory()
        self.assertNotEqual(enclosure.id, None)
        self.assertNotEqual(enclosure.owner.id, None)


class ViewTest(TestCase):

    url = '/accounts/login/?next=/map-editor/'

    def test_csrf_protected(self):
        staff = StaffFactory()
        csrf_client = Client(enforce_csrf_checks=True)
        response = csrf_client.post(self.url,\
                                    {'username':staff.username,'password':'1234'})
        self.assertEqual(response.status_code, 403)

    def test_index_for_staff(self):
        staff = StaffFactory()
        correct_login = self.client.login(username=staff.username,password='1234')
        self.assertTrue(correct_login)
        # la respuesta tiene que dar una redirección a /map-editor/
        response = self.client.post('/accounts/login/?next=/map-editor/',\
                         {'username':staff.username,'password':'1234'})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.request['QUERY_STRING'], 'next=/map-editor/')

    def test_index_for_enclosure_owner(self):
        pass

    def test_index_for_site_owner(self):
        pass


class InitDatabaseTest(TestCase):
    @classmethod
    def setUpClass(cls):
        initialize_database()

    def test_initial_user_groups(self):
        self.assertEqual(len(Group.objects.all()), 2)

