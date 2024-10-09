from rest_framework import serializers
from .models import Usuario, Proyecto, Tarea
from django.contrib.auth.hashers import make_password

class UsuarioSerializer(serializers.ModelSerializer):
    # Include password in the serializer
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'nombre', 'password','rol']

    def create(self, validated_data):
        # Hash the password before saving the user
        validated_data['password'] = make_password(validated_data['password'])
        return super(UsuarioSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        # If a new password is provided, hash it before saving
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super(UsuarioSerializer, self).update(instance, validated_data)


class ProyectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_finalizacion', 'usuario']

class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarea
        fields = ['id', 'nombre', 'descripcion', 'estado', 'proyecto', 'asignada_a']