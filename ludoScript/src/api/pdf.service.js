// ── pdf.service.js ────────────────────────────────────────────────────────────
// Servicio para la gestión de PDFs subidos por el usuario.
//
// Cubre las operaciones de la interfaz del PdfManager:
//   - Subir un PDF (que Gemini procesará en el backend)
//   - Listar los PDFs del usuario
//   - Eliminar un PDF
//
// Las rutas de obtención de contenido (/quiz y /flashcards) las consume
// directamente useActivitySession mediante api.get(), sin pasar por aquí.
// ─────────────────────────────────────────────────────────────────────────────
import api from "./axios";

export const pdfService = {
  /**
   * Sube un PDF al servidor para que sea procesado por Gemini.
   * Usa FormData porque el archivo es binario y no puede enviarse como JSON.
   * @param {File} file - Objeto File del input nativo del navegador
   * @returns {Promise<{ id, originalName, createdAt }>}
   */
  uploadPdf(file) {
    const formData = new FormData();
    // El campo "file" debe coincidir con el nombre que espera multer en el backend
    formData.append("file", file);
    return api.post("/pdfs", formData, {
      // Axios detecta FormData y pone el Content-Type correcto automáticamente
      // (multipart/form-data con el boundary adecuado)
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Obtiene la lista de PDFs del usuario autenticado.
   * Solo devuelve metadata (id, originalName, createdAt), sin el contenido de juego.
   * @returns {Promise<Array<{ id, originalName, createdAt }>>}
   */
  listPdfs() {
    return api.get("/pdfs");
  },

  /**
   * Elimina un PDF del usuario (borra el registro de la BD).
   * @param {number} id - ID del PDF a eliminar
   * @returns {Promise<{ success: boolean }>}
   */
  deletePdf(id) {
    return api.delete(`/pdfs/${id}`);
  },
};
