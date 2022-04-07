// SVG icons aren't supported yet
export async function loadImageData(url: string): Promise<ImageData> {
    const img = await createImageBitmap(await (await fetch(url)).blob());
    const { width: w, height: h } = img;
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to render image');
    ctx.drawImage(img, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }
  
  