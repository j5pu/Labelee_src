# -*- coding: utf-8 -*-

from django.http import HttpResponse
from django.utils.translation import gettext
import simplejson
from dashboard.models import Qr_shot
from dashboard.utils import getChartSkeleton
from map_editor.api_2.utils.label import getLabelsForDashboard, filterAsPois
from map_editor.api_2.utils.label_category import getLabelCategories, filterAsValidCategories
from map_editor.models import LabelCategory, Point, Label
from django.db.models import Count
from utils.constants import USER_GROUPS
from utils.helpers import queryset_to_dict


def manager(request, enclosure_id=None):
    """
    /coupon/manager

    Contenido para el index del administrador de cupones
    """
    manager = {}

    labels = None
    if request.user.is_in_group(USER_GROUPS['shop_owners']):
        manager['for_shop_owner'] = True
        labels = Label.objects.filter(owner=request.user)
    elif request.user.is_in_group(USER_GROUPS['enclosure_owners']):
        manager['for_enclosure_owner'] = True
        l = Label.objects.filter(category__enclosure__owner=request.user)
        labels = filterAsPois(l)
    elif request.user.is_staff:
        manager['for_staff'] = True
        labels = Label.objects.all()

    manager['title'] = gettext('Mis cupones') if len(labels) > 1 \
        else gettext('Mi cupón')

    manager['coupons'] = []
    for label in labels:
        point_for_label = None if not label.points.all() else label.points.all()[0]
        coupon = {
            'point': None if not point_for_label else queryset_to_dict([point_for_label])[0],
            'label': queryset_to_dict([label])[0],
            'enclosure': queryset_to_dict([label.category.enclosure])[0]
        }
        manager['coupons'].append(coupon)

    return HttpResponse(simplejson.dumps(manager), mimetype='application/json')


def coupon(request, label_id):
    """
    /label/<label_id>
    """
    label = Label.objects.get(pk=label_id)
    point_for_label = None if not label.points.all() else label.points.all()[0]
    coupon = {
        'point': None if not point_for_label else queryset_to_dict([point_for_label])[0],
        'label': queryset_to_dict([label])[0],
        'enclosure': queryset_to_dict([label.category.enclosure])[0]
    }

    return HttpResponse(simplejson.dumps(coupon), mimetype='application/json')