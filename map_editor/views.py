# -*- coding: utf8 -*-

from django.shortcuts import render_to_response
from django.template.loader import get_template
from django.template import Context
from django.template import RequestContext
from django.http import HttpResponse
from django.http import HttpResponseRedirect

import json
import simplejson

from map_editor.models import *
from map_editor.forms import *

from django_web.utils import *


def index(request):
	# return HttpResponse('index view..')
	# matadero = Place(name='Matadero')
	# matadero.save()
	places = Place.get_all()
	# print places
	ctx = {'places': places}
	return render_to_response('map_editor/index.html', ctx, context_instance=RequestContext(request))


def places(request, operation):
	"""
	Recibe una URL /map-editor/places/[operation], la cual puede ser:

		* new -> añade un nuevo lugar en la BD
		* delete -> elimina lugar de la BD
	"""
	# return HttpResponse('index view..')
	# matadero = Place(name='Matadero')
	# matadero.save()

	if operation == 'new':
		form = PlaceForm({'name': request.POST['place_name']})
		if form.is_valid():
			form.save()
			return responseValid()
		else:
			return responseError(form.errors)

	elif operation == 'delete':
		place = Place.objects.get(id=request.POST['place_id'])
		print place
		place.delete()
		return responseValid()
	elif not operation:
		place_list = Place.objects.all()
		return HttpResponse(json.dumps(place_list), content_type="application/json")

	return HttpResponse('places..')


def maps(request, operation):
	if operation == 'new':
		return HttpResponse('Hola q pasa..')
	else:
		return HttpResponse('ande vaaa')


def new_place(request):
	pass


def edit_map(request):
	# return HttpResponse('edit map')
	return render_to_response('map_editor/edit_map.html', context_instance=RequestContext(request))


# def new_place(request):

# 	if request.method == "POST":
# 		place = Place(request.POST['place_name'])

