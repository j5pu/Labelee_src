# coding=utf-8
import threading

from django.core.mail import EmailMessage
from django.db import transaction
from django.http import *
from django.utils.translation import gettext as _

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
        #threadCalculateRoute(enclosure_id)
    except Exception as ex:
        print type(ex)
        print ex.args

    return HttpResponse(_('Se están calculando las rutas'))


def threadCalculateRoute(enclosure_id):
    """

    :param enclosure_id:
    """
    errors = []

    sendEmail('Cálculo de rutas', 'Se están calculando rutas')
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

        points = Point.objects.filter(floor_id__in=floorIds)
        ###
        qrlist = [] #qrs
        walls = [] #muros
        mapConnections = {} #Aristas

        for point in points:
            if hasattr(point, 'qr_code'):
                #meto en una lista todos los qrs
                qrlist.append(point.qr_code)
            #meto en una lista todos los muros
            if point.label.category.name.upper() in CATEGORIAS_FIJAS[0].upper() or point.label.category.name.upper() in \
                    CATEGORIAS_FIJAS[5].upper():
                walls.append(Dijkstra.getKey(point.row, point.col, point.floor.id))
            #me creo un grafo (diccionario) para las conexiones; ej 1_1_1 : 1_2_1,1_3_1
            #significa que desde el qr 1_1_1 p
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
        paths = pathfinder.calculateDijkstra(errors)
    except Exception as ex:
        errors.append('Se ha producido un error al intentas calcular las rutas')

    sendEmail('Calculo de rutas', 'Se ha terminado de calcular falta la BBDD')

    #stepsArray = []
    if len(errors) <= 0:

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
                        #stepsArray.append(routeStep)

                        #  Step.objects.bulk_create(stepsArray)

        except Exception as ex:
            errors.append('Se ha producido un error al insertar los datos en la BBDD. Error:' + ex.message)
        mensaje = 'Se ha realizado la operación correctamente'
        if len(errors) > 0:
            mensaje = 'Se han producido los siguientes errores: '
            for error in errors:
                mensaje += error + '--'
        sendEmail('Informe cálculo de rutas', mensaje)


def sendEmail(subject, message):
    try:
        email = EmailMessage(subject, message, to=['alvaro.gutierrez@mnopi.com'])
        email.send()
    except:
        pass


