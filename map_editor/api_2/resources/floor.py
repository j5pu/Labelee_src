# -*- coding: utf-8 -*-
from django.core import serializers

from django.http import HttpResponse
from django.db.models import Q

import simplejson
from map_editor.api.resources import PointResource
from map_editor.models import Point, Label, Floor, QR_Code
from django.contrib.auth.models import User


def render_grid(request, floor_id):
    """
    Renderiza el código HTML para el grid
        /api-2/floor/27/render-grid
    """
    floor = Floor.objects.get(id=floor_id)

    # grid = {
    #     'open_tag': '<div id="grid" style=height: 780px; width: 1014px; background-image: url(http://localhost:8000/media/img/enclosures/20/floors/27.jpg); background-size: 1014px 780px; cursor: default;
    # }


    return HttpResponse(simplejson.dumps('ok'))
