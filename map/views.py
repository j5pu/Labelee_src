# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect, Http404
# from touching_log import log

import simplejson
from dashboard.utils import saveQrShot
from map.twitterHelper import TwitterHelper
from map.utils_ import get_map_data, cache_show_map, get_incompatible_map_data
from map_editor.models import *


def show_map(request, qr_type, enclosure_id, floor_id, poi_id):
    """
        map/[poi_type]/[enclosure_id]_[floor_id]_[poi_id]

        map/origin/1_25_91234
        map/dest/1_25_91234
    """
    if enclosure_id == None or floor_id == None or poi_id == None:
        raise Http404

    saveQrShot(poi_id)
    cached = cache_show_map(enclosure_id)

    # Check that the enclosure, floor and point exist
    if cached == {} or int(floor_id) not in cached['poisByFloor'] or \
        int(poi_id) not in [x['id'] for x in cached['poisByFloor'][int(floor_id)]]:

        raise Http404

    marquee = []
    twitterhelper = TwitterHelper(cached['enclosure'][0].twitter_account)
    tweets = twitterhelper.getTweets()
    for tweet in tweets:
        marquee.append(tweet.text)
        break

    map_data = get_map_data(qr_type, poi_id, cached['poisByFloor'],
                            enclosure_id, cached['coupons'], cached['point_site'])

    ctx = {
        'enclosure_id': enclosure_id,
        'floor_id': floor_id,
        'poi_id': poi_id,
        'categories': cached['ordered_categories'],
        'marquee': marquee,
        'qr_type': qr_type,
        'coupons': cached['coupons'],
        'colors': cached['colors'],
        'icons': cached['icons'],
        'map_data': simplejson.dumps(map_data),
        'logo': cached['enclosure'][0].logo,
        'site_floors': cached['site_floors']
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

#
# def exclude_non_important_categories(categories):
#
#     for category in categories:
#         if category['name'] in FIXED_CATEGORIES['hidden_on_side_menu'].values():
#             categories.remove(category)


def show_incompatible_map(request, enclosure_id):
    """
    Loads a simple map with a directory for incompatible devices.

        map/incompatible-devices/[enclosure_id]_[floor_id]_[poi_id]

        map/incompatible-devices/26
    """
    if enclosure_id == None or not enclosure_id.isdigit():
        raise Http404

    cached = cache_show_map(enclosure_id)

    # Check if the enclosure exists
    if cached == {}:
        raise Http404

    ctx = {
        'enclosure_id': enclosure_id,
        'enclosure_name': Enclosure.objects.get(pk=enclosure_id).name,
        'categories': cached['ordered_categories'],
        'map_data': simplejson.dumps(
            get_incompatible_map_data(cached['poisByFloor'], enclosure_id)
        )
    }
    return render_to_response('map/index_incompatible_devices.html', ctx, context_instance=RequestContext(request))


def qr_code_redirect(request):
    if request.method == 'POST':
        qr = QR_Code.objects.get(point_id=request.POST['qr_code_id'])
        return HttpResponseRedirect('/map/origin/' + qr.code)

    return render_to_response('map/qr_code_form.html', context_instance=RequestContext(request))

def show_map_by_id(request, id):
    qr = QR_Code.objects.get(point_id=id)
    return HttpResponseRedirect('/map/origin/' + qr.code)

def fuera(request, id, row, column):
    url = 'http://inmap.eu01.aws.af.cm/routesFrom.php?id=' + id + \
          '&row=' + row + '&column=' + column
    return HttpResponseRedirect(url)



