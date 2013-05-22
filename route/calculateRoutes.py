# coding=utf-8
import threading
from django.db import transaction
from map_editor.models import *
from django.http import *
from route.models import *
from route.pathfinding.dijkstra import *
from django.db import connection
from threading import Thread
#from django.core import serializers


def calculate_routes(request, enclosure_id):
# t1 = threading.Thread(target=threadCalculateRoute, args=[enclosure_id])
# t1.start()
    threadCalculateRoute(enclosure_id)
    return HttpResponse('La operación se ha realizado correctamente')


def threadCalculateRoute(enclosure_id):

    sql = "select * from route_route where origin_id in  " \
          "( SELECT id FROM map_editor_point where floor_id in " \
          "(select id from map_editor_floor where map_editor_floor.enclosure_id = %s))" % enclosure_id


    currentroutes = Route.objects.raw(sql)
    for route in currentroutes:
        route.delete()

    floors = Floor.objects.filter(enclosure_id=enclosure_id)
    floorIds = []
    for floor in floors:
        floorIds.append(floor.id)

    points = Point.objects.filter(floor_id__in=floorIds)
    qrlist = []
    walls = [] #muros
    mapConnections = {} #Aristas
    #  data = serializers.serialize('json', f)
    for point in points:
        #qrccode = point.qr_code.code
        if hasattr(point, 'qr_code'):
            qrlist.append(point.qr_code)

        if point.label.category.name.upper() in CATEGORIAS_FIJAS[0].upper():
            walls.append(Dijkstra.getKey(point.row, point.col, point.floor.id))

        if hasattr(point, 'map_connection'):
            keyinit = Dijkstra.getKey(point.row, point.col, point.floor.id)
            keyend = Dijkstra.getKey(point.map_connection.end.row, point.map_connection.end.col,
                                     point.map_connection.end.floor.id)
            mapConnections[keyinit] = keyend

    pathfinder = Dijkstra(floors, walls, qrlist, mapConnections)
    paths = pathfinder.calculateDijkstra()

    with transaction.commit_on_success():
        for path in paths:
            origin = path[0]
            destination = path[1]
            steps = path[2][1]
            calculatedRoute = Route()
            calculatedRoute.origin = origin.point
            calculatedRoute.destiny = destination.point
            calculatedRoute.save()
            for index in range(1, len(steps)):
                routeStep = Step()
                stepElements = steps[index].split('_')
                routeStep.row = stepElements[0]
                routeStep.column = stepElements[1]
                routeStep.step_number = index
                routeStep.step_category = routeStep.NORMAL
                routeStep.floor = floors.filter(id=stepElements[2])[0]
                routeStep.route = calculatedRoute
                routeStep.save()


    print paths
