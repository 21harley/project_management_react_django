from collections import defaultdict
from venv import logger
from rest_framework import viewsets, permissions
from .models import Alerta, Proyecto, Tarea
from .serializers import AlertaSerializer, ProyectoSerializer, TareaSerializer
from .models import Usuario
from .serializers import UsuarioSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from . import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError

from rest_framework.exceptions import APIException

class CustomAPIException(APIException):
    status_code = 400  # Código de estado predeterminado
    default_detail = 'Un error ha ocurrido.'
    default_code = 'error'

    def __init__(self, detail=None, status_code=None):
        if detail is not None:
            self.detail = detail  # Aquí definimos el detalle de la excepción
        else:
            self.detail = self.default_detail

        if status_code is not None:
            self.status_code = status_code

def format_error_response(message, status_code):
    return Response(data={"msg": message}, status=status_code)

class IsAdminOrOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Permitir a admin acceder a cualquier objeto
        if request.user.rol == 'admin':
            return True

        # Para tareas, permitir a los usuarios acceder solo a sus propias tareas
        if isinstance(obj, Tarea):
            return obj.asignada_a == request.user

        # Para proyectos, permitir a los usuarios acceder solo a proyectos donde están asignados
        if isinstance(obj, Proyecto):
            return obj.usuario == request.user

        return False
   

