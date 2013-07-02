from django.db import models

class TestRouteAnalytics:
    type =  models.CharField(max_length=255)
    month = models.CharField(max_length=255)
    number = models.PositiveIntegerField()


class TestAnalytics:
    category =  models.CharField(max_length=255)
    month = models.CharField(max_length=255)
    users = models.PositiveIntegerField()