# -*- coding: utf-8 -*-
import cgi
import os

from django.db.models import Sum
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.template.loader import render_to_string
import simplejson


from map_editor.api.resources import LabelResource
from map_editor.models import Label, LabelCategory, QR_Code

from map_editor.url_to_qr import PyQRNative
import cStringIO as StringIO

GENERATED_FROM_URL_QR_TYPE = 4
GENERATED_FROM_URL_QR_CORRECTION_LEVEL = PyQRNative.QRErrorCorrectLevel.L

def read_from_floor(request, floor_id):
    """
    /api-2/qr-code/floor/1

    xej para obtener la lista de QRs que pertenecen al floor con id=1:
        /api-2/qr-code/points__floor__id=1
    """

    labels = Label.objects.filter(points__floor__id=floor_id).values().annotate(total=Sum('id'))

    resp = {}

    for label in labels:
        label_category = LabelCategory.objects.get(id=label['category_id'])
        label['img'] = '/media/' + label['img']
        label['category_name'] = label_category.name
        label['category_uri'] = '/api/v1/label-category/' + str(label_category.id)
        resource_uri = '/api/v1/label/' + str(label['id']) + '/'
        label['resource_uri'] = resource_uri

        resp[resource_uri] = label

    return HttpResponse(simplejson.dumps(resp), mimetype='application/json')

def generate_qr_from_url (request, url):

    qr = PyQRNative.QRCode(GENERATED_FROM_URL_QR_TYPE, GENERATED_FROM_URL_QR_CORRECTION_LEVEL)
    qr.addData(url)
    qr.make()

    im = qr.makeImage()

    response = HttpResponse(mimetype="image/png")
    im.save(response, "PNG")
    return response

def print_Qrs(request,floor_id):

    qrCodes = QR_Code.objects.filter(point__floor__id = floor_id)
    qrUrls = {}
    host = request.META["HTTP_HOST"]
    for qrCode in qrCodes:
        #example http://192.168.1.120:8000/api-2/url_to_qr/http://192.168.1.120:8000/map/origin/26_68_35275
        url = 'http://' + host+'/api-2/url_to_qr/'+'http://'+ host +'/map/origin/'+qrCode.code
        qrUrls[qrCode.point_id] = url
    ctx = {
            'qrUrls' : qrUrls,
          }
    return render_to_response('map_editor/v2/printQrs.html', ctx, context_instance=RequestContext(request))




