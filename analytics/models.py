from django.db import models


class TestRouteAnalytics(models.Model):
    type = models.CharField(max_length=255)
    month = models.CharField(max_length=255)
    number = models.PositiveIntegerField()


class TestAnalytics(models.Model):
    category = models.CharField(max_length=255)
    month = models.CharField(max_length=255)
    users = models.PositiveIntegerField()