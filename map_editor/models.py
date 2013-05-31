# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User

CATEGORIAS_FIJAS= {
    0: 'Bloqueantes',
    1: 'Aristas',
    2: 'Intermedias',
}


class Enclosure(models.Model):
    name = models.CharField(max_length=60, unique=True, blank=False)
    owner = models.ForeignKey(User, related_name='enclosures', blank=False)

    def __unicode__(self):
        return self.name


def floor_filename(instance, filename):
    """
	xej: img/enclosures/matadero_prueba/floors/nave16.png
	"""
    return 'img/enclosures/' + instance.enclosure.name.replace(" ", "_") + '/floors/' + filename


#Se crea el modelo para los productos
class Floor(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    img = models.FileField(upload_to=floor_filename, null=True, blank=True)
    num_rows = models.PositiveIntegerField(null=True, blank=True)
    num_cols = models.PositiveIntegerField(null=True, blank=True)
    floor_number = models.IntegerField(null=True, blank=True)


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
    name = models.CharField(max_length=200, unique=True, blank=False);
    color = models.CharField(max_length=50, blank=False);
    img = models.FileField(upload_to="img/label_categories", blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Label categories'

    def __unicode__(self):
        return self.name

    def delete(self, *args, **kwargs):
        if self.img:
            # You have to prepare what you need before delete the model
            storage, path = self.img.storage, self.img.path
            # Delete the model before the file
            super(LabelCategory, self).delete(*args, **kwargs)
            # Delete the file after the model
            storage.delete(path)
        else:
            super(LabelCategory, self).delete(*args, **kwargs)


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
    category = models.ForeignKey(LabelCategory, related_name='labels', blank=True, on_delete=models.CASCADE)

    def __unicode__(self):
        return self.name

    def delete(self, *args, **kwargs):
        if self.img:
            # You have to prepare what you need before delete the model
            storage, path = self.img.storage, self.img.path
            # Delete the model before the file
            super(Label, self).delete(*args, **kwargs)
            # Delete the file after the model
            storage.delete(path)
        else:
            super(Label, self).delete(*args, **kwargs)


class Point(models.Model):
    description = models.CharField(max_length=2000, null=True, blank=True)
    row = models.PositiveIntegerField(null=True, blank=True)
    col = models.PositiveIntegerField(null=True, blank=True)
    label = models.ForeignKey(Label, related_name='points', on_delete=models.CASCADE)
    floor = models.ForeignKey(Floor, related_name='points', on_delete=models.CASCADE)

    def __unicode__(self):
        return self.floor.name + ' (' + str(self.row) + ', ' + str(self.col) + ')'


class QR_Code(models.Model):
    code = models.CharField(max_length=200, unique=True, blank=False)
    point = models.OneToOneField(Point, related_name='qr_code', on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'QR_Code'
        verbose_name_plural = 'QR_Codes'

    def __unicode__(self):
        return self.code


