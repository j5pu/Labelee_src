# -*- coding: utf-8 -*-
from collections import defaultdict
import datetime

from django.utils.translation import gettext
from dashboard.models import DisplayedRoutes
from map_editor.api_2.utils.label import getLabelsForDashboard
from map_editor.api_2.utils.label_category import getLabelCategories
from dashboard.models import Qr_shot
from log.logger import Logger
from map_editor.api_2.utils.label_category import getLabelCategories
from django.db.models import Count
from map_editor.models import LabelCategory, Label
from map_editor.models import Label


def getLabelsForDashboard(enclosure_id):
    return Label.objects.filter(points__floor__enclosure_id=enclosure_id, category__is_dashboard_category=True).distinct()

def getChartSkeleton(chart_title):
    return [
        {
            'key': chart_title,
            'values': []
        }
        # {
        #     "label" : "Connections" ,
        #     "value" : 129.765957771107
        # },...
    ]


def getScansByCategory(enclosure_id, dateIni, dateFin):
    """
    Muestra el número de escaneos de QRs para todos los recintos del dueño o para uno dado
    """

    categories = LabelCategory.objects.filter(labels__points__floor__enclosure__id=enclosure_id)
    categories = categories.distinct()
    categories = categories.filter(is_dashboard_category=True)
    c = categories.annotate(num_shots=Count('labels__points__qr_shots'))

    chart = getChartSkeleton(gettext('Total de escaneos'))

    for category in c:
        if dateIni and dateFin:
            cursor = connection.cursor()
            query = """
                SELECT COUNT(*) AS count FROM dashboard_qr_shot
                    INNER JOIN map_editor_point ON (dashboard_qr_shot.point_id = map_editor_point.id)
                    INNER JOIN map_editor_label ON (map_editor_point.label_id = map_editor_label.id)
                    INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                        WHERE (map_editor_label.category_id = {category_id}
                            AND map_editor_floor.enclosure_id = {enclosure_id}
                            AND DATE(date)>='{dateIni}'
                            AND DATE(date)<='{dateFin}');")
            """.format(category_id=category.id, enclosure_id=enclosure_id, dateIni=dateIni, dateFin=dateFin)
            cursor.execute(query)
            category.num_shots = cursor.fetchone()[0]
        else:
            if dateIni:
                cursor = connection.cursor()
                query = """
                    SELECT COUNT(*) AS count FROM dashboard_qr_shot
                        INNER JOIN map_editor_point ON (dashboard_qr_shot.point_id = map_editor_point.id)
                        INNER JOIN map_editor_label ON (map_editor_point.label_id = map_editor_label.id)
                        INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                            WHERE (map_editor_label.category_id = {category_id}
                                AND map_editor_floor.enclosure_id = {enclosure_id}
                                AND DATE(date)>='{dateIni}');")
                """.format(category_id=category.id, enclosure_id=enclosure_id, dateIni=dateIni)
                cursor.execute(query)
                category.num_shots = cursor.fetchone()[0]
            if dateFin:
                cursor = connection.cursor()
                query = """
                    SELECT COUNT(*) AS count FROM dashboard_qr_shot
                        INNER JOIN map_editor_point ON (dashboard_qr_shot.point_id = map_editor_point.id)
                        INNER JOIN map_editor_label ON (map_editor_point.label_id = map_editor_label.id)
                        INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                            WHERE (map_editor_label.category_id = {category_id}
                                AND map_editor_floor.enclosure_id = {enclosure_id}
                                AND DATE(date)<='{dateFin}');")
                """.format(category_id=category.id, enclosure_id=enclosure_id, dateFin=dateFin)
                cursor.execute(query)
                category.num_shots = cursor.fetchone()[0]
        cat = {
            'label': category.name,
            'color': category.color,
            'value': category.num_shots
        }
        chart[0]['values'].append(cat)

    return chart


