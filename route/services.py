from django.http import HttpResponse
from django.core import serializers
from django.db.models import Sum

from route.models import *
from map_editor.models import *
import simplejson
from route.models import Step

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

#Obtienen todos los pasos para generar los heatmaps de un recinto
def getHeatMapSteps(enclosure_id):
    sql = "select steps.id , route.routeid,route.times,steps.step_number ,steps.row,steps.`column`, " \
          "(select flo.name from map_editor_floor  flo where flo.id = steps.floor_id) floorname, " \
          "steps.floor_id " \
          "from route_step steps, " \
          "(select " \
          "(select route.id from route_route route where route.origin_id = disp.origin_id and route.destiny_id = disp.destination_id) as routeid, " \
          "origin_id, destination_id ,  count(*) as times " \
          "from dashboard_displayedroutes disp group by disp.origin_id,disp.destination_id) route " \
          "where " \
          "steps.route_id=route.routeid " \
          "and steps.floor_id in (select flo.id from map_editor_floor flo where flo.enclosure_id=%s )" % enclosure_id
    routeSteps = {}
    prevStep = None
    times = 0
    for currentStep in Step.objects.raw(sql):
        if prevStep is None:
            prevStep = currentStep
            times = currentStep.times
            addStepToDict(routeSteps, currentStep.floorname, currentStep,times)
        else:
            if prevStep.floorname == currentStep.floorname and prevStep.routeid == currentStep.routeid:
                for intermediateStep in reversed(getIntermediateSteps(prevStep, currentStep)):
                    addStepToDict(routeSteps, currentStep.floorname, intermediateStep,times)
            else:
                if prevStep.routeid != currentStep.routeid:
                    times = currentStep.times
                addStepToDict(routeSteps, currentStep.floorname, currentStep,times)
            prevStep = currentStep

    return routeSteps

#Anade un paso al diccionario que sera utilizado para generar un heatmap
def addStepToDict(dic, key, step,times):
    stepKey = str(step.column) + '_' + str(step.row)
    floorKey = str(key)
    if floorKey not in dic:
        dic[floorKey] = {}

    if stepKey in dic[floorKey]:
        currentCount = int(dic[floorKey][stepKey]["count"]) + times
        dic[floorKey][stepKey]["count"] = str(currentCount)
    else:
        dic[floorKey][stepKey] = {'x': str(step.column), 'y': str(step.row), 'count': str(times)}

#obtiene los pasos intermedios entre dos puntos (el punto destino esta  incluido)
def getIntermediateSteps(prevStep, currentStep):
    intermediateSteps = [];
    x_increment, y_increment = getDiffs(prevStep, currentStep)
    while abs(x_increment) != 0 or abs(y_increment) != 0:
        step = Step()
        step.column, x_increment = getCoordinate(prevStep.column, x_increment)
        step.row, y_increment = getCoordinate(prevStep.row, y_increment)
        intermediateSteps.append(step)

    return intermediateSteps

#incrementa o decrementa el valor de una coordenada segun un incremento dado, este puede ser positivo o negativo
def getCoordinate(value, increment):
    value += increment
    if increment > 0:
        increment -= 1
    elif increment < 0:
        increment += 1
    return (value, increment)

#calcula la diferencia entre las coordenadas x e y de dos puntos
def getDiffs(stepOrigin, stepDestination):
    x_diff = stepDestination.column - stepOrigin.column
    y_diff = stepDestination.row - stepOrigin.row

    return (x_diff, y_diff)