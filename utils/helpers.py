# -*- coding: utf-8 -*-
from django.db.models import Sum

from tastypie.models import ApiKey
from django.http import HttpResponse
import simplejson
from django.core.serializers import serialize
import settings


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


def create_api_key(user):
    try:
        api_key = ApiKey.objects.get(user=user)
        api_key.key = None
        api_key.save()

    except ApiKey.DoesNotExist:
        api_key = ApiKey.objects.create(user=user)


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
            if isinstance(val, str) and 'img/' in val:
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
    storage, path = fileField.storage, fileField.path
    storage.delete(path)


if __name__ == "__main__":
    pass
