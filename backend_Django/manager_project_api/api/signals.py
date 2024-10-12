from django.db.models.signals import post_migrate
from django.dispatch import receiver
from api.scripts.populate import poblar_datos

@receiver(post_migrate)
def ejecutar_poblamiento(sender, **kwargs):
    poblar_datos()