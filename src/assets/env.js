// Script para cargar variables de entorno en el navegador
// Este script se ejecuta ANTES de que Angular inicie y carga las variables de forma SÍNCRONA

(function (window) {
  window.env = window.env || {};

  // Realizar una petición síncrona para cargar las variables de entorno
  // Esto garantiza que las variables estén disponibles antes de que Angular arranque
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/assets/env.json', false); // false = síncrono
  
  try {
    xhr.send(null);
    
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      window.env = data;
      console.log('✅ Variables de entorno cargadas correctamente');
    } else {
      console.warn('⚠️ No se pudo cargar env.json (status: ' + xhr.status + ')');
      console.warn('⚠️ Usando valores por defecto');
      window.env = {
        GOOGLE_MAPS_API_KEY: ''
      };
    }
  } catch (e) {
    console.error('❌ Error al cargar variables de entorno:', e);
    window.env = {
      GOOGLE_MAPS_API_KEY: ''
    };
  }
})(window);
