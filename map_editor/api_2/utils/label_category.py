# -*- coding: utf-8 -*-

#
# Funciones de utilidad
#
from django.db.models import Q, Sum
from map_editor.models import LabelCategory, Point
from utils.helpers import queryset_to_dict

def getLabelCategories(enclosure_id):
    return LabelCategory.objects.filter(
        Q(enclosure__id=None) |
        Q(enclosure__id=enclosure_id)
    )


def read_only_valid_for_enclosure(enclosure_id):
    """
    Devuelve las categorías válidas para el recinto dado
    """

    ## TODO: esto no lo he borrado de momento al hacer la asignación de categorías en base de datos, porque depende de
    ## cada enclosure. Son las categorías que se muestran arriba a la derecha del mapa. Habría que hacer otra tabla
    ## y complicar algo más el diseño

    return LabelCategory.objects.filter(
        Q(labels__points__floor__enclosure__id = enclosure_id)
        &
        Q(enclosure__id = enclosure_id)
    ).exclude(
        name_en = 'Blockers'
    ).exclude(
        name_en = 'Toilet'
    ).exclude(
        name_en = 'Intermediate'
    ).exclude(
        name_en = 'Parking'
    ).exclude(
        name_en = 'Entrance'
    ).exclude(
        name_en = 'Connectors'
    ).annotate(total=Sum('id'))
