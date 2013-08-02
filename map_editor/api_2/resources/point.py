# -*- coding: utf-8 -*-
from django.core import serializers
from django.core.serializers import serialize

from django.http import HttpResponse
from django.db.models import Q

import simplejson
from map_editor.api.resources import PointResource
from map_editor.models import Point, Label, Floor, QR_Code, Enclosure
from django.contrib.auth.models import User
from utils.helpers import tx_serialized_json_list


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
        point_obj = Point(
            row=point['row'],
            col=point['col'],
            label=Label.objects.get(id=point['label']),
            floor=Floor.objects.get(id=point['floor'])
        )
        if 'description' in point:
            point_obj.description = point['description']
        point_obj.save()

        # Si la categoría de la etiqueta para el punto no es bloqueante ni arista
        label_category = Label.objects.get(id=point['label']).category
        if label_category.qr_can_be_assigned():
            point_obj.assign_qr()

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
            point_obj.assign_qr()
        # Si QR unchecked y hay QR en BD..
        elif not point['qr'] and hasattr(point_obj, 'qr_code'):
            point_obj.qr_code.delete()

        if 'description' in point:
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
    """
       /api-2/point/pois/17
    """
    pois = Point.objects.filter(
        floor = floor_id
    ).exclude(
        label__category = 1
    ).exclude(
        label__category__name_es = 'Intermedias'
    ).exclude(
        label__category__name_es = 'Parquing'
    )
    # por hacer: las aristas deben llevar QR
    # ).exclude(
    #     qr_code = None
    # )

    json_pois = serialize('json', pois)
    tx_pois = tx_serialized_json_list(json_pois)

    for i in range(len(pois)):
        label = serialize('json', [pois[i].label])
        tx_label = tx_serialized_json_list(label)[0]
        tx_pois[i]['label'] = tx_label
        categ = serialize('json', [pois[i].label.category])
        tx_categ = tx_serialized_json_list(categ)[0]
        tx_pois[i]['label']['category'] = tx_categ

    return HttpResponse(simplejson.dumps(tx_pois), mimetype='application/json')


def countPoisFromEnclosure(request, enclosure_id):
    """
        .../pois/enclosure/[enclosure_id]/count
    """
    poi_count = Enclosure.objects.get(id=enclosure_id).count_pois()
    return HttpResponse(poi_count)

