from django.http import HttpResponse

from django.core import serializers

from route.models import *

def get_route(request, origin, destiny):
    """
    origin = id del Point origen
    """
    steps = Step.objects.filter(route__origin__id=origin).filter(route__destiny__id=destiny)

    steps_json = serializers.serialize('json', steps)
    return HttpResponse(steps_json, mimetype='application/json')