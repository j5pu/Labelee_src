# -*- coding: utf-8 -*-
import datetime
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.core.context_processors import csrf
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
import simplejson
from dashboard.models import DisplayedRoutes, CategoryShot
from dashboard.utils import *
from map_editor.models import Floor, Enclosure
from route.services import getHeatMapSteps
import xlwt

from pyExcelerator import *
from django.http import HttpResponse
# from utils.constants import USER_GROUPS

dateIni = dateFin = excel_url_args = None

def set_dates(request):
    global dateIni, dateFin, excel_url_args
    has_dateIni = "dateIni" in request.GET and request.GET['dateIni']
    has_dateFin = "dateFin" in request.GET and request.GET['dateFin']

    if has_dateIni:
        dateIni = request.GET["dateIni"]
        excel_url_args = '?dateIni=%s' % (dateIni)
    else:
        dateIni = None
    if has_dateFin:
        dateFin = request.GET["dateFin"]
        excel_url_args = '?dateFin=%s' % (dateFin)
        if has_dateIni:
            excel_url_args = '?dateIni=%s&dateFin=%s' % (dateIni, dateFin)
    else:
        dateFin = None



@login_required(login_url=settings.LOGIN_URL)
def index(request, enclosure_id):
    # Comprobamos que somos el dueño
    user_is_owner = len(request.user.enclosures.filter(id=enclosure_id)) != 0
    can_access = request.user.is_staff or (request.user.is_in_group(1) and user_is_owner)


    # Qr_shot.objects.filter(date__gt= dateIni, date__lt= dateFin)
    if can_access:
        set_dates(request)
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
            'scansByCategory' : simplejson.dumps(getScansByCategory(enclosure_id, dateIni, dateFin)),
            'routesByCategory' : simplejson.dumps(getRoutesByCategory(enclosure_id, dateIni, dateFin)),
            'topScansByPoi' : simplejson.dumps(getTopScansByPoi(enclosure_id, dateIni, dateFin)),
            'topRoutesByPoi' : simplejson.dumps(getTopRoutesByPoi(enclosure_id, dateIni, dateFin)),
            'dateIni' : dateIni,
            'dateFin' : dateFin,
            'excelUrlArgs' : excel_url_args
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

# def filter(request, enclosure_id,):
#     dateIni = request.GET["dateIni"]
#     dateFin = request.GET["dateFin"]
#     Qr_shot.objects.filter(date__gt= dateIni, date__lt= dateFin)
#     HttpResponseRedirect()
#
#     pass


def saveRouteRequest(request):
    json_data = request.body
    point_list = simplejson.loads(json_data)
    dispRoute = DisplayedRoutes()
    dispRoute.origin_id = point_list['originpoi']
    dispRoute.destination_id = point_list['destinationpoi']
    dispRoute.date = datetime.datetime.utcnow()
    dispRoute.save()
    return HttpResponse(simplejson.dumps('ok'))

def show_excel(request, enclosure_id):
    set_dates(request)
    enclosureName = Enclosure.objects.get(id=enclosure_id).name
    scansByCategory = getScansByCategory(enclosure_id, dateIni, dateFin)
    routesByCategory = getRoutesByCategory(enclosure_id, dateIni, dateFin)
    numCategory = len(scansByCategory[0]['values'])
    topScansByPoi = getTopScansByPoi(enclosure_id, dateIni, dateFin)
    topRoutesByPoi = getTopRoutesByPoi(enclosure_id, dateIni, dateFin)

    style0 = xlwt.easyxf('font: name Times New Roman, colour blue, bold on; alignment: horizontal center;')
    style1 = xlwt.easyxf('alignment: horizontal left',num_format_str='DD-MMM-YY')
    style2 = xlwt.easyxf('alignment: horizontal left')
    wb = xlwt.Workbook(encoding="UTF-8")
    ws = wb.add_sheet('Dashboard',cell_overwrite_ok=True)
    ws.col(0).width = 256 * (len(enclosureName) + 10)
    ws.col(1).width = 256 * 25
    ws.write(0,0,'Dashboard de '+enclosureName, style0)
    ws.write(1,0,dateIni +'   '+ dateFin, style1)
    ws.write(2,1, 'Número de lecturas Qr',style0)
    ws.write(4,1,'Categoría')
    ws.write(5,1,'Número de lecturas')
    ws.write(8,1, 'Número de rutas',style0)
    ws.write(10,1, 'Categoría')
    ws.write(11,1, 'Número de rutas')
    ws.write(14,1,'Top 10 de lecturas',style0)
    ws.write(16,1, 'POI')
    ws.write(17,1, 'Número de lecturas')
    ws.write(20,1,'Top 10 de rutas',style0)
    ws.write(22,1, 'POI')
    ws.write(23,1, 'Número de rutas')


    for i in range(numCategory):
        ws.col(i+3).width = 256 * (len(scansByCategory[0]['values'][i]['label']) + 1)
        ws.write(4,i+3,scansByCategory[0]['values'][i]['label'], style2)
        ws.write(5,i+3,scansByCategory[0]['values'][i]['value'], style2)
        ws.write(10,i+3,routesByCategory[0]['values'][i]['label'], style2)
        ws.write(11,i+3,routesByCategory[0]['values'][i]['value'], style2)

    for i in range (10):
        if i<len(scansByCategory[0]['values']):
            if len(topScansByPoi[0]['values'][i]['label']) > len(scansByCategory[0]['values'][i]['label']):
                ws.col(i+3).width = 256 * (len(topScansByPoi[0]['values'][i]['label']) + 1)
        else:
            ws.col(i+3).width = 256 * (len(topScansByPoi[0]['values'][i]['label']) + 1)
        ws.write(16,i+3,topScansByPoi[0]['values'][i]['label'], style2)
        ws.write(17,i+3,topScansByPoi[0]['values'][i]['value'], style2)
        ws.write(22,i+3,topRoutesByPoi[0]['values'][i]['label'], style2)
        ws.write(23,i+3,topRoutesByPoi[0]['values'][i]['value'], style2)

    wb.save('media/'+enclosureName+'.xls')
    filePath ='media/'+enclosureName+'.xls'
    return HttpResponseRedirect('/' + filePath)


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



