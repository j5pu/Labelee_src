from django.http import HttpResponse
from django.core import serializers
from django.db.models import Sum

from route.models import *
from map_editor.models import *
import simplejson

from utils.helpers import to_dict



def get_route(request, origin, destiny):
    """
    origin = id del Point origen
    """
    route_model = Route.objects.filter(origin__id=origin, destiny__id=destiny)[0]

    route_dict = to_dict(route_model)
    route_dict['fields']['origin'] = to_dict(route_model.origin)
    route_dict['fields']['destiny'] = to_dict(route_model.destiny)

    if route_model.origin.floor == route_model.destiny.floor:
        route_steps_dict = route_dict['fields']['steps'] = []
        for step in route_model.steps.all():
            route_steps_dict.append(to_dict(step))
    else:
        route_floors_dict = route_dict['fields']['subroutes'] = []
        route_floors_model = Floor.objects.filter(steps__route__id=route_model.id).annotate(total=Sum('id'))

        # metemos plantas
        for floor in route_floors_model:
            subroute = {
                'floor': to_dict(floor),
                'steps': []
            }
            route_floors_dict.append(subroute)

        # metemos steps de cada planta
        for floor in route_floors_dict:
            steps = Step.objects.filter(floor__id=floor['floor']['pk'], route__id=route_model.id)
            for step in steps:
                floor['steps'].append(to_dict(step))


    return HttpResponse(simplejson.dumps(route_dict), mimetype='application/json')