import os


def get_user_logo_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/users/%s/logo%s' % (instance.id, fileExtension)


def get_enclosure_logo_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/logo%s' % (instance.id, fileExtension)


def get_floor_path(instance, filename):
    """
    img/enclosures/[encl_id]/floors/[floor_id].ext
	xej: img/enclosures/25/floors/167.png
	"""
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/floors/%s%s' % (instance.enclosure.id, instance.id, fileExtension)


def get_label_category_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/label_categories/%s%s' % (instance.name, fileExtension)


def get_label_path(instance, filename):
    """
    img/labels/restaurante/rodilla.png
    """
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/labels/%s/%s%s' % (instance.category.name, instance.name, fileExtension)


def get_panorama_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/panoramas/%s%s' % (instance.floor.enclosure.id, instance.id, fileExtension)


def get_coupon_path(instance, filename):
    fileName, fileExtension = os.path.splitext(filename)
    return 'img/enclosures/%s/coupons/%s%s' % (instance.floor.enclosure.id, instance.id, fileExtension)