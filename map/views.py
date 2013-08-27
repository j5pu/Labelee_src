# -*- coding: utf-8 -*-
import datetime

from django.core.cache import cache
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.http import HttpResponseRedirect
# from touching_log import log

import json
import simplejson
from dashboard.models import Qr_shot
from log.logger import Logger
from map.twitterHelper import TwitterHelper
from map.utils_ import get_map_data
from map_editor.models import *
from django.db.models.query import Q
from utils.helpers import queryset_to_dict




def show_map(request, qr_type, enclosure_id, floor_id, poi_id):
    """
        map/[poi_type]/[enclosure_id]_[floor_id]_[poi_id]

        map/origin/1_25_91234
        map/dest/1_25_91234
    """
    enclosure = None
    ordered_categories = None
    cache_key = 'show_map_enclosure_' + enclosure_id
    cache_time = 43200
    cacheEnclosure =cache.get(cache_key)
    try:
        qrShot = Qr_shot()
        qrShot.point_id = poi_id
        qrShot.date = datetime.datetime.utcnow()
        qrShot.save()
    except Exception as ex:
        Logger.error(ex.message)
    poisByFloor = {}
    categories = {}
    colors = {}
    coupons = {}
    if not cacheEnclosure:
        points = Point.objects.select_related('label', 'label__category', 'floor', 'coupon') \
            .filter(~Q(label__category__name_en=FIXED_CATEGORIES.values()[0]),
                    floor__enclosure__id=enclosure_id) \
            .order_by('label__category__name', 'description', 'label__name')

        for point in points:
            poi = queryset_to_dict([point])[0]
            if point.floor.id in poisByFloor:
                poisByFloor[point.floor.id].append(poi)
            else:
                poisByFloor[point.floor.id] = [poi]
            poiIndex = poisByFloor[point.floor.id].index(poi)
            poisByFloor[point.floor.id][poiIndex]['label'] = queryset_to_dict([point.label])[0]
            poisByFloor[point.floor.id][poiIndex]['label']['category'] = queryset_to_dict([point.label.category])[0]

            if point.label.category.name_en not in FIXED_CATEGORIES.values():
                if point.label.category.name in categories:
                    categories[point.label.category.name].append(point)
                else:
                    colors[point.label.category.name] = point.label.category.color
                    categories[point.label.category.name] = [point]

            if point.coupon.name is not None:
                try:
                    if point.coupon.name != "":
                        coupons[point.id] = point.coupon.url
                except Exception as ex:
                    pass
            categories_list = []  # [{'name': 'toilets', 'items': [...]}, ...]
        for key, value in categories.iteritems():
            d = {
                'name': key,
                'items': value
            }
            categories_list.append(d)

        from operator import itemgetter

        ordered_categories = sorted(categories_list, key=itemgetter('name'))

        enclosure = Enclosure.objects.filter(id=enclosure_id)
        cacheEnclosure = {'poisByFloor': poisByFloor, 'ordered_categories': ordered_categories, 'colors': colors,
                                   'coupons': coupons, 'enclosure':enclosure}
        cache.set(cache_key,cacheEnclosure,cache_time)
    else:
        poisByFloor = cacheEnclosure['poisByFloor']
        ordered_categories = cacheEnclosure['ordered_categories']
        colors = cacheEnclosure['colors']
        coupons = cacheEnclosure['coupons']
        enclosure = cacheEnclosure['enclosure']

    marquee = []
    twitterhelper = TwitterHelper(enclosure[0].twitter_account)
    tweets = twitterhelper.getTweets()
    for tweet in tweets:
        marquee.append(tweet.text)
        break

    ctx = {
        'enclosure_id': enclosure_id,
        'floor_id': floor_id,
        'poi_id': poi_id,
        'categories': ordered_categories,
        'marquee': marquee,
        'qr_type': qr_type,
        'coupons': coupons,
        'colors': colors,
        'map_data': simplejson.dumps(get_map_data(qr_type, poi_id, poisByFloor))
    }
    return render_to_response('map/index.html', ctx, context_instance=RequestContext(request))


def your_position(request, label_id):
    """
    Muestra el mapa justo donde haces la foto al qr
    """
    labels = {
        '001': [0, 0],
        '002': [8, 8],
        '003': [25, 40],
        '004': [1, 1],
        '005': [20, 10]
    }

    ctx = {
        'label': labels[label_id],
        'block_size': 10,
        'map_img': '/static/img/map.jpg'
    }

    return render_to_response('map/your_position.html', ctx, context_instance=RequestContext(request))


def qr_code_redirect(request):
    if request.method == 'POST':
        qr = QR_Code.objects.get(id=request.POST['qr_code_id'])
        return HttpResponseRedirect('/map/origin/' + qr.code)

    return render_to_response('map/qr_code_form.html', context_instance=RequestContext(request))


def fuera(request, id, row, column):
    url = 'http://inmap.eu01.aws.af.cm/routesFrom.php?id=' + id + \
          '&row=' + row + '&column=' + column
    return HttpResponseRedirect(url)



