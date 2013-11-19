import os
from lettuce import world

BASE_URL = 'http://' + os.environ['DJANGO_LIVE_TEST_SERVER_ADDRESS']
# urls
URLS = {
    'map_editor': {
        'index': BASE_URL + '/map-editor/',
        'login': BASE_URL + '/accounts/login/',
        'logout': BASE_URL + '/accounts/logout/',
        'dashboard': BASE_URL + '/dashboard/',
    }
}

# templates
TEMPLATES = {
    'map_editor': {
        'index': 'map_editor/v2/index.html',
    }
}


# @world.absorb
# def my_project_wide_function():
# # do something
#
# world.my_project_wide_function()

def response_is_a_redirection():
    return world.browser.response.status == 302