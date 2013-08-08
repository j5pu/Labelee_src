from coupon_manager.models import Coupon
from map_editor.api.resources import CouponResource
from map_editor.api_2.utils.label import filterForCouponManager
from map_editor.models import Label
from utils.helpers import queryset_to_dict


def get_coupons_for_labels(labels):
    """
    Devuelve la lista de cupones dadas sus etiquetas
    """
    coupons = []
    for label in labels:
        point_for_label = None if not label.points.all() else label.points.all()[0]
        coupon = {
            'point': None if not point_for_label else queryset_to_dict([point_for_label])[0],
            'label': queryset_to_dict([label])[0],
            # 'enclosure': queryset_to_dict([label.category.enclosure])[0]
        }
        coupons.append(coupon)

    return coupons


def get_enclosures(enclosures):
    """
    Devuelve la lista de recintos con sus cupones
    """
    enclosures_list = []
    for enclosure in enclosures:
        enclosure_dict = queryset_to_dict([enclosure])[0]
        l = Label.objects.filter(category__enclosure=enclosure)
        labels = filterForCouponManager(l)
        shop_coupons = get_coupons_for_labels(labels)
        enclosure_dict['shop_coupons'] = shop_coupons
        enclosure_dict['enclosure_coupons'] = get_coupons_for_enclosure(enclosure)
        enclosures_list.append(enclosure_dict)

    return enclosures_list


def get_coupons_for_enclosure(enclosure):
    coupons = Coupon.objects.filter(enclosure=enclosure)
    coupon_list = []
    for coupon in coupons:
        bundle = CouponResource().build_bundle(coupon)
        coupon_dict = CouponResource().full_dehydrate(bundle).data
        coupon_list.append(coupon_dict)

    return coupon_list