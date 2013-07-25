# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Map.img'
        db.alter_column(u'map_editor_map', 'img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True))
        # Adding field 'Grid.name'
        db.add_column(u'map_editor_grid', 'name',
                      self.gf('django.db.models.fields.CharField')(default='name', max_length=200),
                      keep_default=False)


    def backwards(self, orm):

        # Changing field 'Map.img'
        db.alter_column(u'map_editor_map', 'img', self.gf('django.db.models.fields.files.FileField')(default='img', max_length=100))
        # Deleting field 'Grid.name'
        db.delete_column(u'map_editor_grid', 'name')


    models = {
        u'map_editor.grid': {
            'Meta': {'object_name': 'Grid'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'map': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'grids'", 'to': u"orm['map_editor.Map']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'num_cols': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'num_rows': ('django.db.models.fields.PositiveIntegerField', [], {})
        },
        u'map_editor.map': {
            'Meta': {'object_name': 'Map'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'place': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'maps'", 'blank': 'True', 'to': u"orm['map_editor.Place']"})
        },
        u'map_editor.object': {
            'Meta': {'object_name': 'Object'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'_objects_'", 'to': u"orm['map_editor.ObjectCategory']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'map_editor.objectcategory': {
            'Meta': {'object_name': 'ObjectCategory'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'})
        },
        u'map_editor.place': {
            'Meta': {'object_name': 'Place'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'})
        },
        u'map_editor.point': {
            'Meta': {'object_name': 'Point'},
            'description': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'grid': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Grid']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Object']"}),
            'x_coord': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'y_coord': ('django.db.models.fields.PositiveIntegerField', [], {})
        }
    }

    complete_apps = ['map_editor']