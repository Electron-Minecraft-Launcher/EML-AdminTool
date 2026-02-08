/**
 * @license MIT
 * @copyright Copyright (c) 2026, GoldFrite
 * @copyright Copyright (c) 2020, Nick Krecklow
 */

export default class BufferReader {
  private readonly buffer: Buffer
  private offset: number

  constructor(buffer: Buffer) {
    this.buffer = buffer
    this.offset = 0
  }

  readVarInt() {
    let result = 0
    let count = 0

    while (true) {
      const b = this.buffer.readUInt8(this.offset++)

      result |= (b & 0x7f) << (count++ * 7)
      if ((b & 0x80) != 128) {
        break
      }
    }

    return result
  }

  readString() {
    const length = this.readVarInt()
    const result = this.buffer.toString('utf8', this.offset, this.offset + length)

    this.offset += length

    return result
  }

  readStringUTF16BE() {
    const length = this.readVarInt() * 2
    const val = Buffer.from(this.buffer.subarray(this.offset + 1, this.offset + length))

    for (let i = 0; i < val.length; i += 2) {
      const temp = val[i]
      val[i] = val[i + 1]
      val[i + 1] = temp
    }

    const result = val.toString('utf16le')
    this.offset += length

    return result
  }

  getOffset(): number {
    return this.offset
  }
}
