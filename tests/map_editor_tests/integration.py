from django.test import TestCase
from tests.runner import browser

# urls
index_url = '/map-editor/'
login_form_post_url = '/accounts/login/?next=' + index_url

# templates
index_template = 'map_editor/v2/index.html'


class LoginTest(TestCase):
    def test_login_staff(self):
        browser.visit('http://google.com')
        browser.fill('q', 'splinter - python acceptance testing for web applications')
        browser.find_by_name('btnG').click()

        if browser.is_text_present('splinter.cobrateam.info'):
            print "Yes, the official website was found!"
        else:
            print "No, it wasn't found... We need to improve our SEO techniques"