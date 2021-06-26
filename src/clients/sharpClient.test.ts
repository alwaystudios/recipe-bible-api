import { resizeImage } from './sharpClient'
import { image } from '../../test/factories/base64image'

describe('sharp client', () => {
  it('resize base64 image', async () => {
    const _image = image.split('data:image/jpeg;base64,').pop()
    const buffer = Buffer.from(_image!, 'base64')
    const result = await resizeImage(buffer, 1000)
    expect(result).toEqual(expect.anything())
  })
})
