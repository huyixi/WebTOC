// color.ts

export function rgbStringToHsl(rgb: string): { h: number; s: number; l: number } {
  let r, g, b;
  const result = rgb.match(/\d+/g);
  if (!result || (result.length !== 3 && result.length !== 4)) {
    throw new Error("Invalid RGB format. Use 'rgb(r, g, b)' format.");
  }

  r = parseInt(result[0], 10);
  g = parseInt(result[1], 10);
  b = parseInt(result[2], 10);

  if (r === 0 && g === 0 && b === 0) {
    r = 255;
    g = 255;
    b = 255;
  }

  const rNormalized = r / 255;
  const gNormalized = g / 255;
  const bNormalized = b / 255;

  const max = Math.max(rNormalized, gNormalized, bNormalized);
  const min = Math.min(rNormalized, gNormalized, bNormalized);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNormalized:
        h = (gNormalized - bNormalized) / delta + (gNormalized < bNormalized ? 6 : 0);
        break;
      case gNormalized:
        h = (bNormalized - rNormalized) / delta + 2;
        break;
      case bNormalized:
        h = (rNormalized - gNormalized) / delta + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
