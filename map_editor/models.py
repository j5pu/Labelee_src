# -*- coding: utf-8 -*-
from django.db import models

from django.core.files.storage import FileSystemStorage

from django.utils import simplejson
from django.core.files import File
#Se importa los usuarios para usarlo en Producto
# from django.contrib.auth.models import User


#Se crea el modelo de categoría
class Place(models.Model):
	name = models.CharField(max_length=10, unique=True, blank=False)

	def __unicode__(self):
		return self.name

	@staticmethod
	def find(name):
		"""
		Devuelve los datos de un lugar dado su nombre
		"""
		return Place.objects.get(name=name)

	def get(self):
		"""
		Devuelve todos los datos de un lugar
		"""
		return {
			'id': self.id,
			'name': self.name,
			'maps':
			[
				{'id': map.id, 'name': map.name, 'img': map.img}
				for map in self.map_set.all()
			]
		}

	def get_json(self):
		"""
		Devuelve el lugar serializado en formato JSON
		"""
		return simplejson.dumps(self.get())

	@staticmethod
	def get_all():
		"""
		Devuelve todos los lugares con sus respectivos datos.

		Cuidado con poner self.objects, ya que 'objects' no puede ser accedido
		desde una instancia.
		[
			{
				'maps': [
					{'id': 1, 'img': u'', 'name': u'Nave 16'},
					{'id': 2, 'img': u'nave8_asdfgd', 'name': u'Nave 8'}
				],
				'id': 1,
				'name': u'Matadero'
			},
			{
				'maps': [],
				'id': 2,
				'name': u'Ternera'
			},
			{
				'maps': [{'id': 3, 'img': u'ruta66.png', 'name': u'ruta66'}],
				'id': 3,
				'name': u'matadero66'
			}
		]
		"""
		return [place.get() for place in Place.objects.all()]

	@staticmethod
	def get_all_json():
		"""
		Serializa todos los lugares
		"""
		return simplejson.dumps(Place.get_all())


#Se crea el modelo para los productos
class Map(models.Model):
	name = models.CharField(max_length=200)
	img = models.FileField(upload_to="img/maps")
	place = models.ForeignKey(Place, related_name='maps')

	def __unicode__(self):
		return self.name

	def delete(self, *args, **kwargs):
		"""
		Elimina un mapa y también su imágen
		"""
		# You have to prepare what you need before delete the model
		storage, path = self.img.storage, self.img.path
		# Delete the model before the file
		super(Map, self).delete(*args, **kwargs)
		# Delete the file after the model
		print path
		storage.delete(path)

	def add_default_img(self):
		"""
		Añade la imágen por defecto al mapa
		"""
		fs = FileSystemStorage(location='media/img')
		file = fs.open('sample_img.jpg')
		self.img.save('sample_img', File(file))

		# otra forma más 'guarra'..
		# 	file = open('/media/img/sample_img.jpg')
		# 	self.img.save('sample_img', File(file))


class Grid(models.Model):
	block_size = models.PositiveIntegerField()
	map = models.ForeignKey(Map)
