# -*- coding: utf-8 -*-

from django.http import HttpResponse
from django.utils.translation import gettext
import simplejson
import coupon_manager
from coupon_manager.models import CouponForLabel
from coupon_manager.utils_ import get_coupons_for_sites, get_enclosures, get_coupons_for_enclosure
from map_editor.models import LabelCategory, Point, Label, Enclosure
from utils.constants import USER_GROUPS
from utils.helpers import queryset_to_dict


def manager(request, enclosure_id=None):
    """
    /coupon/manager

    Contenido para el index del administrador de cupones
    """
    is_shop_owner = request.user.is_in_group(USER_GROUPS['shop_owners'])
    is_enclosure_owner = request.user.is_in_group(USER_GROUPS['enclosure_owners'])

    manager = {}
    if is_shop_owner:
        manager['for_shop_owner'] = True
        labels = Label.objects.filter(owner=request.user)
        manager['coupons'] = get_coupons_for_sites(labels)
    elif is_enclosure_owner:
        manager['for_enclosure_owner'] = True
        enclosures = Enclosure.objects.filter(owner=request.user)
        manager['enclosures'] = get_enclosures(enclosures)
    elif request.user.is_staff:
        manager['for_staff'] = True
        # labels = Label.objects.all()
        enclosures = Enclosure.objects.all()
        manager['enclosures'] = get_enclosures(enclosures)

    # manager['title'] = gettext('Mis cupones') if len(labels) > 1 \
    #     else gettext('Mi cupón')

    return HttpResponse(simplejson.dumps(manager), mimetype='application/json')


def coupons_for_site(request, site_id):
    """
    Devuelve todos los cupones para el site dado
    """
    coupons = CouponForLabel.objects.filter(label__id=site_id)
    return HttpResponse(simplejson.dumps(queryset_to_dict(coupons)), mimetype='application/json')


def coupons_for_enclosure(request, enclosure_id):
    coupons = get_coupons_for_enclosure(Enclosure.objects.get(pk=enclosure_id))
    return HttpResponse(simplejson.dumps(coupons), mimetype='application/json')
