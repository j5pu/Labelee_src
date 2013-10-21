from lettuce import world

# urls
world.urls = {
    'index': '/map-editor/',
    'login': '/accounts/login/',
    'logout': '/accounts/logout/'
}

# templates
world.templates = {
    'index': 'map_editor/v2/index.html'
}


# @world.absorb
# def my_project_wide_function():
# # do something
#
# world.my_project_wide_function()