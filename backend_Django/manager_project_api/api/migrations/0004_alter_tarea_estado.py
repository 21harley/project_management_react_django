# Generated by Django 5.1.2 on 2024-10-10 21:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_tarea_estado_alerta'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tarea',
            name='estado',
            field=models.TextField(),
        ),
    ]
