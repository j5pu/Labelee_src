from django.db import models

# Create your models here.


class route(models.Model):
    origin = models.ForeignKey('map_editor.point', related_name='+')
    destiny = models.ForeignKey('map_editor.point', related_name='+')

    def __unicode__(self):
        return self.name


class step(models.Model):
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
    route = models.ForeignKey(route)
    floor = models.ForeignKey('map_editor.Floor')


class connection(models.Model):
    init = models.ForeignKey('map_editor.point', related_name='+')
    end = models.ForeignKey('map_editor.point', related_name='+')



