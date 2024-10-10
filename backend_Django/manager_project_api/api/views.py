from venv import logger
from rest_framework import viewsets, permissions
from .models import Proyecto, Tarea
from .serializers import ProyectoSerializer, TareaSerializer
from .models import Usuario
from .serializers import UsuarioSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

# Asegúrate de que esta clase ya esté definida como está
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
        # Verificar si el usuario es admin antes de guardar
        if self.request.user.rol != 'admin':
            # Lanza la excepción PermissionDenied si el usuario no tiene permisos
            raise PermissionDenied("Solo los administradores pueden crear un proyecto.")

        # Solo se guarda el proyecto si el usuario es admin
        serializer.save(usuario=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.rol != 'admin':
            if serializer.instance.usuario != self.request.user:
                raise PermissionDenied("No tiene permiso para actualizar este proyecto.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.rol != 'admin':
            if instance.usuario != self.request.user:
                raise PermissionDenied("No tiene permiso para eliminar este proyecto.")
        instance.delete()

# Vista para Tareas
class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    permission_classes = [IsAdminOrOwner]
    authentication_classes = [JWTAuthentication]  # Aseguramos que la autenticación JWT esté habilitada

    def get_queryset(self):
        # Los administradores pueden ver todas las tareas
        if self.request.user.rol == 'admin':
            return Tarea.objects.all()
        # Los usuarios regulares solo pueden ver las tareas asignadas a ellos
        return Tarea.objects.filter(asignada_a=self.request.user)

    def perform_create(self, serializer):
        # Permitir crear tareas solo a administradores o al usuario asignado al proyecto
        proyecto_id = self.request.data.get('proyecto_id')  # Asegúrate de enviar el ID del proyecto
        proyecto = Proyecto.objects.get(id=proyecto_id)

        if self.request.user.rol != 'admin' and proyecto.usuario != self.request.user:
            raise PermissionDenied("No tiene permiso para crear una tarea en este proyecto.")

        # Guardar la tarea asignada al usuario
        instance = serializer.save(asignada_a=self.request.user)
        logger.info(f"Tarea {instance.id} creada. Notificando a {instance.asignada_a.username}.")
        # Aquí puedes agregar lógica para notificar al usuario asignado

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        logger.info(f"Tarea {instance.id} actualizada. Notificando a {instance.asignada_a.username}.")
        # Aquí puedes agregar lógica para notificar al usuario asignado
        
        return Response(serializer.data)

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
        # Si el usuario es administrador, devuelve todos los usuarios
        if self.request.user.rol == 'admin':
            return Usuario.objects.all()
        # Si el usuario es regular, devuelve solo su propio usuario
        return Usuario.objects.filter(id=self.request.user.id)

    def get_permissions(self):
        if self.action in ['create', 'login']:
            self.permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'retrieve']:
            # Solo los administradores pueden listar todos los usuarios
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
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except Usuario.DoesNotExist:
            return Response({'detail': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.rol == 'admin' or instance == request.user:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            return Response({'detail': 'No tiene permiso para acceder a esta información.'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        logger.info(f"Usuario autenticado: {request.user.username}")
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "nombre": request.user.nombre,
            "rol": request.user.rol,
        })

    @action(detail=False, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_user(self, request):
        user = request.user
    
        # Verificar si el usuario tiene proyectos o tareas asociadas
        if user.proyecto_set.exists() or user.tarea_set.exists():
            return Response({'detail': 'No se puede eliminar el usuario porque tiene proyectos o tareas asociadas.'}, status=status.HTTP_400_BAD_REQUEST)
    
        # Permitir a un administrador eliminar cualquier usuario
        if request.user.rol == 'admin':
            user.delete()  # Eliminar el usuario
            return Response({'detail': 'Usuario eliminado correctamente.'}, status=status.HTTP_204_NO_CONTENT)
    
        # Permitir a un usuario normal eliminar solo su propio perfil
        if user == request.user:
            user.delete()  # Eliminar el usuario
            return Response({'detail': 'Usuario eliminado correctamente.'}, status=status.HTTP_204_NO_CONTENT)
    
        return Response({'detail': 'No tiene permiso para eliminar este usuario.'}, status=status.HTTP_403_FORBIDDEN)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
    
        # Verificar si el usuario está intentando cambiar el rol
        if 'rol' in request.data and request.user.rol != 'admin':
            return Response({'detail': 'No tiene permiso para modificar el rol.'}, status=status.HTTP_403_FORBIDDEN)
    
        # Verificar permisos para otros campos
        if instance != request.user and request.user.rol != 'admin':
            return Response({'detail': 'No tiene permiso para actualizar esta información.'}, status=status.HTTP_403_FORBIDDEN)
    
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
    
        return Response(serializer.data)
