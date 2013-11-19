from django.db import models
from django.utils import timezone
import datetime
# print timezone.now()
# timezone.make_aware(datetime.datetime.now(),timezone.get_default_timezone())





class Qr_shot(models.Model):
    point = models.ForeignKey('map_editor.Point', related_name='qr_shots')
    date = models.DateTimeField()
    # date = models.DateTimeField(default=timezone.make_aware(datetime.datetime.now(),timezone.get_default_timezone()))
    # date = timezone.make_aware(datetime.datetime.now(),timezone.get_default_timezone()))

class DisplayedRoutes(models.Model):
    origin = models.OneToOneField('map_editor.Point', related_name='displayed_origin')
    destination = models.OneToOneField('map_editor.Point', related_name='displayed_destination')
    date = models.DateTimeField(auto_now_add=True)


class AnalyticAction(models.Model):
    userkey = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

class CategoryShot(AnalyticAction):
    category = models.ForeignKey('map_editor.LabelCategory', related_name='category_shots')

