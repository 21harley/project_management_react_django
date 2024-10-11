# API de Gestión de Proyectos y Tareas

Este es un proyecto de API desarrollado en Django Rest Framework que permite gestionar proyectos, tareas, usuarios y alertas. Los usuarios pueden autenticarse, y dependiendo de su rol, gestionar proyectos y tareas, recibir notificaciones y realizar CRUD (Crear, Leer, Actualizar, Eliminar) de las entidades relacionadas.

## Características

- **Autenticación JWT**: Los usuarios pueden registrarse e iniciar sesión utilizando JSON Web Tokens (JWT).
- **Gestión de Proyectos y Tareas**: Permite a los usuarios crear, asignar, y actualizar tareas dentro de proyectos.
- **Notificaciones**: Los usuarios reciben alertas cuando se les asignan proyectos o tareas.
- **Permisos basados en roles**: Los administradores tienen acceso total, mientras que los usuarios solo pueden interactuar con sus propios proyectos y tareas.

## Estructura del Proyecto

### Modelos

- **Usuario**
  - `id`: Identificador único.
  - `nombre`: Nombre del usuario.
  - `email`: Correo electrónico del usuario.
  - `password`: Contraseña (cifrada).
  - `rol`: Rol del usuario (e.g., `admin`, `usuario`).

- **Proyecto**
  - `id`: Identificador único del proyecto.
  - `nombre`: Nombre del proyecto.
  - `descripcion`: Descripción del proyecto.
  - `fecha_inicio`: Fecha de inicio del proyecto.
  - `fecha_finalizacion`: Fecha de finalización del proyecto.
  - `usuario`: Usuario encargado del proyecto.

- **Tarea**
  - `id`: Identificador único de la tarea.
  - `nombre`: Nombre de la tarea.
  - `descripcion`: Descripción de la tarea.
  - `estado`: Estado de la tarea (e.g., `pendiente`, `completada`).
  - `asignada_a`: Usuario asignado a la tarea.
  - `proyecto`: Proyecto al que pertenece la tarea.

- **Alerta**
  - `id`: Identificador único.
  - `usuario`: Usuario destinatario de la alerta.
  - `mensaje`: Mensaje de la alerta.

### Rutas

- **Usuario**
  - `POST /api/registro`: Registra un nuevo usuario.
  - `POST /api/login`: Inicia sesión y retorna un token de acceso.
  - `GET /api/me`: Devuelve los detalles del usuario autenticado.
  - `DELETE /api/usuarios/{id}`: Elimina un usuario.

- **Proyecto**
  - `GET /api/proyectos`: Lista todos los proyectos (solo administradores).
  - `POST /api/proyectos`: Crea un nuevo proyecto (solo administradores).
  - `PUT /api/proyectos/{id}`: Actualiza un proyecto existente.
  - `DELETE /api/proyectos/{id}`: Elimina un proyecto (si no tiene tareas asociadas).

- **Tarea**
  - `GET /api/tareas`: Lista las tareas del usuario autenticado.
  - `POST /api/tareas`: Crea una nueva tarea dentro de un proyecto.
  - `PUT /api/tareas/{id}`: Actualiza una tarea existente.
  - `DELETE /api/tareas/{id}`: Elimina una tarea.

- **Alerta**
  - `GET /api/alertas`: Lista las alertas del usuario autenticado.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <URL del repositorio>
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd <nombre_del_proyecto>
   ```

3. Crea un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows, usa: venv\Scripts\activate
   ```

4. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

5. Ejecuta las migraciones:
   ```bash
   python manage.py migrate
   ```

6. Inicia el servidor:
   ```bash
   python manage.py runserver
   ```

7. Accede a la aplicación en [http://localhost:8000](http://localhost:8000).

> Asegúrate de reemplazar `<URL del repositorio>` y `<nombre_del_proyecto>` con los valores correspondientes.

