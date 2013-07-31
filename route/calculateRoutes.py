# coding=utf-8
import threading

from django.core.mail import EmailMessage
from django.db import transaction
from django.http import *
from django.utils.translation import gettext as _

from map_editor.models import *
from route.models import *
from route.pathfinding.dijkstra import Dijkstra

#import cProfile
import time

from log.logger import Logger

LIMIT_PER_BULK_SAVE = 30000

class RouteInconsistencyException(Exception):
    pass

class StepIterator:
    """ Iterates over single steps in a route, looking for lines
    in order to give larger steps

    For instance, given the following route

                                    [4,2] [5,2] [6,2]

                              [3,1]
               ------>
           [0,0], [1,0], [2,0]

    the iterator would yield [0,0], [2,0], [4,2] and [6,2]

    Attributes:
        single_steps : list of all points in a route
        current_point : index of the current point in the list
    """

    def __init__(self, single_steps):
        self.single_steps = single_steps

    def __iter__(self):
        self.current_point = None
        return self

    @staticmethod
    def getCoordinatedPoint(point):
        row, column, floor = point.split('_')
        return {'x': int(column), 'y': int(row), 'floor': int(floor)}

    @staticmethod
    def getDirection(point1, point2):
        x_diff = point2['x'] - point1['x']
        y_diff = point2['y'] - point1['y']

        if not (abs(x_diff) == 1 or abs(y_diff) == 1) or (x_diff == 0 and y_diff == 0):
            raise RouteInconsistencyException()

        return (x_diff, y_diff)

    @staticmethod
    def isPointInLine(point, origin, direction):
        x_increment, y_increment = direction
        return (origin['floor'] == point['floor']) and \
               (origin['x'] + x_increment == point['x'] and origin['y'] + y_increment == point['y'])

    def _findLineEnd(self):
        point1 = self.getCoordinatedPoint(self.single_steps[self.current_point])
        point2 = self.getCoordinatedPoint(self.single_steps[self.current_point + 1])

        # A change of floor yields the next point directly
        if point1['floor'] != point2['floor']:
            self.current_point += 1
        else:
            direction = self.getDirection(point1, point2)
            self.current_point += 1
            while self.current_point + 1 < len(self.single_steps):
                point1 = point2
                point2 = self.getCoordinatedPoint(self.single_steps[self.current_point + 1])

                if not self.isPointInLine(point2, point1, direction):
                    return self.single_steps[self.current_point]

                self.current_point += 1

        return self.single_steps[self.current_point]

    def next(self):
        # The first step is the first point
        if self.current_point == None:
            self.current_point = 0
            return self.single_steps[0]
        elif self.current_point + 1 == len(self.single_steps):
            raise StopIteration

        # The next step is at the end of a line
        return self._findLineEnd()





def calculate_routes(request, enclosure_id):

    try:
        t1 = threading.Thread(target=threadCalculateRoute, args=[enclosure_id])
        t1.start()

        # Code to perform performance analysis
        #cProfile.runctx('threadCalculateRoute("16")', globals(), locals())

    except Exception as ex:
        print type(ex)
        print ex.args

    return HttpResponse(_('Se están calculando las rutas'))


