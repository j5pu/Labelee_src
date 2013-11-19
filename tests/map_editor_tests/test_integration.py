#
#  ESTA ES OTRA FORMA DE HACERLO PARECIDO A LETTUCE

# from django.test import TestCase
# from tests.factories import StaffFactory
# from tests.runner import SplinterTestCase
#
# # urls
# index_url = '/map-editor/'
# login_url = '/accounts/login/'
# logout_url = '/accounts/logout/'
#
# # templates
# index_template = 'map_editor/v2/index.html'
#
#
# class LoginTest(SplinterTestCase):
#     def tearDown(self):
#         self.browser.visit(self.live_server_url + logout_url)
#
#     def test_login_staff(self):
#         staff = StaffFactory()
#         self.browser.visit(self.live_server_url + index_url)
#         self.browser.fill('username', staff.username)
#         self.browser.fill('password', '1234')
#         self.browser.find_by_css('#login .btn').click()
#         assert self.browser.path == index_url
#         assert login_url not in self.browser.url
#
#     def test_login_unregistered(self):
#         self.browser.visit(self.live_server_url + index_url)
#         self.browser.fill('username', 'margarito')
#         self.browser.fill('password', '1234')
#         self.browser.find_by_css('#login .btn').click()
#         assert login_url in self.browser.url
