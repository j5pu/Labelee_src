# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'CustomUser'
        db.create_table(u'map_editor_customuser', (
            (u'user_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['auth.User'], unique=True, primary_key=True)),
            ('logo', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
        ))
        db.send_create_signal(u'map_editor', ['CustomUser'])

        # Adding model 'Enclosure'
        db.create_table(u'map_editor_enclosure', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=60)),
            ('owner', self.gf('django.db.models.fields.related.ForeignKey')(related_name='enclosures', to=orm['auth.User'])),
            ('twitter_account', self.gf('django.db.models.fields.CharField')(max_length=60, null=True, blank=True)),
            ('logo', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('url_enclosure', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('url_dashboard', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'map_editor', ['Enclosure'])

        # Adding model 'Floor'
        db.create_table(u'map_editor_floor', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('enclosure', self.gf('django.db.models.fields.related.ForeignKey')(related_name='floors', blank=True, to=orm['map_editor.Enclosure'])),
            ('num_rows', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('num_cols', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('floor_number', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'map_editor', ['Floor'])

        # Adding model 'LabelCategory'
        db.create_table(u'map_editor_labelcategory', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('name_en', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('name_es', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('color', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('icon', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('enclosure', self.gf('django.db.models.fields.related.ForeignKey')(related_name='enclosure', null=True, to=orm['map_editor.Enclosure'])),
        ))
        db.send_create_signal(u'map_editor', ['LabelCategory'])

        # Adding model 'Label'
        db.create_table(u'map_editor_label', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('name_en', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('name_es', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('img', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(related_name='labels', blank=True, to=orm['map_editor.LabelCategory'])),
        ))
        db.send_create_signal(u'map_editor', ['Label'])

        # Adding model 'Point'
        db.create_table(u'map_editor_point', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=2000, null=True, blank=True)),
            ('row', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('col', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('label', self.gf('django.db.models.fields.related.ForeignKey')(related_name='points', to=orm['map_editor.Label'])),
            ('floor', self.gf('django.db.models.fields.related.ForeignKey')(related_name='points', to=orm['map_editor.Floor'])),
            ('panorama_thumbnail', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('alwaysVisible', self.gf('django.db.models.fields.NullBooleanField')(null=True, blank=True)),
            ('center_x', self.gf('django.db.models.fields.PositiveIntegerField')(null=True)),
            ('center_y', self.gf('django.db.models.fields.PositiveIntegerField')(null=True)),
            ('isVertical', self.gf('django.db.models.fields.NullBooleanField')(null=True, blank=True)),
            ('panorama', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
            ('coupon', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True, blank=True)),
        ))
        db.send_create_signal(u'map_editor', ['Point'])

        # Adding model 'QR_Code'
        db.create_table(u'map_editor_qr_code', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('code', self.gf('django.db.models.fields.CharField')(unique=True, max_length=200)),
            ('point', self.gf('django.db.models.fields.related.OneToOneField')(blank=True, related_name='qr_code', unique=True, null=True, to=orm['map_editor.Point'])),
        ))
        db.send_create_signal(u'map_editor', ['QR_Code'])


    def backwards(self, orm):
        # Deleting model 'CustomUser'
        db.delete_table(u'map_editor_customuser')

        # Deleting model 'Enclosure'
        db.delete_table(u'map_editor_enclosure')

        # Deleting model 'Floor'
        db.delete_table(u'map_editor_floor')

        # Deleting model 'LabelCategory'
        db.delete_table(u'map_editor_labelcategory')

        # Deleting model 'Label'
        db.delete_table(u'map_editor_label')

        # Deleting model 'Point'
        db.delete_table(u'map_editor_point')

        # Deleting model 'QR_Code'
        db.delete_table(u'map_editor_qr_code')


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
        u'map_editor.customuser': {
            'Meta': {'object_name': 'CustomUser', '_ormbases': [u'auth.User']},
            'logo': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            u'user_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['auth.User']", 'unique': 'True', 'primary_key': 'True'})
        },
        u'map_editor.enclosure': {
            'Meta': {'object_name': 'Enclosure'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'logo': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'enclosures'", 'to': u"orm['auth.User']"}),
            'twitter_account': ('django.db.models.fields.CharField', [], {'max_length': '60', 'null': 'True', 'blank': 'True'}),
            'url_dashboard': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'url_enclosure': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'map_editor.floor': {
            'Meta': {'object_name': 'Floor'},
            'enclosure': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'floors'", 'blank': 'True', 'to': u"orm['map_editor.Enclosure']"}),
            'floor_number': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
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
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'name_en': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'name_es': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'map_editor.labelcategory': {
            'Meta': {'object_name': 'LabelCategory'},
            'color': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'enclosure': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'enclosure'", 'null': 'True', 'to': u"orm['map_editor.Enclosure']"}),
            'icon': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'img': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'name_en': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'name_es': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'map_editor.point': {
            'Meta': {'object_name': 'Point'},
            'alwaysVisible': ('django.db.models.fields.NullBooleanField', [], {'null': 'True', 'blank': 'True'}),
            'center_x': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True'}),
            'center_y': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True'}),
            'col': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'coupon': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '2000', 'null': 'True', 'blank': 'True'}),
            'floor': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Floor']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isVertical': ('django.db.models.fields.NullBooleanField', [], {'null': 'True', 'blank': 'True'}),
            'label': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['map_editor.Label']"}),
            'panorama': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'panorama_thumbnail': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'row': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'})
        },
        u'map_editor.qr_code': {
            'Meta': {'object_name': 'QR_Code'},
            'code': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'point': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'qr_code'", 'unique': 'True', 'null': 'True', 'to': u"orm['map_editor.Point']"})
        }
    }

    complete_apps = ['map_editor']