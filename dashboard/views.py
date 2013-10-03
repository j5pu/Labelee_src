# -*- coding: utf-8 -*-
import datetime
from django.core.context_processors import csrf
from django.http import HttpResponse

from django.shortcuts import render_to_response
from django.template import RequestContext
import simplejson
from dashboard.models import DisplayedRoutes, CategoryShot
from dashboard.utils import *
from map_editor.models import Floor, Enclosure
from route.services import getHeatMapSteps


def index(request, enclosure_id):
    state = "Registrate para acceder al dashboard"
    username = password = ''
    ctx = {
        'state': state,
        'enclosure_id': enclosure_id

    }
    template = 'dashboard/login.html'
    userlogged = request.session.get('userlogged')

    if request.POST or userlogged is not None:
        username = request.POST.get('username')
        password = request.POST.get('password')

        if username == "alcala" and password == "labelee2013" or userlogged is not None:
            request.session['userlogged'] = 'alacala'
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
        else:
            ctx = {
                'state': 'Nombre de usuario y/o incorrectos',
                'enclosure_id': enclosure_id
            }

    ctx.update(csrf(request))
    return render_to_response(template, ctx, context_instance=RequestContext(request))


def saveRouteRequest(request):
    json_data = request.body
    point_list = simplejson.loads(json_data)
    dispRoute = DisplayedRoutes()
    dispRoute.origin_id = point_list['originpoi']
    dispRoute.destination_id = point_list['destinationpoi']
    dispRoute.date = datetime.datetime.utcnow()
    dispRoute.save()
    return HttpResponse(simplejson.dumps('ok'))

def saveClickOnCategory(request):
    json_data = request.body
    data = simplejson.loads(json_data)
    idCategory = data['idcategory']
    user = data['user']
    category = LabelCategory()
    category.id = idCategory
    categoryShoot = CategoryShot()
    categoryShoot.category = category
    categoryShoot.date =  datetime.datetime.utcnow()
    categoryShoot.userkey = user
    categoryShoot.save()
    return HttpResponse(simplejson.dumps('ok'))



