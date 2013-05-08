# -*- coding: utf8 -*-

from django.db.models import Sum
from django.http import HttpResponse
import simplejson

from map_editor.api.resources import LabelResource
from map_editor.models import Label, LabelCategory


def read_grouped(request):
	"""
	/api-2/object/read-grouped
	
	->
	[
		
	]
	"""
	label_list = LabelResource().get_list(request)
	return HttpResponse(label_list, content_type="application/json")
	

def read_from_grid(request, grid_id):
	"""
	/api-2/object/grid/1
	
	xej para obtener la lista de objetos que pertenecen al grid con id=1: 
		/api-2/object/points__grid__id=1
	"""
	# ["point", "object", ..] --> ["object", "point", ..]
	# related_resources = related_resources.split("/")[:-1].reverse()
		
	#arr = filter_query.split('=')
	#kwargs = {
	#	arr[0] : arr[1]
	#}
		
	# labels = [
	# 	{
	#		"total": 6, 
	#		"category_id": 1, 
	#		"id": 1, 
	#		"img": "img/objects/builders/wall.png", 
	#		"name": "wall"
	#	},
	#	...
	# ]
	labels = Label.objects.filter(points__grid__id=grid_id).values().annotate(total=Sum('id'))
		
	ret = {}
	# ret = {
	#	'api/v1/object/1': {
	#		category_id: 1
	#		category_name: builder
	#		id: 1
	#		img: "img/objects/builders/wall.png"
	#		name: "wall"
	#		total: 6
	#		resource_uri: api/v1/object/1
	#		from_db: True
	# 	}
	# }
	for obj in labels:
		obj['img'] = '/media/' + obj['img']
		obj['category_name'] = LabelCategory.objects.get(id=obj['category_id']).name
		resource_uri = '/api/v1/object/' + str(obj['id']) + '/'
		obj['resource_uri'] = resource_uri
		obj['from_db'] = True
		
		ret[resource_uri] = obj
				
	return HttpResponse(simplejson.dumps(ret));