class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    permission_classes = [IsAdminOrOwner]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        if self.request.user.rol == 'admin':
            return Proyecto.objects.all()
        return Proyecto.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.rol != 'admin':
            raise format_error_response("Solo los administradores pueden crear un proyecto.",status_code= status.HTTP_403_FORBIDDEN)

        usuario_id = self.request.data.get('usuario')
        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            raise ValidationError({'msg':"El usuario especificado no existe."})

        proyecto = serializer.save(usuario=usuario)

        # Crear la alerta para el usuario asignado
        Alerta.objects.create(usuario=usuario, mensaje=f"Se te ha asignado un nuevo proyecto: {proyecto.nombre}")

    def perform_update(self, serializer):
        if self.request.user.rol != 'admin':
            if serializer.instance.usuario != self.request.user:
                raise format_error_response("No tiene permiso para actualizar este proyecto.", status_code=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_destroy(self, instance):
        # Verificar si hay tareas asociadas al proyecto
        tareas_count = instance.tareas.count()  # Aquí estamos contando las tareas asociadas al proyecto

        if tareas_count > 0:
            raise format_error_response("No se puede eliminar el proyecto porque tiene tareas asociadas.", status_code=status.HTTP_400_BAD_REQUEST)

        # Validar que el usuario que intenta eliminar es admin o el usuario encargado del proyecto
        if self.request.user.rol != 'admin' and instance.usuario != self.request.user:
            raise format_error_response("No tiene permiso para eliminar este proyecto.",status_code = status.HTTP_403_FORBIDDEN)

        # Si las validaciones pasan, eliminar el proyecto
        instance.delete()

# Vista para Tareas
class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    permission_classes = [IsAdminOrOwner]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        # Si el usuario es administrador, devuelve todas las tareas
        if self.request.user.rol == 'admin':
            return Tarea.objects.all()

        # Obtén todas las tareas asignadas al usuario
        tareas_asignadas = Tarea.objects.filter(asignada_a=self.request.user)

        # Si el usuario no tiene tareas asignadas, retorna un queryset vacío
        if not tareas_asignadas.exists():
            return Tarea.objects.none()

        return tareas_asignadas

    def list(self, request, *args, **kwargs):
        tareas = self.get_queryset()

        # Agrupar tareas por proyecto
        proyectos_dict = defaultdict(lambda: {
            "id": None,
            "nombre": None,
            "descripcion": None,
            "fecha_inicio": None,
            "fecha_finalizacion": None,
            "usuario": None,
            "tareas": []
        })

        for tarea in tareas:
            # Obtener datos del proyecto solo una vez
            proyecto_id = tarea.proyecto.id
            if proyectos_dict[proyecto_id]["id"] is None:
                proyectos_dict[proyecto_id].update({
                    "id": proyecto_id,
                    "nombre": tarea.proyecto.nombre,
                    "descripcion": tarea.proyecto.descripcion,
                    "fecha_inicio": tarea.proyecto.fecha_inicio,
                    "fecha_finalizacion": tarea.proyecto.fecha_finalizacion,
                    "usuario": tarea.proyecto.usuario.id,
                    "tareas": []
                })

            # Añadir la tarea al proyecto correspondiente
            tarea_data = {
                "id": tarea.id,
                "nombre": tarea.nombre,
                "descripcion": tarea.descripcion,
                "estado": tarea.estado,
                "asignada_a": tarea.asignada_a.id,
            }
            proyectos_dict[proyecto_id]["tareas"].append(tarea_data)

        # Convertir el defaultdict en una lista
        response_data = list(proyectos_dict.values())

        return Response(response_data)
    
    def perform_create(self, serializer):
        proyecto_id = self.request.data.get('proyecto')
        asignada_a_id = self.request.data.get('asignada_a')
    
        # Verificar el proyecto
        try:
            proyecto = Proyecto.objects.get(id=proyecto_id)
        except Proyecto.DoesNotExist:
            raise ValidationError({'msg': 'El proyecto no existe.'})
    
        # Verificar permisos
        if self.request.user.rol != 'admin' and proyecto.usuario != self.request.user:
            raise ValidationError({'msg': 'No tiene permiso para crear una tarea en este proyecto.'})
    
        # Verificar el usuario asignado
        try:
            asignada_a = Usuario.objects.get(id=asignada_a_id)
        except Usuario.DoesNotExist:
            raise ValidationError({'msg': 'El usuario asignado no existe.'})
    
        # Si todas las validaciones son correctas, guarda la tarea
        tarea = serializer.save(proyecto=proyecto, asignada_a=asignada_a)
    
        # Crear la alerta para el usuario asignado
        Alerta.objects.create(usuario=asignada_a, mensaje=f"Se te ha asignado una nueva tarea: {tarea.nombre}")
    
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()  # Obtiene la tarea específica
        original_estado = instance.estado  # Guarda el estado original
    
        # Verifica si el usuario es admin
        if request.user.rol == 'admin':
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
    
            # Crea la alerta
            Alerta.objects.create(
                usuario=instance.asignada_a,
                mensaje=f"El estado de la tarea '{instance.nombre}' ha cambiado a '{instance.estado}'"
            )
            return Response(serializer.data)
    
        # Verifica si el usuario asignado a la tarea intenta modificar el estado
        if request.user == instance.asignada_a:
            if 'estado' in request.data:
                serializer = self.get_serializer(instance, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
    
                # Crea la alerta
                Alerta.objects.create(
                    usuario=instance.asignada_a,
                    mensaje=f"El estado de la tarea '{instance.nombre}' ha cambiado a '{instance.estado}'"
                )
                return Response(serializer.data)
    
        # Verifica si el usuario es el propietario del proyecto
        if request.user.id == instance.proyecto.usuario.id:
            # Si el usuario es el propietario del proyecto, permite modificar todos los campos
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
    
            # Crea la alerta
            Alerta.objects.create(
                usuario=instance.asignada_a,
                mensaje=f"El estado de la tarea '{instance.nombre}' ha cambiado a '{instance.estado}'"
            )
            return Response(serializer.data)
    
        # Si ninguna de las condiciones se cumple, no se permite la modificación
        alert_message = "No tienes permiso para modificar estos campos."
        return Response(
            {"detail": alert_message},
            status=status.HTTP_403_FORBIDDEN
        )





    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def filter_by_project(self, request):
        project_id = request.query_params.get('project_id')
        tasks = self.get_queryset().filter(proyecto_id=project_id)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)


class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        if self.request.user.rol == 'admin':
            return Usuario.objects.all()
        return Usuario.objects.filter(id=self.request.user.id)

    def get_permissions(self):
        if self.action in ['create', 'login']:
            self.permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'retrieve']:
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.IsAuthenticated]

        return super(UsuarioViewSet, self).get_permissions()

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'token': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = Usuario.objects.get(username=username)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'token': str(refresh.access_token),
                })
            else:
                return format_error_response( 'Invalid credentials', status_code=status.HTTP_401_UNAUTHORIZED)
        except Usuario.DoesNotExist:
             raise ValidationError({'msg':'User does not exist'})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        # Si el usuario es admin, incluir la contraseña en la respuesta
        if request.user.rol == 'admin':
            data = serializer.data
            data['password'] = instance.password  # Asegúrate de que el campo de contraseña esté en el serializer
            return Response(data)

        # Si no es admin, devolver la información sin la contraseña
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        logger.info(f"Usuario autenticado: {request.user.username}")
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "nombre": request.user.nombre,
            "rol": request.user.rol,
        })

    def destroy(self, request, pk=None):
        try:
            user_to_delete = self.get_object()
            proyectos_count = user_to_delete.proyectos.count()
            tareas_count = user_to_delete.tareas_asignadas.count()

            if proyectos_count > 0 or tareas_count > 0:
                return format_error_response('No se puede eliminar el usuario porque tiene proyectos o tareas asociadas.',
                                status_code=status.HTTP_400_BAD_REQUEST)

            if request.user.rol == 'admin':
                user_to_delete.delete()
            elif user_to_delete == request.user:
                user_to_delete.delete()
            else:
                return format_error_response('No tiene permiso para eliminar este usuario.',
                                status_code=status.HTTP_403_FORBIDDEN)

            return format_error_response( 'Usuario eliminado correctamente.', status_code=status.HTTP_204_NO_CONTENT)

        except Usuario.DoesNotExist:
            raise ValidationError({'msg':'Usuario no encontrado.'})
        except Exception as e:
            logger.error(f"Error al eliminar usuario: {e}")
            raise ValidationError({'msg': 'Error al eliminar el usuario.'})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        if 'rol' in request.data and request.user.rol != 'admin':
            return format_error_response('No tiene permiso para modificar el rol.', status_code=status.HTTP_403_FORBIDDEN)

        if instance != request.user and request.user.rol != 'admin':
            return format_error_response('No tiene permiso para modificar este usuario.', status_code=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


#AlertaViewSet
class IsAdminOrAlertOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Solo los administradores o el usuario asignado pueden ver/modificar la alerta
        if request.user.rol == 'admin' or obj.usuario == request.user:
            return True
        return False

class AlertaViewSet(viewsets.ModelViewSet):
    queryset = Alerta.objects.all()
    serializer_class = AlertaSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrAlertOwner]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        if self.request.user.rol == 'admin':
            return Alerta.objects.all()
        return Alerta.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        usuario_id = self.request.data.get('usuario')
        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            raise ValidationError({'msg': "El usuario especificado no existe."})
        serializer.save(usuario=usuario)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.rol != 'admin' and instance.usuario != request.user:
            return Response({'msg': 'No tiene permiso para eliminar esta alerta.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['patch'], url_path='update-visibility')
    def update_visibility(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'msg': 'No se proporcionaron IDs.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que los IDs son válidos
        alerts = Alerta.objects.filter(id__in=ids)
        if alerts.count() != len(ids):
            return Response({'msg': 'Algunos IDs no son válidos.'}, status=status.HTTP_404_NOT_FOUND)

        # Actualizar el campo 'visible' a 0 para las alertas encontradas
        alerts.update(visible=0)

        return Response({'msg': 'Visibilidad actualizada correctamente.'}, status=status.HTTP_200_OK)