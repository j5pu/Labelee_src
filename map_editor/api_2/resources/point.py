# -*- coding: utf8 -*-

from django.http import HttpResponse
import simplejson
from map_editor.api.resources import PointResource
from map_editor.models import Point, Label, Floor
from django.contrib.auth.models import User


def create_from_list(request):
    """
    A partir de una lista se crean tantos points como ésta contenga
        /api-2/point/create-from-list

    point_list = [
        {
            col: 2
            grid: "/api/v1/grid/17/"
            object: "/api/v1/object/2/"
            row: 16
        },..
    ]
    """
    user = User.objects.get(username='mnopi')
    #create_api_key(user)
    request.user = user
    json_data = request.body
    point_list = simplejson.loads(json_data)
    # pr = PointResource()

    for point in point_list:
        # bundle = pr.build_bundle(data=point, request=request)
        # pr.obj_create(bundle)
        point = Point(
            row=point['row'],
            col=point['col'],
            label=Label.objects.get(id=point['label']),
            floor=Floor.objects.get(id=point['floor'])
        )
        point.save()

    return HttpResponse(simplejson.dumps('ok'))


def delete_from_list(request):
    user = User.objects.get(username='mnopi')
    #create_api_key(user)
    request.user = user
    json_data = request.body
    point_list = simplejson.loads(json_data)

    for point in point_list:
        p = Point.objects.get(id=point)
        p.delete()

    return HttpResponse(simplejson.dumps('ok'))
	
