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


def img(request, pk):
	"""
	Web service para manejar la imágen de un object:

		- Subir imágen: POST > /api-2/object/16/img
		- Eliminar imágen: DELETE > api-2/object/16/img
	"""
	if request.method == 'POST':
		return upload_img(request, pk)
	elif request.method == 'DELETE':
		return delete_img(pk)


def upload_img(request, pk):
	"""
	Sube la imágen del object_type.

	Si ya hay una imágen ésta se elimina

		POST -> /api-2/object-type/16/img
	"""

	# Controlador para poder subir una imágen a un recurso 'object_type'

	file_content = ContentFile(request.FILES['img'].read())

	# POST['id'] proviene del <input type=hidden name="id"..
	object_type = ObjectType.objects.get(id=pk)

	if object_type.img:
		delete_img(pk)

	object_type.img.save(request.FILES['img'].name, file_content)
	obj = object_type.save()

	print simplejson.dumps(obj)

	# respuesta en el iframe
	data = {
		'form': 'object_type',
		'obj': obj
	}
	return responseJSON(data=data)
	# return HttpResponse('<span>object_type</span> uploaded!')


def delete_img(pk):
	"""
	Elimina la imágen del object_type

		DELETE -> /api-2/object-type/16/img
	"""
	print 'hola mamaaaaa'
	print pk
	obj_type = ObjectType.objects.get(id=pk)
	# You have to prepare what you need before delete the model
	storage, path = obj_type.img.storage, obj_type.img.path
	# Delete the model before the file
	# super(ObjectType, self).delete(*args, **kwargs)
	# # Delete the file after the model
	# print path
	storage.delete(path)

	return responseJSON(data={'id': pk})
