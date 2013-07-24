# -*- coding: utf-8 -*-


from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.http import HttpResponseRedirect
# from touching_log import log

import json
from map.twitterHelper import TwitterHelper
from map_editor.models import *
from django.db.models.query import Q


def show_map(request, qr_type, enclosure_id, floor_id, poi_id):
    """
        map/[poi_type]/[enclosure_id]_[floor_id]_[poi_id]

        map/origin/1_25_91234
        map/dest/1_25_91234
    """
    enclosure = Enclosure.objects.filter(id=enclosure_id)
    categories = {}
    coupons = {}
    points = Point.objects \
        .filter(~Q(label__category__name_en__in=FIXED_CATEGORIES.values()),
                floor__enclosure__id=enclosure_id) \
        .order_by('label__category__name', 'label__name')

    for point in points:
        if point.label.category.name_en not in FIXED_CATEGORIES.values():
            if point.label.category.name in categories:
                categories[point.label.category.name].append(point)
            else:
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
        'coupons': coupons
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


def fuera(request, id, row, column):
    url = 'http://inmap.eu01.aws.af.cm/routesFrom.php?id=' + id + \
          '&row=' + row + '&column=' + column
    return HttpResponseRedirect(url)




