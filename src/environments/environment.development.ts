// Environment para desarrollo
// Configurado para usar el backend de AWS

// Para usar AWS (actual):
//const catalogBaseUrl = 'http://lb-catalog-service-11171664.us-east-1.elb.amazonaws.com'

// Para usar localhost (comentar la línea de arriba y descomentar esta):
const catalogBaseUrl = 'http://lb-catalog-service-11171664.us-east-1.elb.amazonaws.com'

// Servicio de logística
// Opción 1: Usar el proxy (dejar vacío) - requiere npm start con --proxy-config
// const logisticsBaseUrl = ''
// Opción 2: Conectar directamente a AWS (sin proxy)
const logisticsBaseUrl = 'http://lb-logistics-service-1435144637.us-east-1.elb.amazonaws.com'

export const environment = {
    production: false,
    baseUrl: catalogBaseUrl,
    catalogApiUrl: catalogBaseUrl,
    logisticsApiUrl: logisticsBaseUrl
};
