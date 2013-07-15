# -*- coding: utf-8 -*-
from django.core import serializers
from django.core.files import File

from django.http import HttpResponse
from django.db.models import Q

import os
import settings
import simplejson
from map_editor.models import Point, Label, Floor, QR_Code
import map_editor.map_generator.houghLines as houghLines
from map_editor.map_generator.houghLines import HoughLines


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


def generate_map(request, floor_id):
    """
    Generates automatically a map from the image of a floor using computer vision techniques
    :param request:
    :param floor_id:
    """
    floor = Floor.objects.get(id=floor_id)

    canny_thres1 = int(request.GET.get("canny1", houghLines.INITIAL_CANNY_THRESHOLD_1))
    canny_thres2 = int(request.GET.get("canny2", houghLines.INITIAL_CANNY_THRESHOLD_2))
    threshold = int(request.GET.get("threshold", houghLines.INITIAL_THRESHOLD))
    length = int(request.GET.get("length", houghLines.INITIAL_MIN_LINE_LENGTH))
    gap = int(request.GET.get("gap", houghLines.INITIAL_MAX_LINE_GAP))

    file_path = floor.img.path

    # print repr(HoughLines(file_path,
    #                threshold=threshold,
    #                min_line_length=length,
    #                max_line_gap=gap,
    #                canny_threshold_1=canny_thres1,
    #                canny_threshold_2=canny_thres2))

    map_lines = HoughLines(file_path,
                           threshold=threshold,
                           min_line_length=length,
                           max_line_gap=gap,
                           canny_threshold_1=canny_thres1,
                           canny_threshold_2=canny_thres2).getLines()

    return HttpResponse(simplejson.dumps(map_lines), mimetype='application/json')

    # TODO: reducir numero de lineas?