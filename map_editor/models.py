# -*- coding: utf-8 -*-
from django.db import models
#Se importa los usuarios para usarlo en Producto
# from django.contrib.auth.models import User


#Se crea el modelo de categoría
class Enclosure(models.Model):
    name = models.CharField(max_length=60, unique=True, blank=False)

    def __unicode__(self):
        return self.name


def floor_filename(instance, filename):
    """
	xej: img/floors/matadero/nave16.png
	"""
    return 'img/floors/' + instance.enclosure.name + '/' + filename

#Se crea el modelo para los productos
class Floor(models.Model):
    name = models.CharField(max_length=200)
    img = models.FileField(upload_to=floor_filename, null=True, blank=True)
    num_rows = models.PositiveIntegerField()
    num_cols = models.PositiveIntegerField()


    # por defecto, si eliminamos un lugar también se eliminan todos sus mapas
    enclosure = models.ForeignKey(Enclosure, related_name='floors', blank=True)
    # 	place = models.ForeignKey(Enclosure, blank=True)


    def __unicode__(self):
        return self.name

    def delete(self, *args, **kwargs):
        """
		Sobreescribimos el método delete() para también eliminar la imágen del mapa
		"""
        if self.img:
            # You have to prepare what you need before delete the model
            storage, path = self.img.storage, self.img.path
            # Delete the model before the file
            super(Floor, self).delete(*args, **kwargs)
            # Delete the file after the model
            storage.delete(path)
        else:
            super(Floor, self).delete(*args, **kwargs)


class LabelCategory(models.Model):
    name = models.CharField(max_length=200, unique=True, blank=False)
    img = models.FileField(upload_to="img/label_categories", blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Label categories'

    def __unicode__(self):
        return self.name

    def delete(self, *args, **kwargs):
        """
		Sobreescribimos el método delete() para también eliminar la imágen de la categoría
		"""
        # You have to prepare what you need before delete the model
        storage, path = self.img.storage, self.img.path
        # Delete the model before the file
        super(LabelCategory, self).delete(*args, **kwargs)
        # Delete the file after the model
        storage.delete(path)


def label_filename(instance, filename):
    """
	Aquí indicaremos cómo guardaremos la imágen para el objeto.
	En este caso se creará una carpeta para cada categoría.

	Xej: img/objects/restaurante/rodilla.png

	http://stackoverflow.com/questions/1190697/django-filefield-with-upload-to-determined-at-runtime/1190866#1190866
	"""
    return 'img/labels/' + instance.category.name + '/' + filename


class Label(models.Model):
    name = models.CharField(max_length=200)
    img = models.FileField(upload_to=label_filename, blank=True, null=True)

    # ponemos '_objects_' en lugar de 'objects' para no confundirlo con la
    # palabra reservada, ya que si no dará error
    # 	category = models.ForeignKey(LabelCategory)
    category = models.ForeignKey(LabelCategory, related_name='category', blank=True)

    def __unicode__(self):
        return self.name

    def delete(self, *args, **kwargs):
        """
		Sobreescribimos el método delete() para también eliminar la imágen del objeto
		"""
        # You have to prepare what you need before delete the model
        storage, path = self.img.storage, self.img.path
        # Delete the model before the file
        super(Label, self).delete(*args, **kwargs)
        # Delete the file after the model
        storage.delete(path)


class Point(models.Model):
    description = models.CharField(max_length=200, null=True, blank=True)
    row = models.PositiveIntegerField()
    col = models.PositiveIntegerField()
    label = models.ForeignKey(Label, related_name='points')
    floor = models.ForeignKey(Floor, related_name='points')

    def __unicode__(self):
        return self.floor.name
