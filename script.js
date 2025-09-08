const cropBtn = document.getElementById("cropBtn");
const pdfInput = document.getElementById("pdfInput");
const statusText = document.getElementById("status");

// Perfiles solicitados (mismos valores que diste)
const PERFIL_ANTIGUA = { LEFT_PT: 35, TOP_PT: 35, RIGHT_PT: 340, BOTTOM_PT: 415 };
const PERFIL_NUEVA   = { LEFT_PT: 5,  TOP_PT: 70, RIGHT_PT: 298, BOTTOM_PT: 360 };

function getPerfilSeleccionado() {
  const antigua = document.getElementById("perfilAntigua");
  return antigua && antigua.checked ? PERFIL_ANTIGUA : PERFIL_NUEVA;
}

cropBtn.addEventListener("click", async () => {
  const file = pdfInput.files[0];
  if (!file) {
    statusText.textContent = "Por favor selecciona un archivo PDF.";
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // Lee el perfil elegido (Antigua/Nueva)
    const P = getPerfilSeleccionado();

    pages.forEach((page) => {
      const { width, height } = page.getSize();

      // Tu semántica original:
      // LEFT/RIGHT = coordenadas X directas desde la izquierda (xMin/xMax)
      // TOP/BOTTOM = distancias medidas desde ARRIBA -> convertir a coordenadas Y
      const xMin = Math.max(0, Math.min(P.LEFT_PT, width));
      const xMax = Math.max(0, Math.min(P.RIGHT_PT, width));

      const yTop    = Math.max(0, Math.min(height - P.TOP_PT, height));     // coord Y del borde superior
      const yBottom = Math.max(0, Math.min(height - P.BOTTOM_PT, height));  // coord Y del borde inferior

      const x = Math.min(xMin, xMax);
      const y = Math.min(yBottom, yTop);
      const w = Math.max(0, Math.abs(xMax - xMin));
      const h = Math.max(0, Math.abs(yTop - yBottom));

      if (w <= 0 || h <= 0) {
        throw new Error("El rectángulo de recorte es inválido con estos parámetros.");
      }

      // pdf-lib espera (x, y, width, height)
      page.setCropBox(x, y, w, h);
      // Si quisieras que algunos visores lo “recorten duro”, podrías también:
      // page.setMediaBox(x, y, w, h);
    });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cropped_" + file.name;
    link.click();

    statusText.textContent = "PDF recortado descargado exitosamente.";
  } catch (err) {
    statusText.textContent = "Error al procesar el PDF: " + err.message;
  }
});
