from lettuce.django import django_url
from map_editor.models import Enclosure
from tests.factories import StaffFactory, EnclosureFactory
from tests.helpers import URLS
from tests.runner import SplinterTestCase


class TestLogin (SplinterTestCase):
    def test_loggin_staff_user(self):
        # given
        staff = StaffFactory(username='mnopi', password='1234')
        assert staff.id is not None
        enclosures = EnclosureFactory.create_batch(2)
        assert len(Enclosure.objects.all()) == 2
        # when
        self.browser.visit(django_url(URLS['map_editor']['index']))
        self.browser.fill('username', 'mnopi')
        self.browser.fill('password', '1234')
        self.browser.find_by_css('#login .btn').click()
        # then
        assert len(self.browser.find_by_css('td.enclosure')) == 2
        self.browser.visit(django_url(URLS['map_editor']['logout']))

