# -*- coding: utf-8 -*-

from django.test import TestCase, Client
# from django.test import Client
# csrf_client = Client(enforce_csrf_checks=True)
from map_editor.models import CustomUser, Enclosure


class ActionHelper:
    """
    Nos servirá para realizar acciones comunes en los tests (loguearse, etc)
    """
    @staticmethod
    def log_staff():
        post_data = {
            'username': 'mnopi',
            'password': '1aragon1'
        }
        return Client().post('/accounts/login/', post_data)

    @staticmethod
    def logout():
        return Client().get('/accounts/logout/')


class LoginTest(TestCase):
    def test_logout(self):
        resp = ActionHelper.logout()
        self.assertEqual(resp.status_code, 302)

    def test_login_for_staff(self):
        resp = ActionHelper.log_staff()
        self.assertEqual(resp.status_code, 200)


class ModelTest(TestCase):
    def create_user(self, username="mnopi", password="1aragon1"):
        return CustomUser.objects.create(username=username, password=password)

    def test_user_creation(self):
        user = self.create_user()
        self.assertTrue(isinstance(user, CustomUser))
        self.assertEqual(user.__unicode__(), user.username)

    def create_enclosure(self, name="enclosure_1"):
        owner = self.create_user()
        return Enclosure.objects.create(name=name, owner=owner)

    def test_enclosure_creation(self):
        enclosure = self.create_enclosure()
        self.assertTrue(isinstance(enclosure, Enclosure))
        self.assertEqual(enclosure.__unicode__(), enclosure.name)



