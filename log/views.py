# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
import simplejson

logs = []

def mobile_logger(request):
    global logs

    if request.is_ajax():
        if request.method == 'GET':
            json_cad = simplejson.dumps(logs)
            return HttpResponse(json_cad, content_type="application/json")
        if request.method == 'POST':
            logs = simplejson.loads(request.body)
            return HttpResponse('ok')
    else:
        global logs
        logs = []
        return render_to_response("log/mobile.html", {}, context_instance=RequestContext(request))