def getTopScansByPoi(enclosure_id, dateIni, dateFin):
    chart = getChartSkeleton(gettext('POIs más escaneados'))
    cursor = connection.cursor()
    query = """
                SELECT count(*) as c, map_editor_point.label_id FROM dashboard_qr_shot
                INNER JOIN map_editor_point ON (dashboard_qr_shot.point_id = map_editor_point.id)
                INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                    WHERE ( map_editor_floor.enclosure_id = {enclosure_id})
                            and map_editor_point.label_id not in (select lb.id from map_editor_label lb where lb.category_id in (3,9,13,1))
                            group by map_editor_point.label_id order by c desc
        """.format(enclosure_id = enclosure_id)
    if dateIni and dateFin:
        query = """
                SELECT count(*) as c, map_editor_point.label_id FROM dashboard_qr_shot
                INNER JOIN map_editor_point ON (dashboard_qr_shot.point_id = map_editor_point.id)
                INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                    WHERE ( map_editor_floor.enclosure_id = {enclosure_id}
                            AND DATE(date)>='{dateIni}'
                            AND DATE(date)<='{dateFin}')
                            and map_editor_point.label_id not in (select lb.id from map_editor_label lb where lb.category_id in (3,9,13,1))
                            group by map_editor_point.label_id order by c desc
        """.format(enclosure_id = enclosure_id, dateIni= dateIni, dateFin= dateFin)
    else:
        if dateIni:
            query = """
                SELECT count(*) as c, map_editor_point.label_id FROM dashboard_qr_shot
                INNER JOIN map_editor_point ON (dashboard_qr_shot.point_id = map_editor_point.id)
                INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                    WHERE ( map_editor_floor.enclosure_id = {enclosure_id}
                            AND DATE(date)>='{dateIni}')
                            and map_editor_point.label_id not in (select lb.id from map_editor_label lb where lb.category_id in (3,9,13,1))
                            group by map_editor_point.label_id order by c desc
        """.format(enclosure_id = enclosure_id, dateIni= dateIni)
        if dateFin:
            query = """
                SELECT count(*) as c, map_editor_point.label_id FROM dashboard_qr_shot
                INNER JOIN map_editor_point ON (dashboard_qr_shot.point_id = map_editor_point.id)
                INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                    WHERE ( map_editor_floor.enclosure_id = {enclosure_id}
                            AND DATE(date)<='{dateFin}') and map_editor_point.label_id not in (select lb.id from map_editor_label lb where lb.category_id in (3,9,13))
                            group by map_editor_point.label_id order by c desc
        """.format(enclosure_id = enclosure_id, dateFin= dateFin)

    cursor.execute(query)
    result = cursor.fetchall()[:10]
    for par in result:
        label = Label.objects.get(pk=par[1])
        lab = {
             'label': label.name,
             'color': label.category.color,
             'value': par[0]
         }
        chart[0]['values'].append(lab)

    return chart

from django.db import connection

def getRoutesByCategory(enclosure_id, dateIni, dateFin):
    categories = LabelCategory.objects.filter(labels__points__floor__enclosure__id=enclosure_id)
    categories = categories.distinct()
    categories = categories.filter(is_dashboard_category=True)
    c = categories.annotate(displayed_destination_count=Count('labels__points__displayed_destination'))

    chart = getChartSkeleton(gettext('Total de rutas'))

    for category in c:
        if dateIni and dateFin:
            cursor = connection.cursor()
            query = """
                SELECT COUNT(*) AS count FROM dashboard_displayedroutes
                    INNER JOIN map_editor_point ON (dashboard_displayedroutes.destination_id = map_editor_point.id)
                    INNER JOIN map_editor_label ON (map_editor_point.label_id = map_editor_label.id)
                    INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                        WHERE (map_editor_label.category_id = {category_id}
                            AND map_editor_floor.enclosure_id = {enclosure_id}
                            AND DATE(date)>='{dateIni}'
                            AND DATE(date)<='{dateFin}');")
            """.format(category_id=category.id, enclosure_id=enclosure_id, dateIni=dateIni, dateFin=dateFin)
            cursor.execute(query)
            category.displayed_destination_count = cursor.fetchone()[0]
        else:
            if dateIni:
                cursor = connection.cursor()
                query = """
                    SELECT COUNT(*) AS count FROM dashboard_displayedroutes
                        INNER JOIN map_editor_point ON (dashboard_displayedroutes.destination_id = map_editor_point.id)
                        INNER JOIN map_editor_label ON (map_editor_point.label_id = map_editor_label.id)
                        INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                            WHERE (map_editor_label.category_id = {category_id}
                                AND map_editor_floor.enclosure_id = {enclosure_id}
                                AND DATE(date)>='{dateIni}');")
                """.format(category_id=category.id, enclosure_id=enclosure_id, dateIni=dateIni)
                cursor.execute(query)
                category.displayed_destination_count = cursor.fetchone()[0]
            if dateFin:
                cursor = connection.cursor()
                query = """
                    SELECT COUNT(*) AS count FROM dashboard_displayedroutes
                        INNER JOIN map_editor_point ON (dashboard_displayedroutes.destination_id = map_editor_point.id)
                        INNER JOIN map_editor_label ON (map_editor_point.label_id = map_editor_label.id)
                        INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                            WHERE (map_editor_label.category_id = {category_id}
                                AND map_editor_floor.enclosure_id = {enclosure_id}
                                AND DATE(date)<='{dateFin}');")
                """.format(category_id=category.id, enclosure_id=enclosure_id, dateFin=dateFin)
                cursor.execute(query)
                category.displayed_destination_count = cursor.fetchone()[0]
                # category.displayed_destination_count = DisplayedRoutes.objects.filter(
                # destination__floor__enclosure__id=enclosure_id,
                # destination__label__category=category,
                # date__lte=dateFin
                # ).count()

        cat = {
            'label': category.name,
            'color': category.color,
            'value': category.displayed_destination_count
        }
        chart[0]['values'].append(cat)

    return chart


