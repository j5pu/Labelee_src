# -*- coding: utf-8 -*-

#
# Funciones de utilidad
#
from django.db.models import Q, Sum
from map_editor.models import LabelCategory, Point
from utils.helpers import queryset_to_dict


def filterAsValidCategories(label_categories):
    """
    Quita las categorías que no queramos considerar como válidas (bloqueantes, etc..
    """
    return label_categories.exclude(
        name_es = 'Bloqueantes'
    ).exclude(
        name_es = 'Intermedias'
    ).exclude(
        name_es = 'Parquing'
    ).exclude(
        name_es = 'Pasillo Parking'
    )


def filterAsMenuCategories(label_categories):
    """
    Quita las categorías que no queramos mostrar en el menú del admin
    """
    return label_categories.exclude(
        name_es = 'Bloqueantes'
    ).exclude(
        name_es = 'Intermedias'
    )


def getLabelCategories(enclosure_id):
    return LabelCategory.objects.filter(
        Q(enclosure__id=None) |
        Q(enclosure__id=enclosure_id)
    )


def getLabelCategoriesForManager(enclosure_id):
    """
    Devuelve la info a mostrar en manager para la lista de categorías de un recinto dado
    """
    categories = getLabelCategories(enclosure_id)

    # categories_valid_grouped = filterAsMenuCategories(categories).distinct()
    categories_valid_grouped = filterAsMenuCategories(categories)
    label_categories = queryset_to_dict(categories_valid_grouped)

    for i in range(len(label_categories)):
        label_categories[i]['poi_count'] = \
            Point.objects \
                .filter(floor__enclosure__id=enclosure_id) \
                .filter(label__category__id=label_categories[i]['id']) \
                .count()

    return label_categories


def read_only_valid_for_enclosure(enclosure_id):
    """
    Devuelve las categorías válidas para el recinto dado
    """
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
