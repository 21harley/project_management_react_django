from api.models import Usuario, Proyecto, Tarea, Alerta
from django.utils import timezone
import random

def poblar_datos():
    # Verifica si los datos ya existen para evitar duplicados
    if Usuario.objects.exists():
        print("Los datos de poblamiento ya existen.")
        return

    # Crear 4 usuarios
    usuarios = []
    for i in range(1, 5):
        if i == 1:
            # Crear el primer usuario como admin
            usuario = Usuario.objects.create_superuser(
                username=f'admin',
                nombre=f'Admin',
                email='admin@example.com',
                password='password123',
                rol='admin'
            )
            print(f'Usuario Admin creado con rol de administrador.')
        else:
            # Crear el resto de usuarios como usuarios regulares
            usuario = Usuario.objects.create_user(
                username=f'usuario{i}',
                nombre=f'Usuario {i}',
                email=f'usuario{i}@example.com',
                password='password123',
                rol='usuario'
            )
            print(f'Usuario {usuario.nombre} creado con rol de usuario.')

        usuarios.append(usuario)

    # Crear 4 proyectos
    for i in range(1, 5):
        user_number =random.choice(usuarios) 
        proyecto = Proyecto.objects.create(
            nombre=f'Proyecto {i}',
            descripcion=f'Descripción del proyecto {i}',
            fecha_inicio=timezone.now().date(),
            fecha_finalizacion=timezone.now().date(),
            usuario=user_number  # Asigna un usuario aleatorio al proyecto
        )
        Alerta.objects.create(usuario=user_number, mensaje=f"Se te ha asignado un nuevo proyecto: {proyecto.nombre}")
        print(f'Proyecto {proyecto.nombre} creado.')

        # Crear 6 tareas por proyecto
        for j in range(1, 7):
            user_number =random.choice(usuarios) 
            tarea = Tarea.objects.create(
                nombre=f'Tarea {j} del {proyecto.nombre}',
                descripcion=f'Descripción de la tarea {j} del proyecto {i}',
                estado='pendiente',
                asignada_a=user_number,  # Asigna un usuario aleatorio a la tarea
                proyecto=proyecto
            )
            Alerta.objects.create(usuario=user_number, mensaje=f"Se te ha asignado un nuevo tarea: {proyecto.nombre}")
            print(f'Tarea {tarea.nombre} creada y asignada a {tarea.asignada_a.nombre}.')
