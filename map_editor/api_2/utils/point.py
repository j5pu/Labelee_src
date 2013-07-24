# -*- coding: utf-8 -*-

def filterAsPois(points):
    """
    Aplica filtros para sacar sólo aquellos puntos que sean considerados POIs
    """
    return points.exclude(
        label__category = 1
    ).exclude(
        label__category__name_es = 'Intermedias'
    ).exclude(
        label__category__name_es = 'Parquing'
    ).exclude(
        qr_code = None
    )
