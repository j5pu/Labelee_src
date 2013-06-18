# -*- coding: utf-8 -*-
from django.core import serializers

from django.http import HttpResponse
from django.db.models import Q

import simplejson
from map_editor.api.resources import PointResource
from map_editor.models import Point, Label, Floor, QR_Code
from django.contrib.auth.models import User


def create_from_list(request):
    """
    A partir de una lista se crean tantos points como ésta contenga
        /api-2/point/create-from-list

    point_list = [
        {
            col: 2,
            grid: "/api/v1/grid/17/",
            label: "/api/v1/object/2/",
            row: 16,
            ...
            qr: true,
        },..
    ]
    """
    json_data = request.body
    point_list = simplejson.loads(json_data)
    # pr = PointResource()

    for point in point_list:
        # bundle = pr.build_bundle(data=point, request=request)
        # pr.obj_create(bundle)
        point = Point(
            description=point['description'],
            row=point['row'],
            col=point['col'],
            label=Label.objects.get(id=point['label']),
            floor=Floor.objects.get(id=point['floor'])
        )
        point.save()

    return HttpResponse(simplejson.dumps('ok'))


def update_from_list(request):
    """
    Actualizamos cada punto de la lista
        /api-2/point/update-from-list

    point_list = [
        {
            id: 2225656,
            description: 'vips de la esquina',
            qr: true,
        },..
    ]
    """
    json_data = request.body
    point_list = simplejson.loads(json_data)

    for point in point_list:

        point_obj = Point.objects.get(id=point['id'])

        # Si QR está checked y no hay un QR todavía para el punto
        if point['qr'] and not hasattr(point_obj, 'qr_code'):
            qr_code = str(point_obj.floor.enclosure.id) + '_' + str(point_obj.floor.id) + '_' + str(point_obj.id)
            qr = QR_Code(code=qr_code, point=point_obj)
            qr.save()
        # Si QR unchecked y hay QR en BD..
        elif not point['qr'] and hasattr(point_obj, 'qr_code'):
            point_obj.qr_code.delete()

        point_obj.description = point['description']
        point_obj.save()

    return HttpResponse(simplejson.dumps('ok'))


def delete_from_list(request):
    user = User.objects.get(username='mnopi')
    #create_api_key(user)
    request.user = user
    json_data = request.body
    point_list = simplejson.loads(json_data)

    for point in point_list:
        p = Point.objects.get(id=point['id'] if isinstance(point, dict) else point)
        p.delete()

    return HttpResponse(simplejson.dumps('ok'))


def readOnlyPois(request, floor_id):
#     col: 1
# description: "Parquing_Escalera_1"
# floor: 15
# label: 8
# row: 17
    pois = Point.objects.filter(
        floor = floor_id
    ).exclude(
        label__category = 1
    ).exclude(
        label__category__name = 'Intermedias'
    ).exclude(
        label__category__name = 'Parquing'
    )

    json_pois = []

    for poi in pois:
        categ = poi.label.category
        category_json = {
            'id': categ.id,
            'color': categ.color,
            'img': categ.img.name,
            'name': categ.name,
        }
        label = poi.label
        label_json = {
            'id': label.id,
            'category': category_json,
            'img': label.img.name,
            'name': label.name,
        }
        json_poi = {
            'id': poi.id,
            'row': poi.row,
            'col': poi.col,
            'description': poi.description,
            'label': label_json,
            'floor': poi.floor.id
        }
        json_pois.append(json_poi)



    # return HttpResponse(simplejson.dumps(pois), mimetype='application/json')
    return HttpResponse(simplejson.dumps(json_pois), mimetype='application/json')

