# -*- coding: utf8 -*-

from django.shortcuts import render_to_response, get_object_or_404
from django.template.loader import get_template
from django.template import Context
from django.template import RequestContext
from django.http import HttpResponse
from django.http import HttpRequest
from django.http import HttpResponseRedirect

from django.core.files.base import ContentFile


from django_web.utils.helpers import responseJSON

import simplejson

from map_editor.models import *
from map_editor.forms import *

from django_web.utils import *


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
