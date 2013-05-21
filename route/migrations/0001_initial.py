# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'route'
        db.create_table(u'route_route', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('origin', self.gf('django.db.models.fields.related.ForeignKey')(related_name='+', to=orm['map_editor.Point'])),
            ('destiny', self.gf('django.db.models.fields.related.ForeignKey')(related_name='+', to=orm['map_editor.Point'])),
        ))
        db.send_create_signal(u'route', ['route'])

        # Adding model 'step'
        db.create_table(u'route_step', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('step_category', self.gf('django.db.models.fields.CharField')(default='NOR', max_length=3)),
            ('step_number', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('row', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('column', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('route', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['route.route'])),
            ('floor', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['map_editor.Floor'])),
        ))
        db.send_create_signal(u'route', ['step'])

        # Adding model 'connection'
        db.create_table(u'route_connection', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('init', self.gf('django.db.models.fields.related.ForeignKey')(related_name='+', to=orm['map_editor.Point'])),
            ('end', self.gf('django.db.models.fields.related.ForeignKey')(related_name='+', to=orm['map_editor.Point'])),
        ))
        db.send_create_signal(u'route', ['connection'])


    def backwards(self, orm):
        # Deleting model 'route'
        db.delete_table(u'route_route')

        # Deleting model 'step'
        db.delete_table(u'route_step')

        # Deleting model 'connection'
        db.delete_table(u'route_connection')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'map_editor.enclosure': {
            'Meta': {'object_name': 'Enclosure'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'enclosures'", 'to': u"orm['auth.User']"})
        },
        u'map_editor.floor': {
            'Meta': {'object_name': 'Floor'},
            'enclosure': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'floors'", 'blank': 'True', 'to': u"orm['map_editor.Enclosure']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'num_cols': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'num_rows': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'})
        },
        u'map_editor.label': {
            'Meta': {'object_name': 'Label'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'labels'", 'blank': 'True', 'to': u"orm['map_editor.LabelCategory']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'map_editor.labelcategory': {
            'Meta': {'object_name': 'LabelCategory'},
            'color': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'})
        },
        u'map_editor.point': {
            'Meta': {'object_name': 'Point'},
            'col': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'floor': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Floor']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Label']"}),
            'row': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'})
        },
        u'route.connection': {
            'Meta': {'object_name': 'connection'},
            'end': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': u"orm['map_editor.Point']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'init': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': u"orm['map_editor.Point']"})
        },
        u'route.route': {
            'Meta': {'object_name': 'route'},
            'destiny': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': u"orm['map_editor.Point']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'origin': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': u"orm['map_editor.Point']"})
        },
        u'route.step': {
            'Meta': {'object_name': 'step'},
            'column': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'floor': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['map_editor.Floor']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'route': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['route.route']"}),
            'row': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'step_category': ('django.db.models.fields.CharField', [], {'default': "'NOR'", 'max_length': '3'}),
            'step_number': ('django.db.models.fields.PositiveIntegerField', [], {})
        }
    }

    complete_apps = ['route']