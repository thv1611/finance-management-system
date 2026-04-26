const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const RECEIPT_DIR = path.join(__dirname, "..", "..", "uploads", "receipts");
const SUPPORTED_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;

function parseReceiptDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);

  if (!match) {
    const error = new Error("Receipt must be a JPG, PNG, or WEBP image.");
    error.statusCode = 400;
    throw error;
  }

  return {
    mimeType: match[1],
    base64Data: match[2],
  };
}

async function storeReceiptFromDataUrl(dataUrl) {
  const { mimeType, base64Data } = parseReceiptDataUrl(dataUrl);
  const fileExtension = SUPPORTED_MIME_TYPES[mimeType];
  const buffer = Buffer.from(base64Data, "base64");

  if (!fileExtension || !buffer.length) {
    const error = new Error("Receipt image is invalid.");
    error.statusCode = 400;
    throw error;
  }

  if (buffer.length > MAX_RECEIPT_SIZE_BYTES) {
    const error = new Error("Receipt image must be 5MB or smaller.");
    error.statusCode = 400;
    throw error;
  }

  await fs.mkdir(RECEIPT_DIR, { recursive: true });
  const fileName = `${crypto.randomUUID()}${fileExtension}`;
  const filePath = path.join(RECEIPT_DIR, fileName);

  await fs.writeFile(filePath, buffer);

  return `/uploads/receipts/${fileName}`;
}

async function deleteStoredReceipt(receiptUrl) {
  if (!receiptUrl) {
    return;
  }

  const normalizedUrl = String(receiptUrl).replace(/^https?:\/\/[^/]+/i, "");

  if (!normalizedUrl.startsWith("/uploads/receipts/")) {
    return;
  }

  const filePath = path.join(RECEIPT_DIR, path.basename(normalizedUrl));

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

module.exports = {
  parseReceiptDataUrl,
  storeReceiptFromDataUrl,
  deleteStoredReceipt,
};
