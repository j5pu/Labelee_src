# -*- coding: utf-8 -*-
import datetime

from django.core.cache import cache
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect, Http404
# from touching_log import log

import simplejson
from dashboard.models import Qr_shot
from log.logger import Logger
from map.twitterHelper import TwitterHelper
from map.utils_ import get_map_data, cache_show_map, saveQrShot
from map_editor.models import *
from django.db.models.query import Q
from utils.helpers import queryset_to_dict




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
        'map_data': simplejson.dumps(
            get_map_data(qr_type, poi_id, cached['poisByFloor'], enclosure_id)
        )
    }
    return render_to_response('map/index.html', ctx, context_instance=RequestContext(request))

def qr_code_redirect(request):
    if request.method == 'POST':
        qr = QR_Code.objects.get(point_id=request.POST['qr_code_id'])
        return HttpResponseRedirect('/map/origin/' + qr.code)

    return render_to_response('map/qr_code_form.html', context_instance=RequestContext(request))


def fuera(request, id, row, column):
    url = 'http://inmap.eu01.aws.af.cm/routesFrom.php?id=' + id + \
          '&row=' + row + '&column=' + column
    return HttpResponseRedirect(url)



