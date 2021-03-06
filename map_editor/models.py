# -*- coding: utf-8 -*-

import os
from django.db import models
# from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User, UserManager, Group
from dashboard.models import DisplayedRoutes
from map_editor.api_2.utils.point import filterAsPois
from file_paths import *
from utils.helpers import delete_file

FIXED_CATEGORIES = {
    0: 'Blockers',
    1: 'Connectors',
    2: 'Intermediate',
    3: 'Parking',
    4: 'Toilet',
    5: 'Panoramas',
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

    def is_in_group(self, group_id):
        users_in_group = Group.objects.get(id=group_id).user_set.all()
        return self.user_ptr in users_in_group

    def is_valid(self):
        """
        Si es staff o, en caso de no serlo, que al menos pertenezca a algún grupo
        """
        return self.is_staff or len(self.groups.all()) > 0

    def create(self, username, password):
        c = CustomUser(username=username)
        c.save()
        c.set_password(password)
        c.save()
        return c

    def assign_group(self, group_id):
        g = Group.objects.get(id=group_id)
        g.user_set.add(self.user_ptr)

    class Meta:
        verbose_name = 'CustomUser'
        verbose_name_plural = 'CustomUsers'


class Enclosure(models.Model):
    name = models.CharField(max_length=60, unique=True, blank=False)
    owner = models.ForeignKey(CustomUser, related_name='enclosures', blank=False)
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
            delete_file(self.img)
        if self.imgB:
            delete_file(self.imgB)

        super(Floor, self).delete(*args, **kwargs)


class LabelCategory(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False)
    img = models.FileField(upload_to=get_label_category_path, blank=True, null=True)
    color = models.CharField(max_length=50, blank=False)
    icon = models.CharField(max_length=50, blank=True, null=True)
    enclosure = models.ForeignKey(Enclosure, related_name='enclosure', blank=True, null=True)
    has_assigned_qr = models.BooleanField(default=True)
    is_connector = models.BooleanField(default=False)
    is_visible_menu = models.BooleanField(default=True)
    is_visible_by_default = models.BooleanField(default=False)
    is_dashboard_category = models.BooleanField(default=True)
    can_have_coupon = models.BooleanField(default=True)

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



class Label(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False)
    img = models.FileField(upload_to=get_label_path, blank=True, null=True)
    # si elimino su categoría o dueño ésta también se elimina
    category = models.ForeignKey(LabelCategory, related_name='labels', blank=True, on_delete=models.CASCADE)
    owner = models.ForeignKey(CustomUser, related_name='labels', blank=True, null=True, on_delete=models.CASCADE)

    def __unicode__(self):
        return self.name

    @property
    def displayed_destination_count(self):
        return self.displayed_destination_count

    @displayed_destination_count.setter
    def displayed_destination_count(self, value):
        self.displayed_destination_count = value

    def delete(self, *args, **kwargs):
        """
        Antes eliminamos:
            - imágen de su cupón (si existe)
            - su usuario, dueño de la etiqueta (tienda)
        """
        points = Point.objects.filter(label__id=self.pk)
        for point in points:
            if point.coupon:
                delete_file(point.coupon)

        user = CustomUser.objects.filter(labels__id=self.pk)
        user.delete()

        super(Label, self).delete(*args, **kwargs)


class Point(models.Model):
    description = models.CharField(max_length=2000, null=True, blank=True)
    row = models.PositiveIntegerField(null=True, blank=True)
    col = models.PositiveIntegerField(null=True, blank=True)
    label = models.ForeignKey(Label, related_name='points', on_delete=models.CASCADE)
    floor = models.ForeignKey(Floor, related_name='points', on_delete=models.CASCADE)
    alwaysVisible = models.NullBooleanField()
    center_x = models.PositiveIntegerField(null=True, blank=True)
    center_y = models.PositiveIntegerField(null=True, blank=True)
    isVertical = models.NullBooleanField()
    panorama = models.FileField(upload_to=get_panorama_path, null=True, blank=True)

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
