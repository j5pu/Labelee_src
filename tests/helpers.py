from lettuce import world

# urls
URLS = {
    'map_editor': {
        'index': '/map-editor/',
        'login': '/accounts/login/',
        'logout': '/accounts/logout/',
        'dashboard': '/dashboard/',
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