def getTopRoutesByPoi(enclosure_id, dateIni, dateFin):
    chart = getChartSkeleton(gettext('Rutas más solicitadas'))
    cursor = connection.cursor()
    query = """
                SELECT count(*) as c, map_editor_point.label_id FROM dashboard_displayedroutes
                INNER JOIN map_editor_point ON (dashboard_displayedroutes.destination_id = map_editor_point.id)
                INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                    WHERE ( map_editor_floor.enclosure_id = {enclosure_id})
                            and map_editor_point.label_id not in (select lb.id from map_editor_label lb where lb.category_id in (3,9,13))
                            group by map_editor_point.label_id order by c desc
        """.format(enclosure_id = enclosure_id)
    if dateIni and dateFin:
        query = """
                SELECT count(*) as c, map_editor_point.label_id FROM dashboard_displayedroutes
                INNER JOIN map_editor_point ON (dashboard_displayedroutes.destination_id = map_editor_point.id)
                INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                    WHERE ( map_editor_floor.enclosure_id = {enclosure_id}
                            AND DATE(date)>='{dateIni}'
                            AND DATE(date)<='{dateFin}') and map_editor_point.label_id not in (select lb.id from map_editor_label lb where lb.category_id in (3,9,13))
                            group by map_editor_point.label_id order by c desc
        """.format(enclosure_id = enclosure_id, dateIni= dateIni, dateFin= dateFin)
    else:
        if dateIni:
            query = """
                SELECT count(*) as c, map_editor_point.label_id FROM dashboard_displayedroutes
                INNER JOIN map_editor_point ON (dashboard_displayedroutes.destination_id = map_editor_point.id)
                INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                    WHERE ( map_editor_floor.enclosure_id = {enclosure_id}
                            AND DATE(date)>='{dateIni}')
                            and map_editor_point.label_id not in (select lb.id from map_editor_label lb where lb.category_id in (3,9,13))
                            group by map_editor_point.label_id order by c desc
        """.format(enclosure_id = enclosure_id, dateIni= dateIni)
        if dateFin:
            query = """
                SELECT count(*) as c, map_editor_point.label_id FROM dashboard_displayedroutes
                INNER JOIN map_editor_point ON (dashboard_displayedroutes.destination_id = map_editor_point.id)
                INNER JOIN map_editor_floor ON (map_editor_point.floor_id = map_editor_floor.id)
                    WHERE ( map_editor_floor.enclosure_id = {enclosure_id}
                            AND DATE(date)<='{dateFin}') and map_editor_point.label_id not in (select lb.id from map_editor_label lb where lb.category_id in (3,9,13))
                            group by map_editor_point.label_id order by c desc
        """.format(enclosure_id = enclosure_id, dateFin= dateFin)

    cursor.execute(query)
    result = cursor.fetchall()[:10]
    for par in result:
        label = Label.objects.get(pk=par[1])
        lab = {
             'label': label.name,
             'color': label.category.color,
             'value': par[0]
         }
        chart[0]['values'].append(lab)

    return chart


def saveQrShot(poi_id):
    try:
        qrShot = Qr_shot()
        qrShot.point_id = poi_id
        qrShot.date = datetime.datetime.utcnow()
        qrShot.save()
    except Exception as ex:
        Logger.error(ex.message)
