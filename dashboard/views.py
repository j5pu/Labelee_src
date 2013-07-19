# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required

from django.shortcuts import render_to_response
from django.template import RequestContext

import settings

@login_required(login_url=settings.LOGIN_URL)
def index(request):

    # translation.activate(request.session['django_language'])

    return render_to_response('dashboard/index.html', context_instance=RequestContext(request))

