from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
from enum import Enum

# Define el Enum para los estados de la tarea
class EstadoTarea(Enum):
    PENDIENTE = 1
    DESARROLLO = 2
    TERMINADO = 3
    OBSERVADO = 4

    @classmethod
    def choices(cls):
        return [(tag.name.lower(), tag.value) for tag in cls]

# Usuario
class Usuario(AbstractUser):
    nombre = models.CharField(max_length=255, default='Default Name')
    rol = models.CharField(max_length=15, default='usuario')

    # Especifica un related_name diferente para evitar conflictos
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.'
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.'
    )

# Proyecto
class Proyecto(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    fecha_inicio = models.DateField()
    fecha_finalizacion = models.DateField()
    usuario = models.ForeignKey(Usuario, related_name='proyectos', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

# Tarea
class Tarea(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    estado = models.TextField()
    asignada_a = models.ForeignKey(Usuario, related_name='tareas_asignadas', on_delete=models.CASCADE)
    proyecto = models.ForeignKey(Proyecto,  related_name='tareas', on_delete=models.CASCADE,)

    def __str__(self):
        return self.nombre

class Alerta(models.Model):
    mensaje = models.TextField()
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)  # El usuario al que va dirigida la alerta
    visible = models.BooleanField(default=True)  # Controlar si la alerta es visible o no
    fecha_emision = models.DateTimeField(default=timezone.now)  # Fecha de emisión de la alerta

    def __str__(self):
        return f'Alerta para {self.usuario.username} - {self.mensaje[:20]}...'

    class Meta:
        verbose_name = "Alerta"
        verbose_name_plural = "Alertas"
