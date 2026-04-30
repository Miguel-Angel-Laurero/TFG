const { createClient } = require('@supabase/supabase-js')
const path = require('path')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // usa la service_role key, no la anon
)

/**
 * Sube un archivo al bucket "images" de Supabase Storage.
 * Ruta resultante: items/{categoryName}/{equipped/}{filename}
 * 
 * @param {Buffer} buffer       - Contenido del archivo
 * @param {string} originalName - Nombre original del archivo
 * @param {string} mimeType     - MIME type (image/png, image/jpeg...)
 * @param {string} categoryName - Nombre de la categoría (para el folder)
 * @param {boolean} isEquipped  - Si es true, va dentro de /equipped/
 * @returns {string} URL pública del archivo subido
 */
async function uploadItemImage(buffer, originalName, mimeType, categoryName, isEquipped = false) {
  const ext      = path.extname(originalName)
  const filename = `${Date.now()}${ext}`
  const folder   = isEquipped
    ? `items/${categoryName}/equipped/${filename}`
    : `items/${categoryName}/${filename}`

  const { error } = await supabase.storage
    .from('images')
    .upload(folder, buffer, {
      contentType:  mimeType,
      upsert:       false,
    })

  if (error) throw new Error(`Error subiendo imagen a Supabase: ${error.message}`)

  const { data } = supabase.storage.from('images').getPublicUrl(folder)
  return data.publicUrl
}

module.exports = { uploadItemImage, supabase }