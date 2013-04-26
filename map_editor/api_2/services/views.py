# -*- coding: utf8 -*-

from map_editor.models import *
from map_editor.forms import *

from django_web.utils import *

import services
from django.http.response import HttpResponse
import simplejson
import json

def img(request, resource, id):
	"""
	/api-2/[resource]/[id]/img
	"""
	imgService = services.ImgService(request, resource, id)

	if request.method == 'POST':
		return imgService.upload_img()
	elif request.method == 'DELETE':
		return imgService.delete_img()
