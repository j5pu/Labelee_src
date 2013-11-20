# -*- coding: utf-8 -*-

from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils.translation import gettext
from django.conf import settings

@login_required(login_url=settings.LOGIN_URL)
def index(request):

    return render_to_response('coupon_manager/index.html', context_instance=RequestContext(request))
