# -*- coding: utf8 -*-

from django.shortcuts import render_to_response
from django.template import RequestContext


def index(request):
	return render_to_response('map_editor/index.html', context_instance=RequestContext(request))


def edit_map(request, pk):
	#import urllib2
	#response = urllib2.urlopen('http://mnopi:1aragon1@localhost:8000/api/v1/map/' + pk)
	#html = response.read()
	ctx = {
		'map_id': pk
	}
	return render_to_response('map_editor/edit_map.html', ctx, context_instance=RequestContext(request))