def threadCalculateRoute(enclosure_id):
    """

    :param enclosure_id:
    """
    errors = []

    Logger.info('Calculating routes for enclosure with id=' + str(enclosure_id))
    initial_time = time.clock()


    #creo el sql para sleccionar todas las rutas del recinto
    sql = "select * from route_route where origin_id in  " \
          "( SELECT id FROM map_editor_point where floor_id in " \
          "(select id from map_editor_floor where map_editor_floor.enclosure_id = %s))" % enclosure_id
    try:
        ids = []
        #ejecuto la select
        currentroutes = Route.objects.raw(sql)
        ###
        #Elimino todas las rutas del recinto
        for route in currentroutes:
            ids.append(route.id)

        Route.objects.filter(id__in=ids).delete()
        ##
        #obtengo todos los puntos del recinto(muros, tiendas ...)
        floors = Floor.objects.filter(enclosure_id=enclosure_id)
        floorIds = []
        for floor in floors:
            floorIds.append(floor.id)

        # Get all needed related information of points in a single db hit performing a join. This avoids to query the database
        # several times for each point
        points = list(Point.objects.select_related('label', 'label__category', 'qr_code', 'floor').filter(floor_id__in=floorIds))
        ###
        qrlist = [] #qrs
        walls = [] #muros
        mapConnections = {} #Aristas

        for point in points:
            if hasattr(point, 'qr_code'):
                #meto en una lista todos los qrs
                qrlist.append(point.qr_code)

            if point.label.category.name_en.upper() in FIXED_CATEGORIES[0].upper():
                walls.append(Dijkstra.getKey(point.row, point.col, point.floor.id))

            #me creo un grafo (diccionario) para las conexiones; ej 1_1_1 : 1_2_1,1_3_1
            #significa que desde el qr 1_1_1 p
            if point.label.category.name_en.upper() in FIXED_CATEGORIES[1].upper(): # only connectors
                pmapconnections = Connection.objects.filter(init__id=point.id)
                for pmapconnection in pmapconnections:
                    keyinit = Dijkstra.getKey(point.row, point.col, point.floor.id)
                    keyend = Dijkstra.getKey(pmapconnection.end.row, pmapconnection.end.col, pmapconnection.end.floor.id)
                    if keyinit in mapConnections:
                        mapConnections[keyinit].append(keyend)
                    else:
                        mapConnections[keyinit] = [keyend]

        #Creo el objeto que calculará los caminos mediante dijkstra; parametros: las plantas, los muros,los qr y las conexiones
        pathfinder = Dijkstra(floors, walls, qrlist, mapConnections)

        #ejecuto dikjstra para calcular los caminos, también tiene un parametro que indica los errores que se han producido en dicho cálculo
        #importante no meter conexiones que se conectan consigo mismas, es decir un ascensor no puede estar conectado consigo mismo.
        pre_dijkstra_time = time.clock()
        paths = pathfinder.calculateDijkstra(errors)
        post_dijkstra_time = time.clock()

    except Exception as ex:
        errors.append('Se ha producido un error al intentas calcular las rutas')

    if len(errors) <= 0:

        try:
            routes = []
            steps = []
            with transaction.commit_on_success():
                for path in paths:
                    calculatedRoute = Route()
                    calculatedRoute.origin = path[0].point
                    calculatedRoute.destiny = path[1].point
                    calculatedRoute.save()
                    routes.append(calculatedRoute)

                    step_number = 0
                    for step in StepIterator(path[2]):
                        step_number += 1
                        routeStep = Step()
                        routeStep.row, routeStep.column, routeStep.floor_id = step.split('_')
                        routeStep.step_number = step_number
                        routeStep.step_category = routeStep.NORMAL #TODO: esto se usa para algo?
                        routeStep.route = calculatedRoute
                        steps.append(routeStep)

                    # Limit the number of steps saved so they don't collapse main memory
                    if len(steps) > LIMIT_PER_BULK_SAVE:
                        Step.objects.bulk_create(steps)
                        steps = []

                # Bulk_create isn't supposed to work with auto-incremental steps, but it's working with
                # Step objects (it does not work with Route objects though)
                Step.objects.bulk_create(steps)


        except Exception as ex:
            errors.append('Se ha producido un error al insertar los datos en la BBDD. Error:' + str(ex))

        final_time = time.clock()
        if len(errors) == 0:
            report = "Calculate routes finished correctly. Load to memory time = " + str(pre_dijkstra_time - initial_time) + "s -- " +\
                "Dijkstra algorithm time = " + str(post_dijkstra_time - pre_dijkstra_time) + "s -- " +\
                "Save to database time = " + str(final_time - post_dijkstra_time) + "s -- " +\
                "Total time = " + str(final_time - initial_time) + "s."
            Logger.info(report)
        else:
            report = "Calculate routes finished with errors. "
            for error in errors:
                report += error + '--'
            Logger.error(report)

