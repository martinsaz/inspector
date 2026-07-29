using checklist.Models.EstrcuturaCombo;
using checklist.Models.Roles;
using checklist.Models.Usuarios;
using Firebase.Auth;
using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json;
using RestSharp;
using System.Drawing;
using System.Security.Claims;
using System.Security.Policy;
using System.Text;

namespace checklist.Clases
{
    public class Utilerias
    {
		public async static Task<Opciones> GetOpcion( string cual,string idEmpresa, string idRol,string empresa, string cadena)
		{
            //string cadena = WebEncoders.Base64UrlEncode(Convert.FromBase64String(cadConexion));
            //string url = $"{Utilerias.UrlBase}Rol/GetRoles?cadConexion={cadena}&idEmpresa={empresa}&id={idRol}";
            string url = string.Format("{0}GetRoles?idEmpresa={1}&empresa={3}&id={2}&cadena={4}", Utilerias.UrlBase, idEmpresa, idRol, empresa, cadena);

            var client = new RestClient(url);
            var request = new RestRequest();
            request.Method = Method.Get;
            RestResponse response = await client.ExecuteAsync(request);
            List<respRoles> roles = JsonConvert.DeserializeObject<List<respRoles>>(response.Content);
            List<DataPair> result = new List<DataPair>();
            Opciones resultado = new Opciones();
            bool salir = false;
            foreach (respRoles role in roles)
            {
                List<Opciones> lstPerm = JsonConvert.DeserializeObject<List<Opciones>>(role.Permisos);
                foreach (Opciones permiso in lstPerm)
                {
                    if (permiso.Opcion.StartsWith(cual.Substring(0, 3)))
                    {
                        foreach (var hijo in permiso.Hijos)
                        {
                            if (hijo.Opcion.StartsWith(cual.Substring(0, 5)))
                            {
                                if (hijo.Hijos.Count > 0)
                                {
                                    if (cual.Length == 8)//CAMBIE DE 7 A 8 POR QUE NO ENTRABA LA OPCION
                                    {
                                        foreach (var nieto in hijo.Hijos)
                                        {
                                            if (nieto.Opcion == cual)
                                            {
                                                resultado = nieto;
                                                salir = true;
                                            }
                                            if (salir) break;
                                        }
                                    }
                                    else
                                    {
                                        foreach (var nieto in hijo.Hijos)
                                        {
                                            foreach (var bisnieto in nieto.Hijos)
                                            {
                                                if (bisnieto.Opcion == cual)
                                                {
                                                    resultado = bisnieto;
                                                    salir = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    if (hijo.Opcion == cual)
                                    {
                                        resultado = hijo;
                                        salir = true;
                                    }
                                }
                                if (salir) break;
                            }
                        }
                    }
                    if (salir) break;
                }
                if (salir) break;
            }
            return resultado;


        }
        public static DateTime FechaActual(String zona = "")
        {
            if (String.IsNullOrEmpty(zona)) zona = "Central Standard Time (Mexico)";
            DateTime timeUtc = DateTime.UtcNow;
            TimeZoneInfo cstZone = TimeZoneInfo.FindSystemTimeZoneById(zona);
            DateTime cstTime = TimeZoneInfo.ConvertTimeFromUtc(timeUtc, cstZone);
            return cstTime;
        }

        public static DateTime FechaActual2()
        {
            DateTime timeUtc = DateTime.UtcNow;
            TimeZoneInfo cstZone = TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time (Mexico)");
            DateTime cstTime = TimeZoneInfo.ConvertTimeFromUtc(timeUtc, cstZone);
            return cstTime;
        }
        public static String GetTimeStamp(DateTime fecha)
		{
			DateTime ahora = FechaActual();
			DateTime targetDate = new DateTime(fecha.Year, fecha.Month, fecha.Day, ahora.Hour, ahora.Minute, ahora.Second, DateTimeKind.Utc);
			long timestamp = (long)(targetDate - new DateTime(1970, 1, 1)).TotalMilliseconds;
			byte[] bytes = Encoding.UTF8.GetBytes(timestamp.ToString());
			return Convert.ToBase64String(bytes);
		}

		// CONFIGURACION PUBLICADA - CONSERVAR PARA DESPLIEGUE
		// public static string UrlBase { get; } = "http://mahahual-001-site23.ltempurl.com/";

		// CONFIGURACION LOCAL DE DESARROLLO
		public static string UrlBase { get; } = "http://localhost:5127/";
      
        public static string IdRol { get; set; }

        public static Models.Firebase.Usuario GetConfig(string cookieValue)
		{
			Models.Firebase.Usuario datosLogin = new Models.Firebase.Usuario();
			try
			{
				if (!string.IsNullOrEmpty(cookieValue))
				{
					datosLogin = JsonConvert.DeserializeObject<Models.Firebase.Usuario>(cookieValue);
				}
			}
			catch (Exception ex)
			{
				// Manejo de excepciones (opcional)
			}
			return datosLogin;
		}



		public static String LimpiaCadena(String cadena)
		{
			String regresa = cadena;
			if (!String.IsNullOrEmpty(cadena))
			{
				regresa = regresa.Replace("\"", "");
				regresa = regresa.Replace("\r\n", "");
				regresa = regresa.Replace("\\", "");
				regresa = regresa.Replace("Nombre:", "");
				regresa = regresa.Replace("{", "");
				regresa = regresa.Replace("}", "");
				return regresa.Trim();
			}
			else
			{
				return String.Empty;
			}
		}

		public static System.Drawing.Image ResizeMyImage(System.Drawing.Image image, int maxHeight)
		{
			var ratio = (double)maxHeight / image.Height;
			var newWidth = (int)(image.Width * ratio);
			var newHeight = (int)(image.Height * ratio);
			var newImage = new Bitmap(newWidth, newHeight);
			using (var g = Graphics.FromImage(newImage))
			{
				g.DrawImage(image, 0, 0, newWidth, newHeight);
			}
			return newImage;
		}

		public static string ImageToBase64(Image image)
		{
			using (MemoryStream ms = new MemoryStream())
			{
				// Convierte la imagen a bytes
				image.Save(ms, System.Drawing.Imaging.ImageFormat.Jpeg); // image.RawFormat);
				byte[] imageBytes = ms.ToArray();

				// Convierte los bytes a cadena base64
				string base64String = Convert.ToBase64String(imageBytes);
				return base64String;
			}
		}

		public static bool EsUrlValida(string direccion)
		{
			Uri uriResult;
			bool result = Uri.TryCreate(direccion, UriKind.Absolute, out uriResult) && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
			return result;
		}

		public static DateTime ConvertFromComplete(String fecha)
		{
			// Tue Aug 09 2022 00:00:00 GMT-0500 (Central Daylight Time)
			if (fecha.Contains("("))
			{
				fecha = fecha.Substring(0, fecha.IndexOf('(') - 1).Trim();
			}
			DateTime regresa = FechaActual();
			bool procesado = false;
			if (fecha.Contains("GMT"))
			{
				// ddd MMM dd yyyy HH:mm:ss 'GMT'K
				// ddd MMM dd yyyy HH:mm:ss GMT-0600
				regresa = DateTimeOffset.ParseExact(fecha, "ddd MMM dd yyyy HH:mm:ss 'GMT'K", System.Globalization.CultureInfo.InvariantCulture).DateTime;
				procesado = true;
			}
			else
			{
				if (fecha.Contains("Z"))
				{
					regresa = DateTime.ParseExact(fecha, "yyyy-MM-ddTHH:mm:ss.fffZ", System.Globalization.CultureInfo.InvariantCulture);
					procesado = true;
				}
			}
			if (!procesado)
			{
				DateTimeOffset tmpRegresa = DateTimeOffset.FromUnixTimeMilliseconds(long.Parse(fecha));
				regresa = tmpRegresa.UtcDateTime;
			}
			//TimeZoneInfo cstZone = TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time (Mexico)");
			//regresa = TimeZoneInfo.ConvertTimeFromUtc(regresa, cstZone);  // regresa.ToLocalTime();
			return regresa;
		}

		public static T DeserializeToObject<T>(string filepath) where T : class
		{
			System.Xml.Serialization.XmlSerializer ser = new System.Xml.Serialization.XmlSerializer(typeof(T));

			using (TextReader reader = new StringReader(filepath))
			{
				return (T)ser.Deserialize(reader);
			}
		}

		public static String GetTimeStamp()
		{
			long timestamp = (long)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds;
			return timestamp.ToString();
		}

		public static string Base64Encode(string plainText)
		{
			var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
			return System.Convert.ToBase64String(plainTextBytes);
		}

		public static string Base64Decode(string base64EncodedData)
		{
			var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
			return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
		}
	}
}
