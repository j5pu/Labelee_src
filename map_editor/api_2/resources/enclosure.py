# -*- coding: utf-8 -*-
from django.db.models import Sum
from django.http import HttpResponse
import simplejson
from map_editor.api_2.utils.enclosure import getEnclosureForManager
from map_editor.api_2.utils.label_category import getLabelCategoriesForManager
from map_editor.api_2.utils.point import filterAsPois
from map_editor.models import Enclosure, LabelCategory, Point
from django.db.models import Q
from utils.helpers import *


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