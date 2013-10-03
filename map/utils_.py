from django.db.models import Q
from django.core.cache import cache

from map_editor.api.resources import *
from map_editor.api_2.utils.label_category import read_only_valid_for_enclosure
from map_editor.models import Point
from utils.helpers import queryset_to_dict, t_obj_to_dict


def get_map_data(qr_type, poi_id, poisByFloor, enclosure_id, coupons):
    """
    Devuelve un diccionario con todos los datos necesarios a usar por el JS
    """
    response = {}
    qrPoint = Point.objects.select_related('floor', 'floor__enclosure', 'floor__enclosure__floors').get(pk=poi_id)
    response['qrPoint'] = {
        'point': t_obj_to_dict(PointResource(), qrPoint),
        'floor': t_obj_to_dict(FloorResource(), qrPoint.floor),
        'enclosure': t_obj_to_dict(EnclosureResource(), qrPoint.floor.enclosure),
        'label': t_obj_to_dict(LabelResource(), qrPoint.label),
        'labelCategory': queryset_to_dict([qrPoint.label.category])[0],
    }
    response['qrPoint']['isParking'] = qrPoint.label.category.name_en == FIXED_CATEGORIES[3]
    response['label_categories'] = queryset_to_dict(read_only_valid_for_enclosure(qrPoint.floor.enclosure.pk))
    response['floors'] = queryset_to_dict(qrPoint.floor.enclosure.floors.all().order_by('-floor_number'))
    for floor in response['floors']:
        floor['pois'] = poisByFloor[floor['id']]
    response['coupons'] = coupons

    return response

def get_incompatible_map_data(poisByFloor, enclosure_id):
    """
    Returns dictionary with the data needed for incompatible-mode devices
    """
    response = {}
    response['enclosure'] = enclosure_id
    response['floors'] = queryset_to_dict(Floor.objects.filter(enclosure = enclosure_id).order_by('-floor_number').all())
    for floor in response['floors']:
        floor['pois'] = poisByFloor[floor['id']]

    return response

def cache_show_map(enclosure_id):
    """
    Cachea el recinto dado para mostrar su mapa y devuelve lo almacenado
    """
    poisByFloor = {}
    categories = {}
    colors = {}
    icons = {}
    coupons = {}
    cache_key = 'show_map_enclosure_' + enclosure_id
    cache_time = 43200
    cacheEnclosure = cache.get(cache_key)
    if not cacheEnclosure:
        # cacheamos cupones
        for label in Label.objects.filter(category__enclosure__id=enclosure_id):
            site_coupons = CouponForLabel.objects.filter(label=label)
            coupons[label.id] = queryset_to_dict(site_coupons)

        points = Point.objects.select_related('label', 'label__category', 'floor', 'coupon') \
            .filter(~Q(label__category__name_en=FIXED_CATEGORIES.values()[0]),
                    floor__enclosure__id=enclosure_id) \
            .order_by('label__category__name', 'description', 'label__name')

        # Avoid saving in cache non-existent enclosures
        if len(points) == 0:
            return {}

        for point in points:
            poi = queryset_to_dict([point])[0]
            if point.floor.id in poisByFloor:
                poisByFloor[point.floor.id].append(poi)
            else:
                poisByFloor[point.floor.id] = [poi]
            poiIndex = poisByFloor[point.floor.id].index(poi)
            poisByFloor[point.floor.id][poiIndex]['label'] = queryset_to_dict([point.label])[0]
            poisByFloor[point.floor.id][poiIndex]['label']['category'] = queryset_to_dict([point.label.category])[0]

            if point.label.category.is_visible_menu:
                if point.label.category.name in categories:
                    categories[point.label.category.name].append(point)
                else:
                    colors[point.label.category.name] = point.label.category.color
                    icons[point.label.category.name] = point.label.category.icon
                    categories[point.label.category.name] = [point]

        categories_list = []  # [{'name': 'toilets', 'items': [...]}, ...]
        for key, value in categories.iteritems():
            d = {
                'name': key,
                'items': value
            }
            categories_list.append(d)

        from operator import itemgetter

        ordered_categories = sorted(categories_list, key=itemgetter('name'))

        enclosure = Enclosure.objects.filter(id=enclosure_id)
        cacheEnclosure = {
            'poisByFloor': poisByFloor,
            'ordered_categories': ordered_categories,
            'colors': colors,
            'icons': icons,
            'coupons': coupons,
            'enclosure':enclosure
        }
        cache.set(cache_key,cacheEnclosure,cache_time)
    else:
        poisByFloor = cacheEnclosure['poisByFloor']
        ordered_categories = cacheEnclosure['ordered_categories']
        colors = cacheEnclosure['colors']
        icons = cacheEnclosure['icons']
        coupons = cacheEnclosure['coupons']
        enclosure = cacheEnclosure['enclosure']

    return {
        'poisByFloor': poisByFloor,
        'ordered_categories': ordered_categories,
        'colors': colors,
        'icons': icons,
        'coupons': coupons,
        'enclosure': enclosure,
    }


