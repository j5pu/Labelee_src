from django.db import models


class Qr_shot(models.Model):
    point = models.ForeignKey('map_editor.Point', related_name='qr_shots')
    date = models.DateTimeField()

class DisplayedRoutes(models.Model):
    origin = models.OneToOneField('map_editor.Point', related_name='displayed_origin')
    destination = models.OneToOneField('map_editor.Point', related_name='displayed_destination')
    date = models.DateTimeField(auto_now_add=True)

