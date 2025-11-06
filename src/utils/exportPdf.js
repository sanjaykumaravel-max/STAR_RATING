import buildReportHtml from "./exportHtml";

/**
 * exportPdf: generates PDF using html2pdf.js and triggers download (or returns blob)
 * options:
 *   - filename: override filename
 *   - margin: number
 *   - download: true (default) | false (return blob)
 */
export async function exportPdf(mine = {}, result = {}, options = {}) {
  const filename = options.filename || `${(mine.name || "report")}_StarRating.pdf`;
  const opt = {
    margin: options.margin ?? 10,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: options.html2canvas?.scale ?? 2, useCORS: true, allowTaint: true, ...(options.html2canvas || {}) },
    jsPDF: { unit: "mm", format: options.jsPDF?.format ?? "a4", orientation: options.jsPDF?.orientation ?? "portrait", ...(options.jsPDF || {}) },
  };

  try {
    const html = buildReportHtml(mine, result);

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = options.width || "800px";
    container.innerHTML = html;
    document.body.appendChild(container);

    // wait for images
    await new Promise((resolve) => {
      const imgs = container.querySelectorAll("img");
      if (!imgs || imgs.length === 0) return resolve();
      let loaded = 0;
      imgs.forEach((img) => {
        if (img.complete) {
          loaded++;
          if (loaded === imgs.length) resolve();
        } else {
          img.onload = img.onerror = () => {
            loaded++;
            if (loaded === imgs.length) resolve();
          };
        }
      });
    });

    let html2pdfModule;
    try {
      html2pdfModule = (await import("html2pdf.js")).default || (await import("html2pdf.js"));
    } catch (err) {
      console.error("html2pdf import failed", err);
      return { ok: false, error: "html2pdf not installed" };
    }

    if (options.download === false) {
      // return blob
      const blob = await html2pdfModule().from(container).set(opt).outputPdf("blob");
      setTimeout(() => container.remove(), 300);
      return { ok: true, blob };
    }

    await new Promise((resolve, reject) => {
      try {
        html2pdfModule().from(container).set(opt).save().then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });

    setTimeout(() => container.remove(), 300);
    return { ok: true };
  } catch (err) {
    console.error("exportPdf error", err);
    return { ok: false, error: err };
  }
}

export default exportPdf;