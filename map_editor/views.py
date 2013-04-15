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

import json
import simplejson

from map_editor.models import *
from map_editor.forms import *

from django_web.utils import *


def index(request):
	return render_to_response('map_editor/index_angular.html', context_instance=RequestContext(request))


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
			place = form.save()
			# print place.id
			return responseJSON(data={'id': place.id})
		else:
			return responseJSON(errors=form.errors)

	elif operation == 'delete':
		place = Place.objects.get(id=request.POST['place_id'])

		# eliminamos todos los mapas relativos a ese lugar, incluídas sus imágenes
		maps = place.map_set.all()
		for map in maps:
			map.delete()

		place.delete()

		return responseJSON()

	elif not operation:
		places = Place.get_all()
		return HttpResponse(json.dumps(places), content_type="application/json")

	return HttpResponse('places..')


def maps(request, operation):

	if operation == 'new':

		# Si la petición es AJAX creo un mapa sin imágen
		if request.is_ajax():
			map_name = request.POST['map_name']
			form = MapForm({'name': map_name})
			if form.is_valid:
				place = Place.objects.get(id=request.POST['place_id'])
				map = Map(name=map_name, place=place)
				map.add_default_img()
				map.save()
				print map.name
				print map.place

				return responseJSON(data={'map_id': map.id})
			else:
				return responseJSON(errors=form.errors)

		# Si no es AJAX es que quiero subir la imágen para el mapa guardado previamente
		else:
			file_content = ContentFile(request.FILES['map_img'].read())
			print '@@@@ - ' + request.FILES['map_img'].name
			map.img.save(request.FILES['map_img'].name, file_content)
			map.save()
			return HttpResponse('uploaded!')

	else:
		return HttpResponse('ande vaaa')


def new_place(request):
	pass


def edit_map(request):
	# return HttpResponse('edit map')
	return render_to_response('map_editor/edit_map.html', context_instance=RequestContext(request))


def dynamic_validator(request, resource, pk=None):
	"""
	Devuelve de manera dinámica (cada vez que se pulsa una tecla, etc..)
	los errores en cada campo del formulario.

	URI:
		/dynamyc-validator/[resource]/[id]

	Importante: cuando llamamos a este URI usando $http de angular el
	contenido está en 'request.body', en lugar de 'request.POST['data']

	Por ejemplo para /dynamyc-validator/place recibimos:
		{'name': 'nombre del lugar'}

	Si el lugar se está editando recibimos su id por la URI:

		/dynamyc-validator/place/25

	Si se le pasa una pk como argumento entonces excluimos los nombres de aquellos
	lugares que coincidan con esa misma pk


	Es importante que al pasar el objeto 'obj' a PlaceForm éste tenga en sus claves (keys)
	los mismos nombres que para los atributos del modelo Place (creado en models.py).
	Al caso, si se trata del nombre del lugar, que sea la clave también sea 'name:'
	"""
	obj = simplejson.loads(request.body)

	if pk:
		place = get_object_or_404(Place, pk=pk)
		form = PlaceForm(obj, instance=place)
	else:
		form = PlaceForm(obj)

	# 	# obj['pk'] = pk
	# 	# print obj
	# 	others = Place.objects.filter(name=obj['name']).exclude(pk=pk)
	# 	# others = Place.objects.filter(name=obj['name'])
	# 	# others = Place.objects.filter(name=obj['name']).exclude(name='matadero')
	# 	# print others
	# 	form.fields['name'].queryset = others

	if not form.is_valid():
		return responseJSON(errors=form.errors)

	return responseJSON()
