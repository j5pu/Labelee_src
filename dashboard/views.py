# -*- coding: utf-8 -*-
import datetime
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.core.context_processors import csrf
from django.http import HttpResponse, HttpResponseRedirect

from django.shortcuts import render_to_response
from django.template import RequestContext
import simplejson
from dashboard.models import DisplayedRoutes
from dashboard.utils import *
from map_editor.models import Floor, Enclosure
from route.services import getHeatMapSteps
# from utils.constants import USER_GROUPS


@login_required(login_url=settings.LOGIN_URL)
def index(request, enclosure_id):
    # Comprobamos que somos el dueño
    user_is_owner = len(request.user.enclosures.filter(id=enclosure_id)) != 0
    can_access = request.user.is_staff or (request.user.is_in_group(1) and user_is_owner)

    if can_access:
        allPoints = getHeatMapSteps(enclosure_id)
        enclosure = Enclosure.objects.get(id=enclosure_id)
        floors = Floor.objects.filter(enclosure_id=enclosure_id)
        floorsDict = {}
        for floor in floors:
            floorsDict[floor.name] = floor
            # floorsDict.activate(request.session['django_language'])
        ctx = {
            'enclosure_id': enclosure_id,
            'floorsDict': floorsDict,
            'currentSteps': allPoints,
            'enclosureName' : enclosure.name,
            'scansByCategory' : simplejson.dumps(getScansByCategory(enclosure_id)),
            'routesByCategory' : simplejson.dumps(getRoutesByCategory(enclosure_id)),
            'topScansByPoi' : simplejson.dumps(getTopScansByPoi(enclosure_id)),
            'topRoutesByPoi' : simplejson.dumps(getTopRoutesByPoi(enclosure_id)),
        }
        template = 'dashboard/index.html'

        return render_to_response(template, ctx, context_instance=RequestContext(request))

    # Si es un dueño de una tienda se le redirigirá a su admin de cupones
    if request.user.is_in_group(2):
        return HttpResponseRedirect('/coupon/')

    if not request.user.is_valid:
        return HttpResponseRedirect('/accounts/logout/')
    else:
        return HttpResponse('Forbidden')



def saveRouteRequest(request):
    json_data = request.body
    point_list = simplejson.loads(json_data)
    dispRoute = DisplayedRoutes()
    dispRoute.origin_id = point_list['originpoi']
    dispRoute.destination_id = point_list['destinationpoi']
    dispRoute.date = datetime.datetime.utcnow()
    dispRoute.save()
    return HttpResponse(simplejson.dumps('ok'))


