# -*- coding: utf-8 -*-


from map_editor.models import Label, FIXED_CATEGORIES


def getLabelsForDashboard(enclosure_id):
    labels = Label.objects.filter(category__enclosure_id=enclosure_id)
    return filterAsPois(labels)


def filterAsPois(labels):
    """
    Aplica filtros para sacar sólo aquellas etiquetas que sean consideradas POIs
    """
    return labels.exclude(
        category = 1
    ).exclude(
        category__name_en = FIXED_CATEGORIES[2]
    ).exclude(
        category__name_en = FIXED_CATEGORIES[3]
    ).exclude(
        points__qr_code = None
    )