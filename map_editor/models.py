# -*- coding: utf-8 -*-

import os
from django.db import models
# from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User, UserManager
from map_editor.api_2.utils.point import filterAsPois
from file_paths import *

FIXED_CATEGORIES = {
    0: 'Blockers',
    1: 'Connectors',
    2: 'Intermediate',
    3: 'Parking',
}


class CustomUser(User):
    """User with app settings."""
    logo = models.FileField(upload_to=get_user_logo_path, null=True, blank=True)

    # Use UserManager to get the create_user method, etc.
    objects = UserManager()

    def save(self, *args, **kwargs):
        if type(self) is CustomUser and not self.pk:
            self.set_password(self.password)
        super(CustomUser, self).save(*args, **kwargs)

    class Meta:
        verbose_name = 'CustomUser'
        verbose_name_plural = 'CustomUsers'


class Enclosure(models.Model):
    name = models.CharField(max_length=60, unique=True, blank=False)
    owner = models.ForeignKey(User, related_name='enclosures', blank=False)
    twitter_account = models.CharField(max_length=60, blank=True, null=True)
    logo = models.FileField(upload_to=get_enclosure_logo_path, null=True, blank=True)
    url_enclosure = models.URLField(null=True, blank=True)
    url_dashboard = models.URLField(null=True, blank=True)


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


class Floor(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    img = models.FileField(upload_to=get_floor_path, null=True, blank=True)
    enclosure = models.ForeignKey(Enclosure, related_name='floors', blank=True)
    num_rows = models.PositiveIntegerField(null=True, blank=True)
    num_cols = models.PositiveIntegerField(null=True, blank=True)
    floor_number = models.IntegerField(null=True, blank=True)
    imgB = models.FileField(upload_to=get_floor_path_b, null=True, blank=True)

    # por defecto, si eliminamos un lugar también se eliminan todos sus mapas

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


class LabelCategory(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False)
    img = models.FileField(upload_to=get_label_category_path, blank=True, null=True)
    color = models.CharField(max_length=50, blank=False)
    icon = models.CharField(max_length=50, blank=True, null=True)
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
        return not self.name_en or (self.name_en.upper() != FIXED_CATEGORIES[0].upper() and \
            self.name_en.upper() != FIXED_CATEGORIES[1].upper())


class Label(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False)
    img = models.FileField(upload_to=get_label_path, blank=True, null=True)
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
    panorama_thumbnail = models.FileField(upload_to=get_panorama_path, null=True, blank=True)
    alwaysVisible = models.NullBooleanField()
    center_x = models.PositiveIntegerField(null=True)
    center_y = models.PositiveIntegerField(null=True)
    isVertical = models.NullBooleanField()
    panorama = models.FileField(upload_to=get_panorama_path, null=True, blank=True)
    coupon = models.FileField(upload_to=get_coupon_path,null=True, blank=True)

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
