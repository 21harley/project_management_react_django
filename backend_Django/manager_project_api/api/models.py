from django.db import models
from django.contrib.auth.models import AbstractUser

# Usuario
class Usuario(AbstractUser):
    nombre = models.CharField(max_length=255, default='Default Name')
    rol = models.CharField(max_length=15, default='usuario')

    # Especifica un related_name diferente para evitar conflictos
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',  # Cambia el related_name
        blank=True,
        help_text='The groups this user belongs to.'
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',  # Cambia el related_name
        blank=True,
        help_text='Specific permissions for this user.'
    )

# Proyecto
class Proyecto(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    fecha_inicio = models.DateField()
    fecha_finalizacion = models.DateField()
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='proyectos')

    def __str__(self):
        return self.nombre

# Tarea
class Tarea(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En progreso'),
        ('completada', 'Completada'),
    ]
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='pendiente')
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='tareas')
    asignada_a = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='tareas_asignadas')

    def __str__(self):
        return self.nombre