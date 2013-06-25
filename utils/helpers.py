# -*- coding: utf-8 -*-
from django.db.models import Sum

from tastypie.models import ApiKey
from django.http import HttpResponse
import simplejson
from django.core.serializers import serialize


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


def group_by_pk(queryset_response):
    return queryset_response.values().annotate(total=Sum('id'))


if __name__ == "__main__":
    pass
