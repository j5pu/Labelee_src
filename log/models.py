from django.db import models


class LogEntry(models.Model):
    when = models.DateTimeField(auto_now=True)

    WARNING = 'WAR'
    DEBUG = 'DEB'
    INFO = 'INF'
    ERROR = 'ERR'
    CRITICAL = 'CRI'
    ENTRY_CATEGORY = {
        (WARNING, 'WAR'),
        (DEBUG, 'DEB'),
        (INFO, 'INF'),
        (ERROR, 'ERR'),
        (CRITICAL, 'CRI')
    }
    category = models.CharField(max_length=3, choices=ENTRY_CATEGORY, default=INFO)

    message = models.CharField(max_length=200, blank=True, null=True)

