import sharp from 'sharp'

export const resizeImage = async (data: string | Buffer, width: number): Promise<Buffer> =>
  sharp(data).resize({ width }).toBuffer()
