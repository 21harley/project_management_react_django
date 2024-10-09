from rest_framework import viewsets, permissions
from .models import Proyecto, Tarea
from .serializers import ProyectoSerializer, TareaSerializer
from .models import Usuario
from .serializers import UsuarioSerializer
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action

# Permiso personalizado para que solo admins gestionen todos los proyectos y tareas
class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Si es admin, tiene acceso a todo
        if request.user.rol == 'admin':
            return True
        # Si es un usuario regular, solo tiene acceso a sus propios proyectos o tareas
        return obj.usuario == request.user or obj.asignada_a == request.user

# Vista para Proyectos
class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    permission_classes = [IsAdminOrOwner]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

# Vista para Tareas
class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    permission_classes = [IsAdminOrOwner]

    def perform_create(self, serializer):
        serializer.save(asignada_a=self.request.user)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        if self.action == 'create' or self.action == 'login':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(UsuarioViewSet, self).get_permissions()

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Guarda el usuario
        user = serializer.save()
        # Genera un token para el usuario
        refresh = RefreshToken.for_user(user)
        # Devuelve el token y el usuario como parte de la respuesta
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'token': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = Usuario.objects.get(username=username)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UsuarioSerializer(user).data,
                    'refresh': str(refresh),
                    'token': str(refresh.access_token),
                })
            else:
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except Usuario.DoesNotExist:
            return Response({'detail': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)