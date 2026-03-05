# 🤖 Pocki Bot – Asistente Virtual de WhatsApp

Bot de WhatsApp con inteligencia artificial desarrollado como prueba técnica para **C-Pocket**. Recibe mensajes de texto, analiza la intención del usuario con IA, ejecuta herramientas personalizadas (tools) y responde directamente por WhatsApp.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico y Decisiones Técnicas](#-stack-tecnológico-y-decisiones-técnicas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Documentación de Endpoints](#-documentación-de-endpoints)
- [Tool Implementada – TRM (Precio del Dólar)](#-tool-implementada--trm-precio-del-dólar)
- [Manejo de Errores](#-manejo-de-errores)

---

## ✨ Características

- Recepción de mensajes desde WhatsApp vía Meta Cloud API
- Análisis de intención del usuario con IA (Groq + LLaMA)
- Ejecución de herramientas (tools) según la intención detectada
- Consulta en tiempo real del precio del dólar (TRM) mediante web scraping
- Persistencia de mensajes y respuestas en PostgreSQL (Supabase)
- Documentación interactiva de endpoints con Swagger
- Dockerizado para despliegue sin dependencias locales

---

## 🏗 Arquitectura

El proyecto sigue una **arquitectura modular basada en servicios y repositorios**, aplicando principios SOLID y separación de responsabilidades. Cada módulo es independiente, lo que facilita el mantenimiento y la escalabilidad.

### Flujo general

```
WhatsApp (usuario)
        │
        ▼
[POST /webhook]  ← Meta Cloud API
        │
        ▼
  WhatsappModule
  (valida y parsea el mensaje entrante)
        │
        ▼
   OpenAIModule
   (analiza intención con Groq/LLaMA)
        │
     ¿Tool?
    /      \
  Sí        No
  │          │
  ▼          ▼
ToolsModule  Respuesta directa
(ejecuta     de la IA
 la tool)
   │
   ▼
MessagesModule
(persiste en DB y envía respuesta a WhatsApp)
```

### Principios aplicados

- **Single Responsibility**: cada servicio tiene una única responsabilidad (enviar mensajes, consultar IA, ejecutar tools, persistir datos).
- **Open/Closed**: agregar una nueva tool no requiere modificar el código existente, solo registrar la nueva herramienta en el módulo de tools.
- **Dependency Injection**: NestJS gestiona las dependencias entre módulos vía su sistema de DI, evitando acoplamientos directos.
- **Repository Pattern**: en el módulo `messages`, el acceso a base de datos está abstraído en un repositorio, desacoplando la lógica de negocio de la capa de persistencia.

---

## 🛠 Stack Tecnológico y Decisiones Técnicas

| Tecnología | Rol | Por qué |
|---|---|---|
| **NestJS** | Framework backend | Tipado fuerte con TypeScript, arquitectura modular nativa, inyección de dependencias, decoradores para Swagger. Viene de Node.js puro pero NestJS ofrece estructura sólida para proyectos escalables. |
| **Groq (API de OpenAI compatible)** | Motor de IA | Mucho más accesible que OpenAI puro: cuota gratuita generosa, latencia muy baja con LLaMA, y compatible con el SDK de OpenAI, lo que facilita la integración sin cambiar código. |
| **Meta WhatsApp Cloud API** | Canal de mensajería | API oficial de Meta, estable y con soporte para webhooks, envío de mensajes y validación de tokens. |
| **PostgreSQL en Supabase** | Base de datos | Al alojar la DB en Supabase, el proyecto no depende de entornos locales. Funciona igual en local y en producción, sin configuración adicional. |
| **Docker / Docker Compose** | Containerización | Elimina conflictos de versiones de Node.js y dependencias. Un solo comando levanta el proyecto completo sin instalar nada. |
| **Swagger (OpenAPI)** | Documentación | Integrado directamente en NestJS con `@nestjs/swagger`. Más cómodo que Postman para documentar y probar endpoints en desarrollo. |

---

## 📁 Estructura del Proyecto

```
src/
├── messages/                     # Persistencia de mensajes
│   ├── entities/                 # Entidades de TypeORM / modelos de DB
│   ├── interfaces/               # Contratos e interfaces del módulo
│   ├── messages.controller.ts
│   ├── messages.service.ts       # Lógica de negocio
│   ├── messages.repository.ts    # Acceso a base de datos (Repository Pattern)
│   └── messages.module.ts
│
├── openai/                       # Integración con Groq/IA
│   ├── interfaces/               # Contratos e interfaces del módulo
│   ├── openai.service.ts         # Llama a la API de Groq, gestiona el function calling
│   └── openai.module.ts
│
├── tools/                        # Herramientas personalizadas (tools)
│   ├── interfaces/               # Contratos e interfaces del módulo
│   ├── tools.service.ts          # Ejecuta la tool correspondiente (TRM, etc.)
│   └── tools.module.ts
│
├── whatsapp/                     # Entrada de mensajes y envío de respuestas
│   ├── interfaces/               # Contratos e interfaces del módulo
│   ├── whatsapp.controller.ts    # Endpoints GET (webhook) y POST (mensajes)
│   ├── whatsapp.service.ts       # Orquesta el flujo completo
│   └── whatsapp.module.ts
│
└── main.ts                       # Bootstrap, configuración de Swagger
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Clave de OpenAI (también usada para autenticar contra Groq vía SDK compatible)
OPENAI_API_KEY=sk-proj-...

# Clave de Groq (modelo LLaMA gratuito)
GROQ_API_KEY=gsk_...

# ID del número de teléfono de WhatsApp (desde Meta Developers)
WHATSAPP_PHONE_NUMBER_ID=...

# Token de acceso temporal de WhatsApp (Meta Developers → WhatsApp → API Setup)
WHATSAPP_TOKEN=...

# URL de conexión a PostgreSQL (Supabase o local)
DATABASE_URL=postgresql://usuario:password@host:5432/postgres

# Token secreto para verificar el webhook de Meta
WEBHOOK_VERIFY_TOKEN=pocki_secret_2026
```

> Puedes usar el archivo `.env.example` incluido en el repositorio como plantilla.

---

## 🚀 Instalación y Ejecución

### Opción 1 – Docker (recomendado)

Requiere tener [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

```bash
# 1. Clona el repositorio
git clone -b main https://github.com/Wgutierrezl/C-Pocket-IA-Test.git .

# 2. Crea el archivo .env con las variables de entorno

# 3. Levanta el proyecto
docker-compose up --build
```

El API estará disponible en `http://localhost:3000`

---

### Opción 2 – Manual con Node.js

Requiere Node.js instalado (v18+ recomendado).

```bash
# 1. Clona el repositorio
git clone -b main https://github.com/Wgutierrezl/C-Pocket-IA-Test.git .

# 2. Instala dependencias
npm install

# 3. Crea el archivo .env con las variables de entorno

# 4. Levanta el servidor en modo desarrollo
npm run start:dev
```

El API estará disponible en `http://localhost:3000`

---

## 📖 Documentación de Endpoints

La documentación interactiva está disponible en:

```
http://localhost:3000/docs
```

### Endpoints disponibles

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/webhook` | Verificación del webhook con Meta (handshake inicial) |
| `POST` | `/webhook` | Recepción de mensajes entrantes desde WhatsApp |
| `GET` | `/health` | Health check – verifica que el API esté activo |

---

## 🔧 Tool Implementada – TRM (Precio del Dólar)

La tool de TRM realiza **web scraping en tiempo real** para obtener el precio actual del dólar (Tasa Representativa del Mercado) en Colombia.

### ¿Cómo funciona?

1. El usuario envía un mensaje como: *"¿Cuánto está el dólar hoy?"* o *"¿Cuál es el TRM actual?"*
2. Groq analiza la intención y detecta que debe ejecutar la tool `get_trm`
3. El `ToolsService` ejecuta el scraping al sitio de referencia
4. El resultado se procesa y se devuelve al usuario como mensaje de WhatsApp

### Ejemplo de respuesta

```
💵 El precio del dólar hoy es: $4.185,50 COP
Fuente: Banco de la República – actualizado hoy
```

---

## ⚠️ Manejo de Errores

### Token de WhatsApp expirado (Error 401)

El token de WhatsApp en modo sandbox **expira periódicamente**. Si ves un error `401` de Meta:

1. Ve a [Meta Developers](https://developers.facebook.com/) → tu app → **WhatsApp → API Setup**
2. Genera un nuevo **Temporary access token**
3. Actualiza `WHATSAPP_TOKEN` en tu `.env`
4. Reinicia el contenedor: `docker-compose restart`

### ngrok y URLs dinámicas

Este proyecto se expone localmente con **ngrok**. Ten en cuenta que:
- La URL de ngrok **cambia cada vez** que reinicias el túnel
- Debes actualizar la URL del webhook en Meta Developers cada vez que esto ocurra
- Para producción real se recomienda desplegar en un servidor con URL fija (Railway, Render, AWS, etc.)

---

## 👨‍💻 Autor

**Walter Ernesto Gutiérrez Londoño**  
Prueba técnica – C-Pocket / Pocki Asistente Virtual