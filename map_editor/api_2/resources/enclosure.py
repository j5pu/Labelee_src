# -*- coding: utf-8 -*-
import os
import shutil
import zipfile
from django.core.cache import cache
from django.db.models import Sum
from django.http import HttpResponse
import simplejson
from map.utils_ import cache_show_map
from map_editor.api_2.utils.enclosure import getEnclosureForManager
from map_editor.api_2.utils.point import filterAsPois
from map_editor.models import Enclosure, LabelCategory, Point, QR_Code
from django.db.models import Q
from settings.common import PROJECT_ROOT
from utils.helpers import *
from map_editor.url_to_qr import PyQRNative
import StringIO
from django.core.servers.basehttp import FileWrapper

GENERATED_FROM_URL_QR_TYPE = 4
GENERATED_FROM_URL_QR_CORRECTION_LEVEL = PyQRNative.QRErrorCorrectLevel.L


def manager(request, enclosure_id=None):
    """
    /api-2/enclosure/manager/
    /api-2/enclosure/manager/16/

    Devuelve toda la info de todos los recintos a mostrar en el manager para el usuario,
    o bien de un recinto en concreto
    """
    if enclosure_id is not None:
        enclosure = getEnclosureForManager(enclosure_id)
        return HttpResponse(simplejson.dumps(enclosure), mimetype='application/json')

    if request.user.is_staff:
        enclosures_query = Enclosure.objects.all()
    else:
        enclosures_query = Enclosure.objects.filter(owner__id=request.user.id)

    enclosures = []
    for enclosure in enclosures_query:
        enclosures.append(getEnclosureForManager(enclosure.id))

    return HttpResponse(simplejson.dumps(enclosures), mimetype='application/json')


def refresh_cache(request, enclosure_id):
    """
    Refresca memcache para un recinto dado
    """
    if not request.user.is_staff:
        return HttpResponse('UNAUTHORIZED!!')

    cache_key = 'show_map_enclosure_' + enclosure_id
    cache.delete(cache_key)
    cache_show_map(enclosure_id)

    return HttpResponse('ok')

#qrDownload

def qrDownload(request, enclosure_id):
    """
   Crea un fichero zip con todos los qr de un recinto.
    """
    path = os.path.join(PROJECT_ROOT, 'TEMP')
    try:
        os.mkdir(path)
    except Exception, ex:
        pass
    path = os.path.join(path,str(enclosure_id))
    # create the folder if it doesn't exist.
    try:
        os.mkdir(path)
    except Exception, ex:
        pass

    qrCodes = QR_Code.objects.filter(point__floor__enclosure__id=enclosure_id)
    # Open StringIO to grab in-memory ZIP contents
    filename = 'qrs_'+enclosure_id +'.zip'
    # The zip compressor
    zipdata = StringIO.StringIO()
    zf = zipfile.ZipFile(zipdata, "w")

    host = request.META["HTTP_HOST"]
    for qrCode in qrCodes:
        #example http://192.168.1.120:8000/api-2/url_to_qr/http://192.168.1.120:8000/map/origin/26_68_35275
        url = host + '/map/origin/' + qrCode.code
        qr = PyQRNative.QRCode(GENERATED_FROM_URL_QR_TYPE, GENERATED_FROM_URL_QR_CORRECTION_LEVEL)
        qr.addData(url)
        qr.make()
        im = qr.makeImage()
        filePath = os.path.join(path, qrCode.code + '.PNG')
        im.save(filePath, format='PNG')
        zf.write(filePath,str(qrCode.point_id) + '.PNG')

    zf.close()
    # resp = HttpResponse(s.getvalue(), mimetype="application/x-zip-compressed")
    # # ..and correct content-disposition
    # resp['Content-Disposition'] = 'attachment; filename=%s' % "qrs.zip"
    zipdata.seek(0)


    response = HttpResponse(zipdata.read())
    response['Content-Disposition'] = 'attachment; filename=%s' % filename
    response['Content-Type'] = 'application/x-zip'
    for the_file in os.listdir(path):
        file_path = os.path.join(path, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception, e:
            pass


    return  response