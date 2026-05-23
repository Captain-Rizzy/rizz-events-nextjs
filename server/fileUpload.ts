import { storagePut } from "./storage";

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a client/event logo
 */
export async function uploadEventLogo(
  eventId: number,
  fileBuffer: Buffer,
  fileName: string
): Promise<UploadResult> {
  const key = `events/${eventId}/logo/${Date.now()}-${fileName}`;
  return await storagePut(key, fileBuffer, "image/*");
}

/**
 * Upload a sponsor logo
 */
export async function uploadSponsorLogo(
  sponsorId: number,
  fileBuffer: Buffer,
  fileName: string
): Promise<UploadResult> {
  const key = `sponsors/${sponsorId}/logo/${Date.now()}-${fileName}`;
  return await storagePut(key, fileBuffer, "image/*");
}

/**
 * Upload a gallery image
 */
export async function uploadGalleryImage(
  eventId: number,
  fileBuffer: Buffer,
  fileName: string
): Promise<UploadResult> {
  const key = `events/${eventId}/gallery/${Date.now()}-${fileName}`;
  return await storagePut(key, fileBuffer, "image/*");
}

/**
 * Validate image file
 */
export function validateImageFile(
  buffer: Buffer,
  fileName: string,
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB default
): { valid: boolean; error?: string } {
  // Check file size
  if (buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeBytes / 1024 / 1024}MB limit`,
    };
  }

  // Check file extension
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExt = fileName.toLowerCase().slice(fileName.lastIndexOf("."));

  if (!validExtensions.includes(fileExt)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${validExtensions.join(", ")}`,
    };
  }

  // Check magic bytes for image files
  const magicBytes = buffer.slice(0, 4);

  // JPEG: FF D8 FF
  if (fileExt === ".jpg" || fileExt === ".jpeg") {
    if (magicBytes[0] !== 0xff || magicBytes[1] !== 0xd8 || magicBytes[2] !== 0xff) {
      return { valid: false, error: "Invalid JPEG file" };
    }
  }

  // PNG: 89 50 4E 47
  if (fileExt === ".png") {
    if (
      magicBytes[0] !== 0x89 ||
      magicBytes[1] !== 0x50 ||
      magicBytes[2] !== 0x4e ||
      magicBytes[3] !== 0x47
    ) {
      return { valid: false, error: "Invalid PNG file" };
    }
  }

  // GIF: 47 49 46
  if (fileExt === ".gif") {
    if (magicBytes[0] !== 0x47 || magicBytes[1] !== 0x49 || magicBytes[2] !== 0x46) {
      return { valid: false, error: "Invalid GIF file" };
    }
  }

  return { valid: true };
}
