import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontPath = path.join(__dirname, "../", "assets", "fonts", "NotoColorEmoji-Regular.ttf");
GlobalFonts.registerFromPath(fontPath, "NotoEmoji");
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = "";

  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;

    // Fits on the current line
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
      continue;
    }

    // Doesn't fit: close the current line
    if (line) {
      lines.push(line);
      line = "";
    }

    // Word fits on a fresh line
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      continue;
    }

    // Word alone is too wide (long emoji run, long URL): break by character
    for (const { segment } of segmenter.segment(word)) {
      if (line && ctx.measureText(line + segment).width > maxWidth) {
        lines.push(line);
        line = segment;
      } else {
        line += segment;
      }
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}
function wrapParagraphs(ctx, text, maxWidth) {
  return text
    .replace(/\r\n?/g, "\n") // normalize Windows/old Mac line endings
    .replace(/\t/g, "    ") // tabs draw as boxes, so use spaces
    .trim()
    .split("\n")
    .flatMap((p) => wrapText(ctx, p, maxWidth));
}

// Cut a single line with "…" so it fits maxWidth (uses the current ctx.font)
function fitLine(ctx, str, maxWidth) {
  if (ctx.measureText(str).width <= maxWidth) return str;
  let chars = [...str];
  while (chars.length && ctx.measureText(chars.join("") + "…").width > maxWidth) {
    chars.pop();
  }
  return chars.join("").trimEnd() + "…";
}

// Keep at most `max` lines, adding "…" to the last one if anything was cut
function clampLines(ctx, lines, max, maxWidth) {
  if (lines.length <= max) return lines;
  const out = lines.slice(0, max);
  out[max - 1] = fitLine(ctx, out[max - 1] + "…", maxWidth);
  return out;
}

export async function chatBubbleSticker(
  text,
  { name = ".", avatar = null, quoted = null, bg = "#ffffff", dark = true } = {},
) {
  const size = 512;
  const bubbleX = 136;
  const bubbleW = 341;
  const padX = 22;
  const padY = 25;
  const nameH = 30;
  const maxTextW = bubbleW - padX * 2;

  // Quote block settings
  const qPad = 8;
  const qBar = 4;
  const qNameH = 24;
  const qLineH = 22;
  const qGap = 8;
  const qInnerW = maxTextW - qBar - 10 - qPad;
  const accent = dark ? "#b8e35f" : "#1f9d55";

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Measure the quote first (its font size is fixed, so it only needs doing once)
  let qName = "";
  let qLines = [];
  let quoteBlockH = 0;
  if (quoted?.text) {
    ctx.font = "bold 18px sans-serif, NotoEmoji";
    qName = fitLine(ctx, quoted.name || "Unknown", qInnerW);

    ctx.font = "18px sans-serif, NotoEmoji";
    qLines = clampLines(ctx, wrapParagraphs(ctx, quoted.text, qInnerW), 2, qInnerW);

    quoteBlockH = qPad * 2 + qNameH + qLines.length * qLineH + qGap;
  }

  // Shrink the font until the bubble fits on the canvas
  let fontSize = 28;
  let lines, lineHeight, bubbleH;
  do {
    ctx.font = `${fontSize}px sans-serif, NotoEmoji`;
    lineHeight = Math.round(fontSize * 1.36);
    lines = wrapParagraphs(ctx, text, maxTextW);
    bubbleH = padY * 2 + nameH + quoteBlockH + lines.length * lineHeight;
    fontSize -= 2;
  } while (bubbleH > 480 && fontSize >= 14);
  fontSize += 2;

  const bubbleY = (size - bubbleH) / 2;

  // Background (bg = null for transparent)
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }

  // Bubble with soft shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = dark ? "#1a1a1a" : "#ffffff";
  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 40);
  ctx.fill();
  ctx.restore();

  // Avatar
  const cx = 78;
  const cy = bubbleY + 52;
  const r = 44;

  let img = null;
  if (avatar) {
    try {
      img = await loadImage(avatar);
    } catch {
      img = null;
    }
  }

  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = "#6b7f9e";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name.charAt(0).toUpperCase(), cx, cy + 2);
  }

  // Sender name
  const textX = bubbleX + padX;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = dark ? "#63ebf2" : "#111b21";
  ctx.font = "bold 22px sans-serif, NotoEmoji";
  ctx.fillText(name, textX, bubbleY + padY);

  // Quoted message block
  let y = bubbleY + padY + nameH;
  if (quoteBlockH) {
    const qH = quoteBlockH - qGap;

    // Box (rounded), then the accent bar clipped to the same shape
    ctx.fillStyle = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.roundRect(textX, y, maxTextW, qH, 10);
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(textX, y, qBar, qH);
    ctx.restore();

    const qx = textX + qBar + 10;

    ctx.fillStyle = accent;
    ctx.font = "bold 18px sans-serif, NotoEmoji";
    ctx.fillText(qName, qx, y + qPad);

    ctx.fillStyle = dark ? "#e4e4e4" : "#3b4a54";
    ctx.font = "18px sans-serif, NotoEmoji";
    qLines.forEach((l, i) => ctx.fillText(l, qx, y + qPad + qNameH + i * qLineH));

    y += quoteBlockH;
  }

  // Message text
  ctx.fillStyle = dark ? "#ffffff" : "#111b21";
  ctx.font = `${fontSize}px sans-serif, NotoEmoji`;
  for (const line of lines) {
    ctx.fillText(line, textX, y);
    y += lineHeight;
  }

  return canvas.toBuffer("image/png");
}