# Snowy Ventas - SaaS Version

Snowy Ventas es un sistema integral de punto de ventas, gestión de inventario y contabilidad moderno (Snapshot 2026). Cuenta con funcionalidades avanzadas como autenticación segura con JWT, roles de usuario, captura de logs de acceso, dashboard con análisis financieros y reportes exportables en PDF. 

## 🚀 Características Principales

*   **Punto de Venta (POS)**: Validación de stock en tiempo real, cálculos automáticos de subtotal y registro inteligente de ventas y clientes.
*   **Gestión de Producto e Inventario**: Control de existencias (Soft Deletion protegido), gestión de costos/ganancias e Historial de Reposición a proveedores.
*   **Contabilidad y Finanzas**: Dashboard analítico con Gráficos Integrados (Recharts) confrontando Ingresos y Egresos en tiempo real mediante reportes de caja.
*   **Auditoría Forense y Roles**: Monitor de movimientos organizados con descarga automática a formatos impresos estructurados en Tablas vía `jsPDF`.
*   **Sistema de Seguridad**: Protección con Custom Canvas CAPTCHA validado por estado, encriptación Bcrypt, evaluación en vivo de Fortaleza de Contraseñas (Débil/Media/Fuerte) y Trazabilidad de Logs de Acceso con Browser/IP tracking.
*   **Experiencia de Usuario**: Interfaz Premium SaaS bajo el paradigma **Glassmorphism**, diseño 100% nativo (Modern CSS/Sin SASS), Layouts responsivos y Tema Claro/Oscuro en tiempo real.

## 💻 Stack Tecnológico

*   **Frontend:** React (Vite 2026), Modern Native CSS, React Router, Recharts, jsPDF, Axios.
*   **Backend:** Node.js, Express.js y Bcrypt.
*   **Base de Datos:** MySQL (Soporte Cloud Aiven SSL).

## 📂 Requisitos Previos

*   Node.js v16+
*   Servidor MySQL Local (XAMPP o Workbench) o Remoto.

## 🛠️ Instalación y Uso

1. **Clonar este repositorio**.
2. **Configurar el Backend:**
   * Navega a la carpeta `/server` vía consola.
   * Ejecuta `npm install` para instalar dependencias.
   * Copia `.env.example` a un nuevo archivo `.env` y configura tus credenciales de Base de Datos.
   * Ejecuta `npm run dev` para levantar el servidor en `localhost:4000`.
3. **Configurar el Frontend:**
   * Navega a la carpeta `/client` vía consola nueva.
   * Ejecuta `npm install`.
   * Copia `.env.example` a un nuevo `.env` asegurándote de que `VITE_API_URL` apunte a tu API (ej. `http://localhost:4000`).
   * Ejecuta `npm run dev` para arrancar la aplicación de React.

## 🔐 Accesos del Sistema

Por seguridad, los generadores iniciales se definen y almacenan de forma aislada en el entorno del administrador (Verificables en el Backend si se levantan scripts manuales de inicialización).
Desde el módulo "Usuarios", el Administrador podrá crear nuevas cuentas validadas (min. 8 caracteres, especial/mayúscula/número requisitados).
