# Guía de Solución: Notificaciones Push en iOS (iPhone)

Esta guía documenta los pasos necesarios para hacer que las notificaciones de OneSignal funcionen en dispositivos iOS (iPhone), resolviendo las restricciones estrictas de Apple.

## El Problema Original
Las notificaciones funcionaban en PC pero no en iPhone. El botón de suscripción no hacía nada y no se mostraban los cuadros de diálogo de OneSignal.

## La Solución

### 1. Requisito Indispensable de Apple
Para que iOS permita notificaciones web, la página **DEBE ser guardada en la pantalla de inicio** por el usuario (como una PWA) y abrirse desde ese ícono. Safari normal no permite notificaciones.

### 2. Configuración del Archivo `manifest.json`
iOS necesita saber que la web es una aplicación independiente. Se creó un archivo `manifest.json` en la raíz con la siguiente línea clave:
```json
"display": "standalone"
```

### 3. Meta Tags en el `<head>` de `index.html`
Para que iOS reconozca correctamente la app al guardarla, se deben incluir estas etiquetas:
```html
<link rel="manifest" href="manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="img/logo.png">
```

### 4. Respetar el "User Gesture" (Gesto del Usuario)
iOS bloquea cualquier solicitud de permiso si no viene directamente de un clic del usuario. 
* **Regla de oro:** No pongas ventanas de `alert()` ni pausas asíncronas entre el clic del usuario y la llamada a OneSignal, o iOS romperá la cadena de confianza y bloqueará el permiso.

### 5. Uso de "Custom Link" de OneSignal
En lugar de crear botones con código Javascript personalizado que suele fallar en iOS por pérdida de sincronía, la mejor opción es usar la opción **Custom Link** en el panel de OneSignal y colocar el contenedor en el HTML:
```html
<div class='onesignal-customlink-container'></div>
```
OneSignal se encargará de inyectar el botón y manejar los permisos de forma compatible con Apple.

---
*Nota: Si el usuario rechaza el permiso la primera vez, el botón no volverá a funcionar hasta que el usuario vaya manualmente a Ajustes -> Notificaciones -> EldatoPaweno en su iPhone y las active.*
