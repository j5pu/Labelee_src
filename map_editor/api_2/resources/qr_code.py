# -*- coding: utf-8 -*-

from django.db.models import Sum
from django.http import HttpResponse
import simplejson

from map_editor.api.resources import LabelResource
from map_editor.models import Label, LabelCategory


def read_from_floor(request, floor_id):
    """
    /api-2/qr-code/floor/1

    xej para obtener la lista de QRs que pertenecen al floor con id=1:
        /api-2/qr-code/points__floor__id=1
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
    labels = Label.objects.filter(points__floor__id=floor_id).values().annotate(total=Sum('id'))

    resp = {}
    # resp = {
    #	'api/v1/label/1': {
    #		category_id: 1
    #		category_name: builder
    #		category_uri: api/v1/label-category/1
    #		id: 1
    #		img: "img/labels/builders/wall.png"
    #		name: "wall"
    #		total: 6
    #		resource_uri: api/v1/label/1
    # 	},
    #   ...
    # }
    for label in labels:
        label_category = LabelCategory.objects.get(id=label['category_id'])
        label['img'] = '/media/' + label['img']
        label['category_name'] = label_category.name
        label['category_uri'] = '/api/v1/label-category/' + str(label_category.id)
        resource_uri = '/api/v1/label/' + str(label['id']) + '/'
        label['resource_uri'] = resource_uri

        resp[resource_uri] = label

    return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
