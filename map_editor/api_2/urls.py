from django.conf.urls.defaults import *


# /api-2/..

urlpatterns = patterns('map_editor.api_2',

	# /api-2/map/16/img
	url(r'^(?P<resource>.*)/(?P<id>\d*)/img$', 'services.views.img'),

    #FLOOR
	url(r'^floor/(?P<floor_id>.*)/render-grid$', 'resources.floor.render_grid'),


	# LABEL
	url(r'^label/floor/(?P<floor_id>\d+)$', 'resources.label.read_from_floor'),
	url(r'^label/read-grouped', 'resources.label.read_grouped'),

    # LABEL CATEGORY
	url(r'^label-category/valid/(?P<enclosure_id>\d+)$', 'resources.label_category.read_only_valid_categories'),


	# POINT
	url(r'^point/create-from-list', 'resources.point.create_from_list'),
	url(r'^point/update-from-list', 'resources.point.update_from_list'),
	url(r'^point/delete-from-list', 'resources.point.delete_from_list'),
	url(r'^point/pois/(?P<floor_id>\d+)$', 'resources.point.readOnlyPois'),

    url(r'^url_to_qr/(?P<url>.+)', 'resources.qr_code.generate_qr_from_url'),

	# 	/api-2/grid/1/point/object/*/*..
		#'(?P<related_resources>(?:\w+/)+)$', 'services.views.get_related'),
	# http://stackoverflow.com/questions/2360179/django-urls-how-to-pass-a-list-of-items-via-clean-urls/2360415#2360415

)