import JSZip from "jszip";

function dataUrlToUint8Array(dataUrl) {
  const [, base64] = dataUrl.split(",");
  const binary = atob(base64 || "");
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

// proofs: { paramName: { name, dataUrl } }
export async function zipProofs(proofs = {}, zipFileName = "proofs.zip") {
  const zip = new JSZip();
  for (const [param, file] of Object.entries(proofs || {})) {
    if (!file || !file.dataUrl) continue;
    const arr = dataUrlToUint8Array(file.dataUrl);
    const name = file.name || `${param}`;
    zip.file(name, arr);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return { blob, name: zipFileName };
}