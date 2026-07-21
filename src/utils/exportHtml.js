/**
 * buildReportHtml(mine, result) -> string
 * inlineImages(htmlString) -> Promise<string>
 *
 * Usage:
 *  const html = buildReportHtml(mine, result);
 *  // if you want a standalone file that includes images as data URLs:
 *  const inlined = await inlineImages(html);
 *  const blob = new Blob([inlined], { type: "text/html;charset=utf-8" });
 */

export function buildReportHtml(mine = {}, result = {}) {
  const { answers = {}, proofs = {}, score = 0, totalPoints = 100, percentage = "0", moduleScores = {} } = result;
  const title = `Star Rating Report - ${mine.name || "Unknown Mine"}`;
  const date = new Date().toLocaleString();

  const moduleRows = Object.entries(moduleScores || {})
    .map(([k, v]) => `<tr><td style="padding:6px 8px;border:1px solid #eee">${escapeHtml(k)}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:center">${escapeHtml(String(v))}</td></tr>`)
    .join("");

  const answerRows = Object.entries(answers || {})
    .map(([k, v]) => `<tr><td style="padding:6px 8px;border:1px solid #eee">${escapeHtml(k)}</td><td style="padding:6px 8px;border:1px solid #eee">${escapeHtml(String(v))}</td></tr>`)
    .join("");

  const proofRows = Object.entries(proofs || {})
    .map(([k, f]) => `<tr><td style="padding:6px 8px;border:1px solid #eee">${escapeHtml(k)}</td><td style="padding:6px 8px;border:1px solid #eee">${escapeHtml(f?.name || "")}</td></tr>`)
    .join("");

  const logoSrc = "/au-logo.png";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<style>
  body{font-family:Segoe UI, Roboto, Arial, sans-serif; background:#fafafa; color:#222; margin:0; padding:24px;}
  .card{max-width:900px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,0.06);}
  .header{display:flex;align-items:center;gap:16px;margin-bottom:8px;}
  .logo{width:96px;height:auto;border-radius:12px;background:linear-gradient(90deg,#ff5f6d,#ffc371);padding:8px;}
  h1{font-size:20px;margin:0;}
  .meta{color:#666;font-size:13px;margin-top:4px;}
  table{border-collapse:collapse;width:100%;margin-top:12px}
  th,td{padding:8px;border:1px solid #eee;text-align:left}
  .btn{display:inline-block;padding:8px 12px;background:linear-gradient(90deg,#ff5f6d,#ffc371);color:#fff;border-radius:8px;text-decoration:none}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:16px}
  @media(max-width:720px){ .grid{grid-template-columns:1fr} .logo{width:72px} }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <img class="logo" src="${logoSrc}" alt="logo"/>
      <div>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Date: ${escapeHtml(date)} &nbsp; • &nbsp; Score: ${escapeHtml(String(score))} / ${escapeHtml(String(totalPoints))} &nbsp; • &nbsp; ${escapeHtml(String(percentage))}%</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <h3>Module Scores</h3>
        <table>
          <thead><tr><th>Module</th><th style="text-align:center">Score</th></tr></thead>
          <tbody>${moduleRows}</tbody>
        </table>
      </div>

      <div>
        <h3>Mine Details</h3>
        <table>
          <tbody>
            <tr><td style="width:40%"><strong>Name</strong></td><td>${escapeHtml(mine.name || "")}</td></tr>
            <tr><td><strong>Owner</strong></td><td>${escapeHtml(mine.owner || "")}</td></tr>
            <tr><td><strong>Hectares</strong></td><td>${escapeHtml(String(mine.hectares || ""))}</td></tr>
            <tr><td><strong>LIN</strong></td><td>${escapeHtml(mine.linNumber || "")}</td></tr>
            <tr><td><strong>Lease Duration</strong></td><td>${escapeHtml(String(mine.leaseDuration || ""))}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <h3 style="margin-top:18px">Answers</h3>
    <table><tbody>${answerRows}</tbody></table>

    <h3 style="margin-top:18px">Proofs / Attachments</h3>
    <table><tbody>${proofRows}</tbody></table>

    <div style="margin-top:20px;text-align:right">
      <a class="btn" href="#" onclick="window.print();return false;">Print / Save as PDF</a>
    </div>
  </div>
</body>
</html>`;
}

export async function inlineImages(htmlString) {
  // Runs in browser environment. Replaces <img src="..."> with data: URLs where possible.
  const container = document.createElement("div");
  container.innerHTML = htmlString;
  const imgs = Array.from(container.querySelectorAll("img"));

  await Promise.all(imgs.map(async (img) => {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:")) return;
    try {
      const url = src.startsWith("/") ? window.location.origin + src : new URL(src, window.location.href).href;
      const r = await fetch(url);
      if (!r.ok) return;
      const blob = await r.blob();
      const dataUrl = await blobToDataURL(blob);
      img.setAttribute("src", dataUrl);
    } catch (e) {
      // ignore individual image failures
      console.warn("inlineImages: failed to inline", src, e);
    }
  }));

  return container.innerHTML;
}

// helper: blob -> data URL
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default { buildReportHtml, inlineImages };
