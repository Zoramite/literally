const RED = 0.2126;
const GREEN = 0.7152;
const BLUE = 0.0722;

const GAMMA = 2.4;

interface RGB {
  red: number;
  green: number;
  blue: number;
}

/**
 * Calculate the luminance of a color.
 * https://stackoverflow.com/a/9733420/1172228
 */
export function luminance(color: RGB) {
  var a = [color.red, color.green, color.blue].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA);
  });
  return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

/**
 * Calculate the contrast ratio of a color.
 * https://stackoverflow.com/a/9733420/1172228
 *
 * ex: contrast([255, 255, 255], [255, 255, 0])
 */
export function contrast(rgb1: RGB, rgb2: RGB) {
  var lum1 = luminance(rgb1);
  var lum2 = luminance(rgb2);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Convert a hex to an RGB value.
 * https://stackoverflow.com/a/5624139/1172228
 */
export function hexToRgb(hex: string): RGB | null {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (_m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      }
    : null;
}
