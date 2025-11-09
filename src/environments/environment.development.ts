// Environment para desarrollo
// Configurado para usar el backend de AWS

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
const salesBaseUrl = ''

export const environment = {
    production: false,
    baseUrl: catalogBaseUrl,
    catalogApiUrl: catalogBaseUrl,
    logisticsApiUrl: logisticsBaseUrl,
    salesApiUrl: salesBaseUrl
};
