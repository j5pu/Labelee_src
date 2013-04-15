# Create your views here.
# -*- coding: utf8 -*-

from django.shortcuts import render_to_response
from django.template import RequestContext


def angular(request):
	return render_to_response('sandbox/angular/index.html', context_instance=RequestContext(request))


def ng_services(request):
	return render_to_response('angularjs/services/services.html', context_instance=RequestContext(request))
