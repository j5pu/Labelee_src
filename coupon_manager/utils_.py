# -*- coding: utf-8 -*-

from coupon_manager.models import Coupon, CouponForLabel, CouponForEnclosure
from map_editor.api.resources import CouponForEnclosureResource
from map_editor.models import Label
from utils.helpers import queryset_to_dict


def get_coupons_for_sites(sites):
    """
    Devuelve la lista de sitios con sus respectivos cupones

    [
        {
            'data': {...},
            'coupons': [
                {...},
                ...
            ]
        },
        ...
    ]
    """
    site_list = []
    for site in sites:
        site_dict = {
            'data': queryset_to_dict([site])[0],

            # Nos dice si la etiqueta (site) tiene por lo menos un punto.
            # Esto sirve para avisar al usuario de que, aunque le añadiera un cupón,
            # nadie lo podría ver puesto que no se ha pintado aún con
            # el editor de mapas.
            'has_point': False if not site.points.all() else True
        }
        site_coupons = CouponForLabel.objects.filter(label=site)
        site_dict['coupons'] = queryset_to_dict(site_coupons)
        site_list.append(site_dict)

    return site_list


def get_coupons_for_enclosure(enclosure):
    """
    Devuelve la lista de cupones genéricos para el recinto dado
    """
    coupons = CouponForEnclosure.objects.filter(enclosure=enclosure)
    coupon_list = []
    for coupon in coupons:
        bundle = CouponForEnclosureResource().build_bundle(coupon)
        coupon_dict = CouponForEnclosureResource().full_dehydrate(bundle).data
        coupon_list.append(coupon_dict)

    return coupon_list


def get_enclosures(enclosures):
    """
    Devuelve la lista de recintos, cada uno con sus cupones

    [
        {
            'enclosure_data': {
                'twitter_account': 'Labeleee1',
                'name': 'Equinoccio Center',
                ...
            },
            'sites_coupons': [
                {
                    'site_data': {...},
                    'site_coupons': [
                        {...},
                        ...
                    ]
                },
                ...
            ],
            'enclosure_coupons': [
                {...},
                ...
            ]
        },
        ...
    ]
    """
    enclosures_list = []
    for enclosure in enclosures:
        enclosure_dict = {
            'data': queryset_to_dict([enclosure])[0]
        }
        sites = Label.objects.filter(category__enclosure=enclosure, category__can_have_coupon=True)
        enclosure_dict['sites'] = get_coupons_for_sites(sites)
        enclosure_dict['coupons'] = get_coupons_for_enclosure(enclosure)
        enclosures_list.append(enclosure_dict)

    return enclosures_list


