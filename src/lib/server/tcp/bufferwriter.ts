/**
 * @license MIT
 * @copyright Copyright (c) 2026, GoldFrite
 * @copyright Copyright (c) 2020, Nick Krecklow
 */

export default class BufferWriter {
  writeByte(val: number) {
    const buffer = Buffer.alloc(1)
    buffer.writeUInt8(val)
    return buffer
  }

  writeShort(val: number) {
    const buffer = Buffer.alloc(2)
    buffer.writeUInt16BE(val)
    return buffer
  }

  writeInt(val: number) {
    const buffer = Buffer.alloc(4)
    buffer.writeUInt32BE(val)
    return buffer
  }

  writeVarInt(int: number) {
    const buf = Buffer.alloc(5)
    let i = 0

    while (true) {
      if ((int & 0xffffff80) === 0) {
        buf.writeUInt8(int, i++)
        break
      } else {
        buf.writeUInt8((int & 0x7f) | 0x80, i++)
        int >>>= 7
      }
    }

    return buf.subarray(0, i)
  }

  writeString(str: string) {
    return Buffer.from(str, 'utf8')
  }

  writeUShort(short: number) {
    return Buffer.from([short >> 8, short & 0xff])
  }

  writeStringUTF16BE(str: string) {
    const utf16leBuffer = Buffer.from(str, 'utf16le')

    const utf16beBuffer = Buffer.alloc(utf16leBuffer.length)
    for (let i = 0; i < utf16leBuffer.length; i += 2) {
      utf16beBuffer[i] = utf16leBuffer[i + 1]
      utf16beBuffer[i + 1] = utf16leBuffer[i]
    }

    return Buffer.concat([utf16beBuffer])
  }

  concat(bufs: Buffer[]) {
    let length = 0

    for (let i = 0; i < bufs.length; i++) {
      length += bufs[i].length
    }

    return Buffer.concat([this.writeVarInt(length), ...bufs])
  }
}
