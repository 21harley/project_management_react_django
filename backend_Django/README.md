# API de Gestión de Proyectos y Tareas

Este es un proyecto de API desarrollado en Django Rest Framework que permite gestionar proyectos, tareas, usuarios y alertas. Los usuarios pueden autenticarse y, dependiendo de su rol, gestionar proyectos y tareas, recibir notificaciones, y realizar CRUD (Crear, Leer, Actualizar, Eliminar) de las entidades relacionadas.

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
  - `estado`: Estado de la tarea (e.g., `pendiente`, `desarrollo`, `terminado`, `observado`).
  - `asignada_a`: Usuario asignado a la tarea.
  - `proyecto`: Proyecto al que pertenece la tarea.

- **Alerta**
  - `id`: Identificador único.
  - `usuario`: Usuario destinatario de la alerta.
  - `mensaje`: Mensaje de la alerta.
  - `visible`: Indica si la alerta es visible.
  - `fecha_emision`: Fecha de emisión de la alerta.

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

## Poblamiento de Datos

El proyecto incluye un script de poblamiento de datos que genera automáticamente usuarios, proyectos, tareas, y alertas.

### Detalles del poblamiento:
- Se crean **4 usuarios**: 
  - El primer usuario es un **admin** con el nombre de usuario `admin` y los demás son **usuarios regulares** con los nombres de usuario `usuario2`, `usuario3`, y `usuario4`.
  - Todos los usuarios tienen la contraseña: `password123`.
- Se crean **4 proyectos**, asignados aleatoriamente a los usuarios.
- Cada proyecto tiene **6 tareas**, también asignadas aleatoriamente a los usuarios.
- Cada vez que se asigna un proyecto o tarea a un usuario, se genera una alerta notificándole de la asignación.

Para ejecutar el script de poblamiento de datos, asegúrate de tener configurada tu base de datos y ejecuta el siguiente comando en el shell de Django:

```bash
python manage.py shell
```

Luego, dentro del shell de Django:

```python
from <tu_app>.poblar import poblar_datos
poblar_datos()
```

Este script verificará si ya existen usuarios en la base de datos y, de ser así, evitará duplicar los datos.

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

6. Ejecuta el script de poblamiento de datos (opcional si deseas datos predefinidos):
   ```bash
   python manage.py shell
   from <tu_app>.poblar import poblar_datos
   poblar_datos()
   ```

7. Inicia el servidor:
   ```bash
   python manage.py runserver
   ```

8. Accede a la aplicación en [http://localhost:8000](http://localhost:8000).

> Asegúrate de reemplazar `<URL del repositorio>` y `<nombre_del_proyecto>` con los valores correspondientes.

---

Este README ahora incluye la explicación del script de poblamiento, los roles de los usuarios, y la contraseña predeterminada `password123`.
