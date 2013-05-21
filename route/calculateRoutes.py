import threading
from map_editor.models import *
from django.http import *
from route.models import *
from route.pathfinding.dijkstra import *
from threading import Thread
#from django.core import serializers


def calculate_routes(request, enclosure_id):
   # t1 = threading.Thread(target=threadCalculateRoute, args=[enclosure_id])
   # t1.start()
    threadCalculateRoute(enclosure_id)
    return HttpResponse('a')

def threadCalculateRoute(enclosure_id):
    floors = Floor.objects.filter(enclosure_id=enclosure_id)
    floorIds = []
    for floor in floors:
        floorIds.append(floor.id)

    points = Point.objects.filter(floor_id__in=floorIds)
    qrlist = []
    walls = []
    #  data = serializers.serialize('json', f)
    for point in points:
        #qrccode = point.qr_code.code
        if hasattr(point, 'qr_code'):
            qrlist.append(point.qr_code)

        if point.label.category.name.upper() in CATEGORIAS_FIJAS[0].upper():
            walls.append(dijkstra.getKey(point.row,point.col,point.floor.id))

    pathfinder = dijkstra(floors, walls, qrlist, [])
    paths = pathfinder.calculateDijkstra()
    for path in paths:
        origin = path[0]
        destination = path[1]
        steps = path[2][1]
        calculatedRoute = route()
        calculatedRoute.origin = origin.point
        calculatedRoute.destiny = destination.point
        for index in range(1, len(steps)):
            routeStep = step()
            stepElements = steps[index].split('_')
            routeStep.row = stepElements[0]
            routeStep.column = stepElements[1]
            routeStep.step_number = index
            routeStep.step_category = routeStep.NORMAL
            routeStep.floor = floors.filter(id=stepElements[2])[0]
            routeStep.route = calculatedRoute







    print paths
