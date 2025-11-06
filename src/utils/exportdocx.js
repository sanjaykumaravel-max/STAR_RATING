import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ImageRun } from "docx";
import { saveAs } from "file-saver";

/** helper to convert dataURL to Uint8Array */
function dataUrlToUint8Array(dataUrl) {
  if (!dataUrl || !dataUrl.includes(",")) return null;
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
  return u8;
}

function objectToTable(obj = {}) {
  const rows = Object.entries(obj).map(([k, v]) =>
    new TableRow({
      children: [
        new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: String(k) })] }),
        new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: String(v ?? "") })] }),
      ],
    })
  );
  if (rows.length === 0) {
    rows.push(new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: "" })] }), new TableCell({ children: [new Paragraph({ text: "" })] })] }));
  }
  return new Table({ rows });
}

/**
 * exportDocx - builds a .docx with logo, mine details, module scores, answers and proofs (images embedded)
 */
export async function exportDocx(mine = {}, result = {}, filename) {
  const answers = result.answers || {};
  const proofs = result.proofs || {};
  const score = result.score ?? "";
  const totalPoints = result.totalPoints ?? "";
  const percentage = result.percentage ?? "";
  const moduleScores = result.moduleScores || (mine && mine.scores) || {};

  const children = [];

  // Try to fetch logo and embed
  try {
    const resp = await fetch("/logo.png");
    if (resp.ok) {
      const buffer = await resp.arrayBuffer();
      children.push(new Paragraph({ children: [ new ImageRun({ data: buffer, transformation: { width: 120, height: 120 } }) ] }));
    }
  } catch (e) {
    // ignore if logo fetch fails
  }

  children.push(new Paragraph({ text: `Star Rating Report`, heading: HeadingLevel.TITLE }));
  children.push(new Paragraph({ text: `Mine: ${mine.name || ""}` }));
  children.push(new Paragraph({ text: `Date: ${new Date().toLocaleString()}` }));
  children.push(new Paragraph({ text: `Score: ${score} / ${totalPoints}` }));
  children.push(new Paragraph({ text: `Percentage: ${percentage}${percentage !== "" ? "%" : ""}` }));
  children.push(new Paragraph({ text: "" }));

  children.push(new Paragraph({ text: "Mine Details", heading: HeadingLevel.HEADING_2 }));
  children.push(objectToTable(mine));

  children.push(new Paragraph({ text: "Module Scores", heading: HeadingLevel.HEADING_2 }));
  children.push(objectToTable(moduleScores));

  children.push(new Paragraph({ text: "Answers", heading: HeadingLevel.HEADING_2 }));
  if (Object.keys(answers).length === 0) children.push(new Paragraph({ text: "No answers provided." }));
  else Object.entries(answers).forEach(([k, v]) => children.push(new Paragraph({ children: [ new TextRun({ text: `${k}: `, bold: true }), new TextRun(String(v ?? "")) ] })));

  children.push(new Paragraph({ text: "Proofs", heading: HeadingLevel.HEADING_2 }));
  if (!proofs || Object.keys(proofs).length === 0) {
    children.push(new Paragraph({ text: "No proofs uploaded." }));
  } else {
    for (const [param, f] of Object.entries(proofs)) {
      children.push(new Paragraph({ text: `${param}: ${f?.name || ""}` }));
      if (f && f.dataUrl && /^data:image/i.test(f.dataUrl)) {
        const data = dataUrlToUint8Array(f.dataUrl);
        if (data) {
          try {
            children.push(new Paragraph({ children: [ new ImageRun({ data, transformation: { width: 450, height: Math.round(450 * 0.6) } }) ] }));
          } catch (e) {
            children.push(new Paragraph({ text: `(Image could not be embedded)` }));
          }
        }
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  try {
    const blob = await Packer.toBlob(doc);
    const outName = filename || `${(mine.name || "report")}_StarRating.docx`;
    saveAs(blob, outName);
    return { ok: true, blob };
  } catch (err) {
    console.error("exportDocx error", err);
    return { ok: false, error: err };
  }
}

export default exportDocx;