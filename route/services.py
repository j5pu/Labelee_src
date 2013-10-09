# -*- coding: utf-8 -*-
import datetime
from django.http import HttpResponse
from dashboard.models import DisplayedRoutes
from log.logger import Logger
from map_editor.api.resources import PointResource

from route.models import *
from map_editor.models import *
import simplejson
from route.models import Step

from utils.helpers import to_dict, t_queryset_to_dict

from django.utils.translation import ugettext as _

class StepsExplanation:
    """
    Generates text explanations for subroutes in a route. The result for every subroute except the last is:
          "Ve hacia [connector] y [baja/sube] al piso [floor_number]"
    The explanation for the last subroute is:
          "Sigue la ruta hacia tu destino"
    """

    FIRST_SUBROUTE_INITS = (_("Ve hacia"),
                            _(u"Dirígete a")) #TODO: PONER LA TILDE
    initsPointer = 0 # Ensures different inits for variety

    MEDIUM_CONNECTOR = _("y")

    CONNECTION_DIRECTION = {'up': _("sube"),
                            'down': _("baja")}

    GOTO_FLOOR = _("al piso")

    FINAL_SUBROUTE = _("Sigue la ruta hacia tu destino")

    @classmethod
    def getSubrouteDestinationText(cls, step, floorId):
        pointName = Point.objects.filter(
            floor__id=floorId,
            col=step['fields']['column'],
            row=step['fields']['row']
        )[0].description
        destination_text = cls.FIRST_SUBROUTE_INITS[cls.initsPointer] + " " + pointName + " " + cls.MEDIUM_CONNECTOR + " "
        cls.initsPointer = (cls.initsPointer + 1) % len(cls.FIRST_SUBROUTE_INITS)
        return destination_text

    @staticmethod
    def getConnectionDirection(numFloor, newNumFloor):
        # For the moment we assume that connectors always change floor (no travels in time/space!)
        if newNumFloor > numFloor:
            return StepsExplanation.CONNECTION_DIRECTION['up'] + " "
        else:
            return StepsExplanation.CONNECTION_DIRECTION['down'] + " "

    @staticmethod
    def getDestinationFloorText(numFloor):
        return StepsExplanation.GOTO_FLOOR + " " + str(numFloor)

    @staticmethod
    def getLastSubrouteExplanation():
        return StepsExplanation.FINAL_SUBROUTE

    @staticmethod
    def generateExplanations(subroutes):
        #TODO: does it make sense to go to a connection in other floor? Final_subroute text has not meaning then

        # Process subroutes except the last
        for i in range(len(subroutes) - 1):

            floor = Floor.objects.get(pk=subroutes[i]['floor']['pk'])
            numFloor = floor.floor_number
            floorId = floor.id
            nextNumFloor = Floor.objects.get(pk=subroutes[i+1]['floor']['pk']).floor_number

            subroute_destination = StepsExplanation.getSubrouteDestinationText(subroutes[i]['steps'][-1], floorId)
            connection_direction = StepsExplanation.getConnectionDirection(numFloor, nextNumFloor)
            destination_floor = StepsExplanation.getDestinationFloorText(nextNumFloor)

            subroutes[i]['text_description'] = subroute_destination + connection_direction + destination_floor

        # Last subroute
        subroutes[-1]['text_description'] = StepsExplanation.getLastSubrouteExplanation()

        return


def step_filter(step_model):
    """ Filters unnecessary fields for the client of Step object """
    step_result = {}
    step_result['fields'] = {}
    step_result['fields']['column'] = step_model['fields']['column']
    step_result['fields']['row'] = step_model['fields']['row']
    return step_result



def get_route(request, origin, destiny):
    """
    origin = id del Point origen
    """
    route_model = Route.objects.filter(origin__id=origin, destiny__id=destiny)[0]

    route_dict = {}
    route_dict['fields'] = {}
    route_dict['fields']['origin'] = to_dict(route_model.origin)
    route_dict['fields']['destiny'] = to_dict(route_model.destiny)

    subroutes = route_dict['fields']['subroutes'] = []

    route_steps = Step.objects.filter(route_id=route_model.id).order_by('step_number')

    previousFloor = None
    for step in route_steps:

        # For each change of floor, new subroute
        if step.floor_id != previousFloor:
            previousFloor = step.floor_id
            subroute = {
                'floor': {'pk': step.floor_id},
                'steps': [],
                'text_description': ""
            }
            subroutes.append(subroute)

        subroutes[-1]['steps'].append(step_filter(to_dict(step)))

    StepsExplanation.generateExplanations(subroutes)

    # Guardamos la ruta ofrecida para el dashboard
    saveDisplayedRoute(origin, destiny)

    return HttpResponse(simplejson.dumps(route_dict), mimetype='application/json')


def get_closest_point(request, origin, destiny_site_id):
    """
    Dado el site destino, toma su punto destino más cercano al punto origen
    """
    # todo: de momento toma el primer punto del site, sin comparar rutas
    site = Label.objects.get(pk=destiny_site_id)
    points = Point.objects.filter(label__id=destiny_site_id)

    # Si el site pertenece a una categoría genérica..
    if not site.category.enclosure:
        origin_point = Point.objects.get(pk=origin)
        points = points.filter(floor__enclosure=origin_point.floor.enclosure)

    shortest_route = find_shortest_route(origin, points)

    point_dict = t_queryset_to_dict(PointResource(), [shortest_route.destiny])[0]
    return HttpResponse(simplejson.dumps(point_dict), mimetype='application/json')


def find_shortest_route(origin, points):
    """
    Itera sobre los puntos de un site destino para encontrar la ruta más corta
    desde el punto origen.
    """
    shortest_route = None
    for point in points:
        current_route = Route.objects.get(origin__id=origin, destiny=point)
        if shortest_route is None or \
                (shortest_route is not None and current_route.cost < shortest_route.cost):
            shortest_route = current_route

    return shortest_route


def saveDisplayedRoute(origin_id, destination_id):
    try:
        displayedRoute = DisplayedRoutes()
        displayedRoute.origin_id = origin_id
        displayedRoute.destination_id = destination_id
        displayedRoute.date = datetime.datetime.utcnow()
        displayedRoute.save()
    except Exception as ex:
        Logger.error(ex.message)


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