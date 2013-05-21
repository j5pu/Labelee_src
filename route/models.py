from django.db import models

# Create your models here.


class Route(models.Model):
    origin = models.ForeignKey('map_editor.Point', related_name='+', on_delete=models.CASCADE)
    destiny = models.ForeignKey('map_editor.Point', related_name='+', on_delete=models.CASCADE)

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
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    floor = models.ForeignKey('map_editor.Floor', on_delete=models.CASCADE)


class Connection(models.Model):
    init = models.ForeignKey('map_editor.Point', related_name='+')
    end = models.ForeignKey('map_editor.Point', related_name='+')



