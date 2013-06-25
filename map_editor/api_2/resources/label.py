# -*- coding: utf-8 -*-

from django.db.models import Sum
from django.http import HttpResponse
import simplejson

from map_editor.api.resources import LabelResource
from map_editor.models import Label, LabelCategory


def read_grouped(request):
    """
    /api-2/label/read-grouped
    """
    label_list = LabelResource().get_list(request)
    return HttpResponse(label_list, content_type="application/json")


def read_from_floor(request, floor_id):
    """
    /api-2/label/floor/1

    """
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

        label['img'] = '/media/' + label['img'] if label['img'] else None
        label['category'] = {
            'id': label_category.id,
            'name': label_category.name,
            'name_es': label_category.name_es,
            'name_en': label_category.name_en,
            'color': label_category.color,
            'img': label_category.img.name,
            'resource_uri': '/api/v1/label-category/' + str(label_category.id)
        }
        resource_uri = '/api/v1/label/' + str(label['id']) + '/'
        label['resource_uri'] = resource_uri

        resp[resource_uri] = label

    return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
