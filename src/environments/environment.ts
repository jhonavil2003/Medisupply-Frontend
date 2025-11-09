// Environment para producción
// Este archivo ahora lee las variables del archivo .env en la raíz del proyecto
// Para configurar las variables, edita el archivo .env

// La API Key de Google Maps se lee desde la variable de entorno GOOGLE_MAPS_API_KEY
// IMPORTANTE: Nunca commitear la API key directamente en el código

const googleMapsApiKey = (window as any)['env']?.['GOOGLE_MAPS_API_KEY'] || '';

export const environment = {
  production: true,
  catalogApiUrl: 'http://lb-catalog-service-11171664.us-east-1.elb.amazonaws.com',
  logisticsApiUrl: 'http://lb-logistics-service-1435144637.us-east-1.elb.amazonaws.com',
  salesApiUrl: 'http://localhost:3003', // TODO: Actualizar con load balancer de producción
  googleMapsApiKey: googleMapsApiKey
};
