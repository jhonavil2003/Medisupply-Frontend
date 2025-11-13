// Environment para desarrollo
// Este archivo ahora lee las variables del archivo .env en la raíz del proyecto
// Para configurar las variables, edita el archivo .env

// La API Key de Google Maps se lee desde la variable de entorno GOOGLE_MAPS_API_KEY
// Asegúrate de que el archivo .env existe y contiene: GOOGLE_MAPS_API_KEY=tu_api_key

// Para usar AWS (actual):
//const catalogBaseUrl = 'http://lb-catalog-service-11171664.us-east-1.elb.amazonaws.com'

// Para usar localhost (comentar la línea de arriba y descomentar esta):
const catalogBaseUrl = 'http://localhost:3001'

// Servicio de logística (puerto 3002)
// Usar ruta vacía para aprovechar el proxy configurado en proxy.conf.json
// El proxy redirigirá /inventory/** a http://localhost:3002/inventory/**
const logisticsBaseUrl = ''

// Servicio de ventas (puerto 3003)
// Usar ruta vacía para aprovechar el proxy configurado en proxy.conf.json
// El proxy redirigirá /orders/** a http://localhost:3003/orders/**
// El proxy redirigirá /salesperson-goals/** a http://localhost:3003/salesperson-goals/**
// El proxy redirigirá /reports/** a http://localhost:3003/reports/**
const salesBaseUrl = ''

// Google Maps API Key - Lee desde variable de entorno
// IMPORTANTE: Nunca commitear la API key directamente en el código
// La clave real debe estar en el archivo .env (que está en .gitignore)
const googleMapsApiKey = (window as any)['env']?.['GOOGLE_MAPS_API_KEY'] || '';

export const environment = {
    production: false,
    baseUrl: catalogBaseUrl,
    catalogApiUrl: catalogBaseUrl,
    logisticsApiUrl: logisticsBaseUrl,
    salesApiUrl: salesBaseUrl,
    googleMapsApiKey: googleMapsApiKey
};
