# -*- coding: utf-8 -*-


from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.http import HttpResponseRedirect
# from touching_log import log

import json

events = []


def index(request):
	# No implementado aún
	return render_to_response('map/index.html', context_instance=RequestContext(request))


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
		'map_img': '/media/common/map.jpg'
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
