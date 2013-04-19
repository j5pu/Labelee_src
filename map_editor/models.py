# -*- coding: utf-8 -*-
from django.db import models

#Se importa los usuarios para usarlo en Producto
# from django.contrib.auth.models import User


# model_classes = {}


#Se crea el modelo de categoría
class Place(models.Model):
	name = models.CharField(max_length=60, unique=True, blank=False)

	# def __init__(self):
	# 	model_classes['place'] = self

	def __unicode__(self):
		return self.name


#Se crea el modelo para los productos
class Map(models.Model):
	name = models.CharField(max_length=200)
	img = models.FileField(upload_to="img/maps", null=True)
	place = models.ForeignKey(Place, related_name='maps', null=True, blank=True)

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


class Object(models.Model):
	name = models.CharField(max_length=200)
	img = models.FileField(upload_to="img/objects", blank=True, null=True)

	# ponemos '_objects_' en lugar de 'objects' para no confundirlo con la
	# palabra reservada, ya que si no dará error
	category = models.ForeignKey(ObjectCategory, related_name='_objects_')

	def __unicode__(self):
		return self.name


class Point(models.Model):
	description = models.CharField(max_length=200, unique=True, blank=False)
	x_coord = models.PositiveIntegerField()
	y_coord = models.PositiveIntegerField()
	object = models.ForeignKey(Object, related_name='object')
	grid = models.ForeignKey(Grid, related_name='points')

	def __unicode__(self):
		return self.name
