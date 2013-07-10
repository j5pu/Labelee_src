from django.http import HttpResponse
import simplejson
from analytics.models import TestAnalytics


def GetUserAnalytics(request):
    userAnalytics = TestAnalytics.objects.all()
    categories = {}
    for user in userAnalytics:
        if categories.has_key(user.category):
            categories[user.category].update({user.month: user.users})
        else:
            categories[user.category] = {user.month: user.users}
            # json_user = {
            #     'Category': user.category,
            #     'Month': user.month,
            #     'Number': user.users,
            #
            # }
            # json_users.append(json_user)
    userspercategory = []
    for namecategory in categories.keys():
        json_category = {'Category': namecategory}
        for month in categories[namecategory].keys():
            json_category.update({month: categories[namecategory][month]})

        userspercategory.append(json_category)


            # return HttpResponse(simplejson.dumps(pois), mimetype='application/json')
    return HttpResponse(simplejson.dumps(userspercategory), mimetype='application/json')
