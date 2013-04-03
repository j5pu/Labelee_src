# -*- coding: utf-8 -*-
from django.db import models

from django.utils import simplejson
#Se importa los usuarios para usarlo en Producto
# from django.contrib.auth.models import User


#Se crea el modelo de categoría
class Place(models.Model):
	name = models.CharField(max_length=200, unique=True)

	def __unicode__(self):
		return self.name
		# return 'no hay na!!!'

	# def list(self):
	# 	place_list = self.objects.all()
	# 	for place in place_list:

	# print serializers.serialize('json', Place.objects.all(), indent=4, fields=('name'))

	@staticmethod
	def find(name):
		"""
		Devuelve los datos de un lugar dado su nombre
		"""
		return Place.objects.get(name=name)

	def get(self):
		print 'blabla'

		"""
		Devuelve todos los datos de un lugar
		"""
		# maps = []
		# for map in self.map_set.all():
		# 		{'id': map.id, 'name': map.name, 'img': map.img}
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
	img = models.FileField(blank=False, upload_to="/media/img/maps")
	place = models.ForeignKey(Place)

	def __unicode__(self):
		return self.name


class Grid(models.Model):
	block_size = models.PositiveIntegerField()
	map = models.ForeignKey(Map)



