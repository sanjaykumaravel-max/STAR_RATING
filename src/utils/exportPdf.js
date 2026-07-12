import { buildReportHtml } from "./exportHtml";

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

    let html2pdf;
    try {
      const module = await import("html2pdf.js");
      html2pdf = module.default?.default || module.default || module;
      if (typeof html2pdf !== "function") {
        throw new TypeError("html2pdf.js did not provide an export function");
      }
    } catch (err) {
      console.error("html2pdf import failed", err);
      return { ok: false, error: "html2pdf not installed" };
    }

    if (options.download === false) {
      // return blob
      const blob = await html2pdf().from(container).set(opt).outputPdf("blob");
      setTimeout(() => container.remove(), 300);
      return { ok: true, blob };
    }

    await new Promise((resolve, reject) => {
      try {
        html2pdf().from(container).set(opt).save().then(resolve).catch(reject);
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

export async function exportPDF(element, filename = "report.pdf") {
  // wait all images to load
  await Promise.all(Array.from(document.images).map(img => {
    return img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; });
  }));

  // useCORS helps html2canvas load external images (if server allows CORS)
  const opt = {
    margin: 10,
    filename,
    html2canvas: { useCORS: true, allowTaint: false, scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  // html2pdf is usually loaded via import or bundle
  await html2pdf().set(opt).from(element).save();
}

export default exportPdf;
