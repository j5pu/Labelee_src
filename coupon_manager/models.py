# -*- coding: utf-8 -*-

import os
from django.db import models
from map_editor.models import Enclosure
from utils.helpers import delete_file


def get_coupon_img_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/coupons/enclosure/%s%s' % (instance.enclosure.id, instance.id, fileExtension)

class Coupon(models.Model):
    name = models.CharField(max_length=60, blank=True, null=True)
    img = models.FileField(upload_to=get_coupon_img_path, blank=True, null=True)

    # Si elimino un recinto también se eliminarán todos sus copones
    enclosure = models.ForeignKey(Enclosure, related_name='coupons', blank=True, null=True, on_delete=models.CASCADE)

    def __unicode__(self):
        return self.name

    def delete(self, *args, **kwargs):
        """
        Eliminamos la imagen del cupón también
        """
        delete_file(self.img)
        super(Coupon, self).delete(*args, **kwargs)
