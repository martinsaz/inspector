using Microsoft.VisualBasic.FileIO;

namespace checklist.Models.Temporales
{
    public class ImagenTemporal
    {
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public string idPregunta { get; set; }

        public ImagenTemporal(string filePath, string fileType, string idPregunta)
        {
            FilePath = filePath;
            FileType = fileType;
            this.idPregunta = idPregunta;
        }

        public ImagenTemporal()
        {
        }

        // Método Deconstruct que permite desestructuración
        public void Deconstruct(out string filePath, out string fileType, out string idPregunta)
        {
            filePath = FilePath;
            fileType = FileType;
            idPregunta = this.idPregunta;
        }
    }

   
}
