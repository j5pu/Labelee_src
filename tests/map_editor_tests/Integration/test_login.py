from lettuce.django import django_url
from map_editor.models import Enclosure
from tests.factories import StaffFactory, EnclosureFactory, EnclosureOwnerFactory
from tests.helpers import URLS
from tests.runner import SplinterTestCase


def logout(browser):
    browser.visit(django_url(URLS['map_editor']['logout']))

def login(browser,username,password):
    browser.visit(URLS['map_editor']['index'])
    browser.fill('username', username)
    browser.fill('password', password)
    browser.find_by_css('#login .btn').click()

class TestLogin (SplinterTestCase):


    def test_loggin_staff_user(self):
        # given
        staff = StaffFactory(username='mnopi', password='1234')
        assert staff.id is not None
        enclosures = EnclosureFactory.create_batch(2)
        assert len(Enclosure.objects.all()) == 2
        # when
        login(self.browser, 'mnopi', '1234')
        # then
        assert len(self.browser.find_by_css('td.enclosure')) == 2
        logout(self.browser)

    def test_loggin_enclosure_owner_with_enclosure(self):
        # given
        user = EnclosureOwnerFactory(username='mnopi2', password='2345')
        password = '2345'
        enclosures = EnclosureFactory.create_batch(2, owner=user)
        # when
        login(self.browser, 'mnopi2', '2345')
        # then
        #   es redirigido al dashboard de su primer enclosure
        assert '/dashboard/' + str(enclosures[0].id) in self.browser.url
        logout(self.browser)

    def test_loggin_enclosure_owner_without_enclosure(self):
        # given
        user = EnclosureOwnerFactory(username='mnopi3', password='2345')
        password = '2345'
        # when
        login(self.browser, 'mnopi3', '2345')
        # then
        assert '/accounts/login/' in self.browser.url