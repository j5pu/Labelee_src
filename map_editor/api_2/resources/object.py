# -*- coding: utf8 -*-

from django.shortcuts import render_to_response, get_object_or_404
from django.template.loader import get_template
from django.template import Context
from django.template import RequestContext
from django.http import HttpResponse
from django.http import HttpRequest
from django.http import HttpResponseRedirect

from django.core.files.base import ContentFile


from django_web.utils.helpers import responseJSON

import json
import simplejson

from map_editor.models import Object
from django.db.models import Sum

from map_editor.forms import *

from django_web.utils import *



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
		
	# Object.objects.filter(points__grid__id=4).values('name').annotate(total=Sum('name'))
	# objs = [
	# 	{
	#		"total": 6, 
	#		"category_id": 1, 
	#		"id": 1, 
	#		"img": "img/objects/builders/wall.png", 
	#		"name": "wall"
	#	},
	#	...
	# ]
	objs = Object.objects.filter(points__grid__id=grid_id).values().annotate(total=Sum('id'))
		
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
	for obj in objs:
		obj['img'] = '/media/' + obj['img']
		obj['category_name'] = ObjectCategory.objects.get(id=obj['category_id']).name
		resource_uri = '/api/v1/object/' + str(obj['id']) + '/'
		obj['resource_uri'] = resource_uri
		obj['from_db'] = True
		
		ret[resource_uri] = obj
				
	return HttpResponse(simplejson.dumps(ret));
