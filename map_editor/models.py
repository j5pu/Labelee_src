# -*- coding: utf-8 -*-

import os
from django.db import models
from django.contrib.auth.models import User
from map_editor.api_2.utils.point import filterAsPois

CATEGORIAS_FIJAS = {
    0: 'Bloqueantes',
    1: 'Aristas',
    2: 'Intermedias',
    3: 'Parquing',
}

def get_logo_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/logo%s' % (instance.id, fileExtension)

class Enclosure(models.Model):
    name = models.CharField(max_length=60, unique=True, blank=False)
    twitter_account = models.CharField(max_length=60, blank=True, null=True)
    logo = models.FileField(upload_to=get_logo_path, null=True, blank=True)
    url_enclosure = models.URLField(null=True, blank=True)
    url_dashboard = models.URLField(null=True, blank=True)

    owner = models.ForeignKey(User, related_name='enclosures', blank=False)

    def __unicode__(self):
        return self.name


    def delete(self, *args, **kwargs):
        """
        Al eliminar cada recinto también eliminamos cada imagen de planta
        """
        for floor in self.floors.all():
            floor.delete()

        super(Enclosure, self).delete(*args, **kwargs)

    def has_as_owner(self, owner):
        return self.owner == owner

    def count_pois(self):
        points = Point.objects.filter(floor__enclosure = self.id)
        return filterAsPois(points).count()

#         def get_path(instance, filename):
# return 'photos/%s/%s' % (instance.stock_number, filename)
def get_floor_path(instance, filename):
    """
    img/enclosures/[encl_id]/floors/[floor_id].ext
	xej: img/enclosures/25/floors/167.png
	"""
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/floors/%s%s' % (instance.enclosure.id, instance.id, fileExtension)


#Se crea el modelo para los productos
class Floor(models.Model):
    floor_number = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=200, null=False, blank=False)
    img = models.FileField(upload_to=get_floor_path, null=True, blank=True)
    num_rows = models.PositiveIntegerField(null=True, blank=True)
    num_cols = models.PositiveIntegerField(null=True, blank=True)

    # por defecto, si eliminamos un lugar también se eliminan todos sus mapas
    enclosure = models.ForeignKey(Enclosure, related_name='floors', blank=True)


    def __unicode__(self):
        return self.name

    def delete(self, *args, **kwargs):
        """
		Sobreescribimos el método delete() para también eliminar su imagen del disco duro
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


def category_filename(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/label_categories/%s%s' % (instance.name, fileExtension)

class LabelCategory(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False)
    color = models.CharField(max_length=50, blank=False)
    img = models.FileField(upload_to="img/label_categories", blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    cat_code = models.CharField(max_length=3, null=True)

    enclosure = models.ForeignKey(Enclosure, related_name='enclosure', blank=False, null=True)


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

    def qr_can_be_assigned(self):
        # Comprueba si la categoría no es ni bloqueante ni arista
        return not self.name_es or (self.name_es.upper() != CATEGORIAS_FIJAS[0].upper() and \
            self.name_es.upper() != CATEGORIAS_FIJAS[1].upper())


def label_filename(instance, filename):
    """
    img/labels/restaurante/rodilla.png
    """
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/labels/%s/%s%s' % (instance.category.name, instance.name, fileExtension)


class Label(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False)
    img = models.FileField(upload_to=label_filename, blank=True, null=True)

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


def get_panorama_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/panoramas/%s%s' % (instance.floor.enclosure.id, instance.id, fileExtension)

def get_coupon_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/coupons/%s%s' % (instance.floor.enclosure.id, instance.id, fileExtension)

class Point(models.Model):
    description = models.CharField(max_length=2000, null=True, blank=True)
    row = models.PositiveIntegerField(null=True, blank=True)
    col = models.PositiveIntegerField(null=True, blank=True)
    panorama = models.FileField(upload_to=get_panorama_path, null=True, blank=True)
    coupon=models.FileField(upload_to=get_coupon_path,null=True, blank=True)

    label = models.ForeignKey(Label, related_name='points', on_delete=models.CASCADE)
    floor = models.ForeignKey(Floor, related_name='points', on_delete=models.CASCADE)

    def __unicode__(self):
        return self.floor.name + ' (' + str(self.row) + ', ' + str(self.col) + ')'

    def assign_qr(self):
        qr_code = str(self.floor.enclosure.id) + '_' + str(self.floor.id) + '_' + str(self.id)
        qr = QR_Code(code=qr_code, point=self)
        qr.save()


class QR_Code(models.Model):
    code = models.CharField(max_length=200, unique=True, blank=False)

    point = models.OneToOneField(Point, related_name='qr_code', null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'QR_Code'
        verbose_name_plural = 'QR_Codes'

    def __unicode__(self):
        return self.code



