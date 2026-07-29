using checklist.Models.Preguntas;
using Microsoft.Data.Sqlite;


namespace checklist.Services
{
    public class SQLiteHelper
    {
        private string _connectionString;

        public SQLiteHelper()
        {
            string rootPath = AppDomain.CurrentDomain.BaseDirectory;

            // Definir el nombre del archivo en la raíz del proyecto
            string databasePath = Path.Combine(rootPath, "respuestas.db");

            // Configurar la cadena de conexión
            _connectionString = $"Data Source={databasePath}";
            ReadData();


        }

        // Método para crear una conexión a la base de datos
        private SqliteConnection GetConnection()
        {
            return new SqliteConnection(_connectionString);
        }

        // Método para crear una tabla en la base de datos
        public void CreateTable()
        {
            using (var connection = GetConnection())
            {
                connection.Open();
                string query = @"
               CREATE TABLE IF NOT EXISTS respuestas (
                id TEXT PRIMARY KEY NOT NULL, -- Guid en C#, se almacena como TEXT en SQLite
                idEmpresa TEXT NOT NULL, -- Guid en C#
                idLista TEXT NOT NULL, -- Guid en C#
                idPregunta TEXT NOT NULL, -- Guid en C#
                RespuestaValor TEXT, -- String en C#
                Notas TEXT, -- String en C#
                idAlumno TEXT NOT NULL, -- Guid en C#
                idPrograma TEXT, -- Guid en C#
                idTipoPregunta REAL, -- Decimal en C# (se usa REAL para números con decimales en SQLite)
                Explicacion TEXT, -- String en C#
                Valor REAL, -- Decimal en C#
                Calificacion REAL, -- Decimal en C#
                obligatoria INTEGER, -- Boolean en C# (se almacena como 0 o 1 en SQLite)
                Fecha TEXT, -- DateTime en C# (usaremos TEXT para almacenar fecha en formato ISO 8601)
                FechaRespuesta TEXT, -- DateTime en C#
                evento TEXT, -- Guid en C#
                ValorCorrecto TEXT, -- String en C#
                idSucursal TEXT NOT NULL, -- Guid en C#
                idUsuario TEXT NOT NULL, -- Guid en C#
                Latitud TEXT, -- String en C#
                Longitud TEXT, -- String en C#
                stamp INTEGER -- Long en C# (se usa INTEGER en SQLite para números largos)
            )";

                using (var command = new SqliteCommand(query, connection))
                {
                    command.ExecuteNonQuery();
                }
            }
        }

        // Método para insertar datos en la tabla
        public void InsertRespuestas(List<Respuesta> respuestas, string idUsuario, string stamp)
        {
            using (var connection = GetConnection()) // Suponiendo que GetConnection() retorna una conexión a SQLite
            {
                connection.Open();

                string query = @"
        INSERT INTO respuestas (
            id, idEmpresa, idLista, idPregunta, RespuestaValor, Notas, idAlumno, idPrograma, 
            idTipoPregunta, Explicacion, Valor, Calificacion, obligatoria, 
            evento, idSucursal, idUsuario, Latitud, Longitud, stamp
        ) 
        VALUES (
            @id, @idEmpresa, @idLista, @idPregunta, @RespuestaValor, @Notas, @idAlumno, @idPrograma, 
            @idTipoPregunta, @Explicacion, @Valor, @Calificacion, @obligatoria, 
            @evento, @idSucursal, @idUsuario, @Latitud, @Longitud, @stamp
        )";

                foreach (var respuesta in respuestas)
                {
                    using (var command = new SqliteCommand(query, connection))
                    {
                        // Parámetros
                        command.Parameters.AddWithValue("@id", Guid.NewGuid().ToString());
                        command.Parameters.AddWithValue("@idEmpresa", respuesta.idEmpresa.ToString());
                        command.Parameters.AddWithValue("@idLista", respuesta.idLista.ToString());
                        command.Parameters.AddWithValue("@idPregunta", respuesta.idPregunta.ToString());
                        command.Parameters.AddWithValue("@RespuestaValor", respuesta.respuestaValor ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Notas", respuesta.notas ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@idAlumno", idUsuario);
                        command.Parameters.AddWithValue("@idPrograma", respuesta.idPrograma?.ToString() ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@idTipoPregunta", respuesta.idTipoPregunta.ToString());
                        command.Parameters.AddWithValue("@Explicacion", respuesta.explicacion ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Valor", respuesta.valor.ToString() ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Calificacion", respuesta.calificacion.ToString() ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@obligatoria", respuesta.obligatoria );
                        command.Parameters.AddWithValue("@evento", respuesta.evento?.ToString() ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@idSucursal", respuesta.idSucursal.ToString());
                        command.Parameters.AddWithValue("@idUsuario", respuesta.idUsuario.ToString());
                        command.Parameters.AddWithValue("@Latitud", respuesta.latitud ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Longitud", respuesta.longitud ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@stamp", stamp ?? (object)DBNull.Value);

                        // Ejecutar el comando
                        command.ExecuteNonQuery();
                    }
                }
            }
        }

        // Método para leer todos los registros de la tabla
        public void ReadData()
        {
            using (var connection = GetConnection())
            {
                connection.Open();
                string query = "SELECT Latitud FROM respuestas";

                using (var command = new SqliteCommand(query, connection))
                {
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                         
                            string latitud = reader.GetString(0);
                           
                        }
                    }
                }
            }
        }

        // Método para actualizar un registro en la tabla
        public void UpdateData(int id, string name, int age)
        {
            using (var connection = GetConnection())
            {
                connection.Open();
                string query = "UPDATE MyTable SET Name = @Name, Age = @Age WHERE Id = @Id";

                using (var command = new SqliteCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@Name", name);
                    command.Parameters.AddWithValue("@Age", age);
                    command.ExecuteNonQuery();
                }
            }
        }

        // Método para eliminar un registro de la tabla
        public void DeleteData(int id)
        {
            using (var connection = GetConnection())
            {
                connection.Open();
                string query = "DELETE FROM MyTable WHERE Id = @Id";

                using (var command = new SqliteCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.ExecuteNonQuery();
                }
            }
        }
    }
}
