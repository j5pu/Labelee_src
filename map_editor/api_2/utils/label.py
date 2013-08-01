from map_editor.models import Label


def getLabelsForDashboard(enclosure_id):
    return Label.objects.filter(category__enclosure_id=enclosure_id)\
        .exclude(
            category = 1
        ).exclude(
            category__name_es = 'Intermedias'
        ).exclude(
            category__name_es = 'Parquing'
        ).exclude(
            points__qr_code = None
        )