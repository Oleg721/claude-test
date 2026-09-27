import assert from 'node:assert/strict'
import { test } from 'node:test'

import sharp from 'sharp'

import { normalizeImage } from './normalize.js'

function photo(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: '#8a4' } }).jpeg().toBuffer()
}

test('a 12 MP photo is capped at 1568 px by default (labels)', async () => {
  const image = await normalizeImage(await photo(4032, 3024))

  assert.deepEqual([image.width, image.height], [1568, 1176])
  assert.equal(image.mediaType, 'image/jpeg')
})

test('a 12 MP photo is capped at 784 px when asked (portions)', async () => {
  const image = await normalizeImage(await photo(3024, 4032), 784)

  assert.deepEqual([image.width, image.height], [588, 784])
})

test('a photo under the cap is never enlarged', async () => {
  const image = await normalizeImage(await photo(600, 400), 784)

  assert.deepEqual([image.width, image.height], [600, 400])
})
