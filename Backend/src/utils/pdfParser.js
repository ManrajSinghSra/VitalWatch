import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const extractPdfText = async (buffer) => {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer), // 🔥 FIX HERE
    });

    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;

  } catch (err) {
    console.error("PDF PARSE ERROR:", err.message);
    throw err;
  }
};