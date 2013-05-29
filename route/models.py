from django.db import models

# Create your models here.


class Route(models.Model):
    origin = models.ForeignKey('map_editor.Point', related_name='+')
    destiny = models.ForeignKey('map_editor.Point', related_name='+')

    def __unicode__(self):
        return 'tabla ruta'


class Step(models.Model):
    NORMAL = 'NOR'
    ESCALERA = 'ESC'
    ASCENSOR = 'ASC'
    STEP_CATEGORY = {
        (NORMAL, 'NORMAL'),
        (ESCALERA, 'ESCALERA'),
        (ASCENSOR, 'ASCENSOR')
    }
    step_category = models.CharField(max_length=3, choices=STEP_CATEGORY, default=NORMAL)
    step_number = models.PositiveIntegerField()
    row = models.PositiveIntegerField()
    column = models.PositiveIntegerField()
    route = models.ForeignKey(Route, related_name='steps')
    floor = models.ForeignKey('map_editor.Floor')


class Connection(models.Model):
    init = models.OneToOneField('map_editor.Point', related_name='map_connection', on_delete=models.CASCADE)
    end = models.ForeignKey('map_editor.Point', related_name='+', on_delete=models.CASCADE)



