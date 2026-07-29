// ConnectionManager.js
class ConnectionManager {
    constructor() {
        // CONFIGURACION PUBLICADA - CONSERVAR PARA DESPLIEGUE
        // this.connectionString = 'http://mahahual-001-site23.ltempurl.com/';

        // CONFIGURACION LOCAL DE DESARROLLO
        this.connectionString = 'http://localhost:5127/';
    }

    // Método para obtener la cadena de conexión
    getConnectionString() {
        return this.connectionString;
    }
}

// Exportar la clase para que pueda ser utilizada en otros archivos
export default ConnectionManager;
