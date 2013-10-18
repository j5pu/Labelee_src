# -*- coding: utf-8 -*-

from django.test import Client, TestCase
from tests.factories import *

# urls
from tests.my_test_case import MyTestCase

index_url = '/map-editor/'
login_form_post_url = '/accounts/login/?next=' + index_url

# templates
index_template = 'map_editor/v2/index.html'


def login(user, testCase):
    "Loguea un usuario, devolviendo la respuesta sobre la petición contra la página de inicio"
    correct_login = testCase.client.login(username=user.username,password='1234')
    testCase.assertTrue(correct_login)
    login_response = testCase.client.post(login_form_post_url, \
                                {'username':user.username,'password':'1234'})
    testCase.assertEqual(login_response.status_code, 302)
    testCase.assertEqual(login_response.request['QUERY_STRING'], 'next=' + index_url)
    redirected_response = testCase.client.get('/map-editor/')
    return redirected_response


def logout(testCase):
    logout_response = testCase.client.get('/accounts/logout/')
    testCase.assertEqual(logout_response.status_code, 302)
    # si ahora intentamos acceder a /map-editor/ se nos redirigirá al login
    resp = testCase.client.get('/map-editor/')
    testCase.assertEqual(resp.status_code, 302)
    is_redirected_to_login = '/accounts/login/' in resp._headers['location'][1]
    testCase.assertTrue(is_redirected_to_login)


class LoginTest(TestCase):
    pass


class IndexViewTest(MyTestCase):
    "Comprueba los accesos al index de map_editor"

    def tearDown(self):
        "Hacemos logout al final de cada test"


    def test_staff(self):
        user = StaffFactory()
        response = login(user, self)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.request['QUERY_STRING'], '')
        # busca si la vista devuelta contiene la plantilla para el index
        t = [x for x in response.templates if x.name == index_template]
        self.assertTrue(t)

    def test_enclosure_owner(self):
        # Para dueño con enclosure se redirige a dashboard
        user_with_enclosure = EnclosureFactory().owner
        resp = login(user_with_enclosure, self)
        is_dashboard = 'dashboard' in resp._headers['location'][1]
        self.assertTrue(is_dashboard)
        pass
    def test_site_owner(self):
        user = SiteOwnerFactory()
        response = login(user, self)
        pass

    def test_invalid_users(self):
        # user = InvalidUserFactory()
        # # Para dueño sin enclosure se hace logout
        # resp = login(user, self)
        # is_logged_out = '/accounts/logout/' in resp._headers['location'][1]
        # self.assertTrue(is_logged_out)
        pass
