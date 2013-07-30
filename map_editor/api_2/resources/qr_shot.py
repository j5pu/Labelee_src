# -*- coding: utf-8 -*-


from django.http import HttpResponse
import simplejson


def get_count(request, enclosure_id=None):
    """
    /api-2/qr-shot/count/[enclosure_id]

    Muestra el número de escaneos de QRs para todos los recintos del dueño o para uno dado
    """
    if enclosure_id is not None:
        pass
        #return HttpResponse(simplejson.dumps(enclosure), mimetype='application/json')

    # if request.user.is_staff:
    #     enclosures_query = Enclosure.objects.all()
    # else:
    #     enclosures_query = Enclosure.objects.filter(owner__id=request.user.id)
    #
    # enclosures = []
    # for enclosure in enclosures_query:
    #     enclosures.append(getEnclosureForManager(enclosure.id))
    #
    # return HttpResponse(simplejson.dumps(enclosures), mimetype='application/json')