from django.utils import simplejson
from map_editor.models import *
from django.http import *

def calculate_routes(request, enclosure_id):
    f = Floor(name='test', enclosure_id=1)
    f.save()

    return HttpResponse('a')