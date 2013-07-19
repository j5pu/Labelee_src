from django.db import models


class Qr_shot(models.Model):
    point = models.ForeignKey('map_editor.Point', related_name='point')
    date = models.DateTimeField()

class DisplayedRoutes(models.Model):
    origin = models.ForeignKey('map_editor.Point', related_name='origin')
    destination = models.ForeignKey('map_editor.Point', related_name='destination')
    date = models.DateTimeField(auto_now_add=True)

