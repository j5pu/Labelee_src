# -*- coding: utf-8 -*-
import datetime
from django.contrib.auth.decorators import login_required
from django.core.serializers import json
from django.http import HttpResponse

from django.shortcuts import render_to_response
from django.template import RequestContext
import simplejson
from dashboard.models import DisplayedRoutes
from map_editor.models import Floor

import settings

@login_required(login_url=settings.LOGIN_URL)
def index(request, enclosure_id):

    floors = Floor.objects.filter(enclosure_id=enclosure_id)
    floorImages = {}
    for floor in floors:
        floorImages[floor.name] = floor.imgB.url
    # translation.activate(request.session['django_language'])
    ctx = {
        'enclosure_id': enclosure_id,
        'floorImages': floorImages
    }
    return render_to_response('dashboard/index.html', ctx, context_instance=RequestContext(request))




def saveRouteRequest(request):
    json_data = request.body
    point_list = simplejson.loads(json_data)
    dispRoute = DisplayedRoutes()
    dispRoute.origin_id= point_list['originpoi']
    dispRoute.destination_id = point_list['destinationpoi']
    dispRoute.date = datetime.datetime.utcnow()
    dispRoute.save()
    return HttpResponse(simplejson.dumps('ok'))

