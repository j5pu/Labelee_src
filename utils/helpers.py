# -*- coding: utf-8 -*-
from PIL import Image
from django.db.models import Sum

from django.http import HttpResponse
import simplejson
from django.core.serializers import serialize
from django.conf import settings


def responseJSON(**kwargs):
    """
    Devuelve la respuesta del servidor en formato JSON con:

        * errors	- errores al procesar datos inválidos
        * data		- datos devueltos en la respuesta

        e.g.
            response(errors=form.errors, data=place.id) devolverá:

            {
                'errors': {
                    name: ['El lugar indicado ya existe'],
                    img: ['La imágen supera los 25MB']
                },

                'data': 25
            }
    """
    errors = kwargs.get('errors', None)
    data = kwargs.get('data', None)

    return HttpResponse(simplejson.dumps({'errors': errors, 'data': data}))


def slug_to_class_name(slug):
    """
    Recibimos un slug y lo devolvemos formateado para que luego podamos encontrar la
    correspondiente clase con el método getattr([modulo], [nombre_de_clase])

    Xej:
        slug = 'object-category'
        -> 'ObjectCategory'
    """
    sal = ''
    for word in slug.split('-'):
        sal += word.capitalize()

    return sal

def to_dict(model_object):
    """
    Convierte a diccionario cualquier objeto de tipo 'models.Model'

    xej:
    [{'pk': 614, 'model': 'map_editor.point', 'fields': {'row': 15, 'description': None, 'label': 20, 'col': 4, 'floor': 15}}]

    """
    raw = serialize('json', [model_object])
    obj = simplejson.loads(raw)
    return obj[0]


def tx_serialized_json_list(json_list):
    """
    Devuelve un diccionario con {
        id: 12214,
        row: 34,
        ...
    en lugar de {
        pk: 253125,
        fields: {
            row: 34,
            ...
    """
    list = simplejson.loads(json_list)
    tx_list = []
    for el in list:
        d = {}
        d['id'] = el['pk']
        for key,val in el['fields'].items():
            if (isinstance(val, str) or isinstance(val, unicode))and 'img/' in val:
                d[key] = settings.MEDIA_URL + val
            else:
                d[key] = val
        tx_list.append(d)

    return tx_list


def queryset_to_dict(queryset_object):
    """
    Recibe un objeto como resultado de una consulta usando el ORM de Django y
    lo transforma en un diccionario
    """
    serialized = serialize('json', queryset_object)
    return tx_serialized_json_list(serialized)


def group_by_pk(queryset_response):
    return queryset_response.values().annotate(total=Sum('id'))


import string
import random
def random_string_generator(size=6, chars=string.ascii_uppercase + string.digits):
    """
    id_generator()
    'G5G74W'
    id_generator(3, "6793YUIO")
    'Y3U'
    """
    return ''.join(random.choice(chars) for x in range(size))


def delete_file(fileField):
    """
    Elimina la imágen del campo para el modelo. Por ejemplo sobre Point.coupon:

    """
    if fileField.name:
        storage, path = fileField.storage, fileField.path
        storage.delete(path)


def resize_img_width(img_path, fixed_width):
    """
    Redimensiona una imágen dado el ancho deseado y la ruta donde queremos guardarla
    """
    img = Image.open(img_path)
    if img.size[0] != fixed_width:
        wpercent = (fixed_width / float(img.size[0]))
        hsize = int((float(img.size[1]) * float(wpercent)))
        img = img.resize((fixed_width, hsize), Image.ANTIALIAS)
        img.save(img_path)

def resize_img_height(img_path, fixed_height):
    img = Image.open(img_path)
    if img.size[1] != fixed_height:
        hpercent = (fixed_height / float(img.size[1]))
        wsize = int((float(img.size[0]) * float(hpercent)))
        img = img.resize((wsize, fixed_height), Image.ANTIALIAS)
        img.save(img_path)


def t_obj_to_dict(tastypieResource, obj):
    """
    Con tastypie ransforma en un diccionario el objeto devuelto por el ORM de django
    """
    bundle = tastypieResource.build_bundle(obj)
    dic = tastypieResource.full_dehydrate(bundle).data
    return dic

def t_queryset_to_dict(tastypieResource, queryset):
    """
    ransforma en una lista de diccionarios la queryset devuelta por el ORM
    """
    bundles = [tastypieResource.build_bundle(obj=q) for q in queryset]
    data = [tastypieResource.full_dehydrate(bundle).data for bundle in bundles]
    return data

if __name__ == "__main__":
    pass
