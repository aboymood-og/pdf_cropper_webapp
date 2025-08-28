const cropBtn = document.getElementById("cropBtn");
const pdfInput = document.getElementById("pdfInput");
const statusText = document.getElementById("status");

// Parámetros de recorte (en puntos)
const LEFT_PT = 5;
const TOP_PT = 100;
const RIGHT_PT = 293;
const BOTTOM_PT = 360;

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

    pages.forEach((page) => {
      const { width, height } = page.getSize();

      const newLeft = Math.max(0, LEFT_PT);
      const newBottom = Math.max(0, height - BOTTOM_PT);
      const newRight = Math.min(RIGHT_PT, width);
      const newTop = Math.min(height - TOP_PT, height);

      // Ajuste del crop box (xMin, yMin, xMax, yMax)
      page.setCropBox(newLeft, newBottom, newRight, newTop);
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
