from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProyectoViewSet, TareaViewSet, UsuarioViewSet

router = DefaultRouter()
router.register(r'projects', ProyectoViewSet)
router.register(r'tasks', TareaViewSet)
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

# Aquí puedes importar la vista de login
from .views import UsuarioViewSet  # Asegúrate de que tu vista de login esté en views.py

urlpatterns = [
    path('login/', UsuarioViewSet.as_view({'post': 'login'}), name='login'),
] + router.urls