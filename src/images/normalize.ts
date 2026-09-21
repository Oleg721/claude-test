import sharp from 'sharp'

/** Long edge in px: under every model tier's downscale threshold, ~2.4k visual tokens at 4:3 — see CLAUDE.md "Endpoints". */
export const MAX_EDGE_PX = 1568
const JPEG_QUALITY = 85

export type NormalizedImage = {
  bytes: Buffer
  mediaType: 'image/jpeg'
  width: number
  height: number
}

/** EXIF rotation baked in, long edge capped at MAX_EDGE_PX (never enlarged), re-encoded as JPEG, metadata dropped. */
export async function normalizeImage(bytes: Buffer): Promise<NormalizedImage> {
  const { data, info } = await sharp(bytes)
    .rotate()
    .resize({ width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer({ resolveWithObject: true })

  return { bytes: data, mediaType: 'image/jpeg', width: info.width, height: info.height }
}
