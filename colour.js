// ============================================================
// OKLab colour interpolation
//
// Blending two hex values channel-by-channel in sRGB sends the
// midpoint through mud (white -> blue detours via grey). OKLab is
// perceptually uniform, so the midpoint looks like the midpoint.
// ============================================================
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
function hexToOklab(hex) {
  const h = hex.replace("#", "");
  const r = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function oklabToCss(lab) {
  const l_ = lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2];
  const m_ = lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2];
  const s_ = lab[0] - 0.0894841775 * lab[1] - 1.291485548 * lab[2];
  const l = l_ * l_ * l_,
    m = m_ * m_ * m_,
    s = s_ * s_ * s_;
  const ch = (v) =>
    Math.max(0, Math.min(255, Math.round(linearToSrgb(v) * 255)));
  return (
    "rgb(" +
    ch(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) +
    "," +
    ch(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) +
    "," +
    ch(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) +
    ")"
  );
}
