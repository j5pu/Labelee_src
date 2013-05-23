# coding=utf-8
import threading

from django.core.mail import EmailMessage
from django.db import transaction
from django.http import *

from map_editor.models import *
from route.models import *
from route.pathfinding.Dijkstra import *

#from django.core import serializers



def calculate_routes(request, enclosure_id):
    # t1 = threading.Thread(target=threadCalculateRoute, args=[enclosure_id])
    # t1.start()
    try:
        t1 = threading.Thread(target=threadCalculateRoute, args=[enclosure_id])
        t1.start()
    except Exception as ex:
        print type(ex)
        print ex.args

    return HttpResponse('Se están calculando las rutas')


def threadCalculateRoute(enclosure_id):
    email = EmailMessage('Cálculo de rutas','Se están calculando rutas', to=['alvaro.gutierrez@mnopi.com'])
    email.send()
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

        pmapconnections = Connection.objects.filter(init__id=point.id)
        for pmapconnection in pmapconnections:
            keyinit = Dijkstra.getKey(point.row, point.col, point.floor.id)
            keyend = Dijkstra.getKey(pmapconnection.end.row, pmapconnection.end.col, pmapconnection.end.floor.id)
            if keyinit in mapConnections:
                mapConnections[keyinit].append(keyend)
            else:
                mapConnections[keyinit] = [keyend]

    pathfinder = Dijkstra(floors, walls, qrlist, mapConnections)
    errors = []
    paths = pathfinder.calculateDijkstra(errors)
    try:
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
    except Exception as ex:
        errors.append('Se ha producido un error al insertar los datos en la BBDD')
    mensaje='Se ha realizado la operación correctamente'
    if len(errors) > 0:
        mensaje = 'Se han producido los siguientes errores: '
        for error in errors:
            mensaje += error + '--'

    try:
        email = EmailMessage('Informe cálculo de rutas',mensaje, to=['alvaro.gutierrez@mnopi.com'])
        email.send()
    except:
        pass



