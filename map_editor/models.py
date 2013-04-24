# -*- coding: utf-8 -*-
from django.db import models

#Se importa los usuarios para usarlo en Producto
# from django.contrib.auth.models import User



#Se crea el modelo de categoría
class Place(models.Model):
	name = models.CharField(max_length=60, unique=True, blank=False)

	def __unicode__(self):
		return self.name


#Se crea el modelo para los productos
class Map(models.Model):
	name = models.CharField(max_length=200)
	img = models.FileField(upload_to="img/maps", null=True)

	# por defecto, si eliminamos un lugar también se eliminan todos sus mapas
	place = models.ForeignKey(Place, related_name='maps', blank=True)

	def __unicode__(self):
		return self.name


class Grid(models.Model):
	num_rows = models.PositiveIntegerField()
	num_cols = models.PositiveIntegerField()
	map = models.ForeignKey(Map, related_name='grids')

	def __unicode__(self):
		return self.name


class ObjectCategory(models.Model):
	name = models.CharField(max_length=200, unique=True, blank=False)
	img = models.FileField(upload_to="img/object_categories", blank=True, null=True)

	def __unicode__(self):
		return self.name

	def delete(self, *args, **kwargs):
		"""
		Sobreescribimos el método delete() para también eliminar la imágen de la categoría
		"""
		# You have to prepare what you need before delete the model
		storage, path = self.img.storage, self.img.path
		# Delete the model before the file
		super(ObjectCategory, self).delete(*args, **kwargs)
		# Delete the file after the model
		storage.delete(path)


def object_filename(instance, filename):
	"""
	Aquí indicaremos cómo guardaremos la imágen para el objeto.
	En este caso se creará una carpeta para cada categoría.

	Xej: img/objects/restaurante/rodilla.png

	http://stackoverflow.com/questions/1190697/django-filefield-with-upload-to-determined-at-runtime/1190866#1190866
	"""
	return 'img/objects/' + instance.category.name + '/' + filename


class Object(models.Model):
	name = models.CharField(max_length=200)
	img = models.FileField(upload_to=object_filename, blank=True, null=True)

	# ponemos '_objects_' en lugar de 'objects' para no confundirlo con la
	# palabra reservada, ya que si no dará error
	category = models.ForeignKey(ObjectCategory, related_name='_objects_')

	def __unicode__(self):
		return self.name

	def delete(self, *args, **kwargs):
		"""
		Sobreescribimos el método delete() para también eliminar la imágen del objeto
		"""
		# You have to prepare what you need before delete the model
		storage, path = self.img.storage, self.img.path
		# Delete the model before the file
		super(Object, self).delete(*args, **kwargs)
		# Delete the file after the model
		storage.delete(path)


class Point(models.Model):
	description = models.CharField(max_length=200, unique=True, blank=False)
	x_coord = models.PositiveIntegerField()
	y_coord = models.PositiveIntegerField()
	object = models.ForeignKey(Object, related_name='points')
	grid = models.ForeignKey(Grid, related_name='points')

	def __unicode__(self):
		return self.name
