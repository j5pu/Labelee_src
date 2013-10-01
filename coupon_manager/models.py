# -*- coding: utf-8 -*-

import os
from django.db import models
from map_editor.models import Enclosure, Label
from utils.helpers import delete_file, resize_img_width


def get_coupon_img_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)

    if hasattr(instance, 'enclosure'):
        return 'img/enclosures/%s/coupons/%s%s' % \
               (instance.enclosure.id, instance.id, fileExtension)
    if hasattr(instance, 'label'):
        return 'img/enclosures/%s/coupons/%s/%s%s' % \
               (instance.label.category.enclosure.id, instance.label.id,
                instance.id, fileExtension)

class Coupon(models.Model):
    name = models.CharField(max_length=60, blank=True, null=True)
    img = models.FileField(upload_to=get_coupon_img_path, blank=True, null=True)

    class Meta:
        abstract = True

    def __unicode__(self):
        return self.name

    def save(self, *args, **kwargs):
        """
        Cada vez que guardamos el cupón comprobamos que su imágen se redimensionó
        """
        if self.img:
            resize_img_width(self.img.path, 350)
        super(Coupon, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        Eliminamos la imagen del cupón también
        """
        delete_file(self.img)
        super(Coupon, self).delete(*args, **kwargs)


class CouponForEnclosure(Coupon):
    # Si elimino un recinto también se eliminarán todos sus cupones
    enclosure = models.ForeignKey(Enclosure, related_name='coupons', blank=True, null=True, on_delete=models.CASCADE)

    def __unicode__(self):
        return super(Coupon, self).name


class CouponForLabel(Coupon):
    label = models.ForeignKey(Label, related_name='coupons', blank=True, null=True, on_delete=models.CASCADE)

    def __unicode__(self):
        return super(Coupon, self).name