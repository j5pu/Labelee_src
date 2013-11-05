from map_editor.models import Enclosure
from tests.factories import StaffFactory, EnclosureFactory, EnclosureOwnerFactory
from tests.helpers import URLS
from tests.runner import SplinterTestCase

def login(browser,username,password):
    browser.visit(URLS['map_editor']['index'])
    browser.fill('username', username)
    browser.fill('password', password)
    browser.find_by_css('#login .btn').click()

class TestLogout (SplinterTestCase):

    def test_logout_any_user(self):
        # given
        staff = StaffFactory(username='mnopi', password='1234')
        staff2 = StaffFactory(username='mnopi2', password='1234')
        enclosures = EnclosureFactory.create_batch(4)
        login(self.browser, 'mnopi', '1234')
        # when
        self.browser.find_by_css('#logout .icon-signout').click()
        # then
        assert '/accounts/login/' in self.browser.url
        # when
        login(self.browser, 'mnopi2', '1234')
        self.browser.find_by_css('#logout .icon-signout').click()
        # then
        assert '/accounts/login/' in self.browser.url
