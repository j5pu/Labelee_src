from django.http import HttpResponse
from django.core import serializers
from django.db.models import Sum

from route.models import *
from map_editor.models import *
import simplejson

from utils.helpers import to_dict

def step_filter(step_model):
    """ Filters unnecessary fields for the client of Step object """
    step_result = {}
    step_result['fields'] = {}
    step_result['fields']['column'] = step_model['fields']['column']
    step_result['fields']['row'] = step_model['fields']['row']
    return step_result

def floor_filter(floor_model):
    """ Filters unnecessary fields for the client of Floor object """
    floor_result = {}
    floor_result['pk'] = floor_model['pk']
    return floor_result


def get_route(request, origin, destiny):
    """
    origin = id del Point origen
    """
    route_model = Route.objects.filter(origin__id=origin, destiny__id=destiny)[0]

    route_dict = {}
    route_dict['fields'] = {}
    route_dict['fields']['origin'] = to_dict(route_model.origin)
    route_dict['fields']['destiny'] = to_dict(route_model.destiny)

    route_floors_dict = route_dict['fields']['subroutes'] = []

    if route_model.origin.floor == route_model.destiny.floor:
        subroute = {
            'floor': floor_filter(to_dict(route_model.origin.floor)),
            'steps': []
        }
        route_floors_dict.append(subroute)
        for step in route_model.steps.all():
            route_floors_dict[0]['steps'].append(step_filter(to_dict(step)))
    else:
        route_floors_model = Floor.objects.filter(steps__route__id=route_model.id).annotate(total=Sum('id'))

        # metemos plantas
        for floor in route_floors_model:
            subroute = {
                'floor': floor_filter(to_dict(floor)),
                'steps': []
            }
            route_floors_dict.append(subroute)

        # metemos steps de cada planta
        for floor in route_floors_dict:
            steps = Step.objects.filter(floor__id=floor['floor']['pk'], route__id=route_model.id)
            for step in steps:
                floor['steps'].append(step_filter(to_dict(step)))


    return HttpResponse(simplejson.dumps(route_dict), mimetype='application/json')