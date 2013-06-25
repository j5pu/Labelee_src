from django.utils.translation import gettext as _
from modeltranslation.translator import translator, TranslationOptions
from map_editor.models import *

class LabelTranslationOptions(TranslationOptions):
    fields = ('name',)
    # fallback_values = _('-- sin traducir --')

class LabelCategoryTranslationOptions(TranslationOptions):
    fields = ('name',)
    # fallback_values = _('-- sin traduccir --')

translator.register(Label, LabelTranslationOptions)
translator.register(LabelCategory, LabelCategoryTranslationOptions)