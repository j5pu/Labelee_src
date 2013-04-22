# -*- coding: utf8 -*-

from django.core.files.base import ContentFile

from django_web.utils.helpers import responseJSON

from map_editor.models import *
from map_editor.forms import *

from django_web.utils.helpers import *


# http://whilefalse.net/2009/10/21/factory-pattern-python-__new__/
classes = {
	'place': Place,
	'map': Map,
	'grid': Grid,
	'object-category': ObjectCategory,
	'object': Object,
	'point': Point
}


class ImgService:
	"""
	Helper para construir web services que manipulen la imágen de un recurso dado:
		/api-2/[resource]/[id]/img

	Por ejemplo, para el recurso 'map' con id=16:
		- Subir imágen: POST > /api-2/map/16/img
		- Eliminar imágen: DELETE > api-2/map/16/img
	"""

	def __init__(self, request, resource, id):
		self.request = request
		self.resource = resource
		self.id = id
		self.resource_class = classes[resource]

	def upload_img(self):
		"""
		Sube la imágen para el recurso. Si ya hay una imágen ésta se elimina
		"""
		file_content = ContentFile(self.request.FILES['img'].read())

		# Xej map: resource_obj = Map.objects.get(id=self.id)
		resource_obj = self.resource_class.objects.get(id=self.id)

		# Se elimina la imágen que el recurso tenía antes
		if resource_obj.img:
			self.delete_img(self.id)

		# Guardamos la nueva imágen
		resource_obj.img.save(self.request.FILES['img'].name, file_content)
		saved_obj = resource_obj.save()

		# respuesta en el iframe
		data = {
			'form': self.resource
			# 'obj': saved_obj
		}

		return responseJSON(data=data)

	def delete_img(self):
		"""
		Elimina la imágen para el recurso
		"""
		obj_type = self.resource_class.objects.get(id=self.id)
		# You have to prepare what you need before delete the model
		storage, path = obj_type.img.storage, obj_type.img.path
		# Delete the model before the file
		# super(ObjectType, self).delete(*args, **kwargs)
		# # Delete the file after the model
		# print path
		storage.delete(path)

		return responseJSON(data={'id': self.id})
