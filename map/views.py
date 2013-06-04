# -*- coding: utf-8 -*-


from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.http import HttpResponseRedirect
# from touching_log import log

import json
from map_editor.models import *
from django.db.models.query import Q


def origin(request, enclosure_id, floor_id, poi_id):
    """
        map/origin/1_25_91234
    """
    categories = {}
    points = Point.objects.filter(~Q(label__category__name__in = CATEGORIAS_FIJAS.values()),floor__id = floor_id )
    for point in points:
        if point.label.category.name not in CATEGORIAS_FIJAS.values():
            if point.label.category.name in categories:
                categories[point.label.category.name].append(point)
            else:
                categories[point.label.category.name] = [point]

    ctx = {
        'enclosure_id': enclosure_id,
        'floor_id': floor_id,
        'poi_id': poi_id,
        'categories': categories,
    }
    return render_to_response('map/index.html', ctx, context_instance=RequestContext(request))



events = []


# def index(request):
# 	# No implementado aún
# 	return render_to_response('map/index.html', context_instance=RequestContext(request))


def your_position(request, label_id):
	"""
	Muestra el mapa justo donde haces la foto al qr
	"""
	labels = {
		'001': [0, 0],
		'002': [8, 8],
		'003': [25, 40],
		'004': [1, 1],
		'005': [20, 10]
	}

	ctx = {
		'label': labels[label_id],
		'block_size': 10,
		'map_img': '/static/img/map.jpg'
	}

	return render_to_response('map/your_position.html', ctx, context_instance=RequestContext(request))


def event_log(request):
	global events

	# print 'holaaa'

	if request.is_ajax():
		if request.method == 'GET':
			json_cad = json.dumps(events)
			# print json_cad
			return HttpResponse(json_cad, content_type="application/json")
		if request.method == 'POST':
			events = json.loads(request.POST['events'])
			# print events[7]
			# print 'holaa'
			return HttpResponse('aa')

	# return a new page otherwise
	return render_to_response("map/event_log.html", {}, context_instance=RequestContext(request))


# def touchingLog(request):
# 	return HttpResponse(json.dumps(response_data), content_type="application/json")


# def showLog(request):
# 	return render_to_response('map/touching_log.html', ctx, context_instance=RequestContext(request))


def fuera(request, id, row, column):
	url = 'http://inmap.eu01.aws.af.cm/routesFrom.php?id=' + id + \
	'&row=' + row + '&column=' + column
	return HttpResponseRedirect(url)




