from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AlertaViewSet, ProyectoViewSet, TareaViewSet, UsuarioViewSet

router = DefaultRouter()
router.register(r'projects', ProyectoViewSet)
router.register(r'tasks', TareaViewSet)
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'alertas', AlertaViewSet, basename='alerta')
# Aquí puedes importar la vista de login
from .views import UsuarioViewSet  # Asegúrate de que tu vista de login esté en views.py

urlpatterns = [
    path('api/login/', UsuarioViewSet.as_view({'post': 'login'}), name='login'),
    path('api/me/', UsuarioViewSet.as_view({'get': 'me'}), name='me'),  # Ruta para ver datos del usuario
    path('api/usuarios/delete/', UsuarioViewSet.as_view({'delete': 'delete_user'}), name='delete_user'),  # Ruta para eliminar usuario
] + router.urls
