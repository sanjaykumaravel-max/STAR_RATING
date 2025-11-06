export async function inlineImages(htmlString) {
  // replace each <img src="..."> with data: URL
  const div = document.createElement("div");
  div.innerHTML = htmlString;
  const imgs = Array.from(div.querySelectorAll("img"));
  await Promise.all(imgs.map(async (img) => {
    const src = img.getAttribute("src");
    if (!src) return;
    // skip if already data URL
    if (src.startsWith("data:")) return;
    try {
      // resolve absolute URL relative to origin
      const url = src.startsWith("/") ? window.location.origin + src : new URL(src, window.location.href).href;
      const res = await fetch(url);
      const blob = await res.blob();
      const data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      img.setAttribute("src", data);
    } catch (e) {
      console.warn("Could not inline image", src, e);
    }
  }));
  return div.innerHTML;
}