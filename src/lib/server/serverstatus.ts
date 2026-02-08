/**
 * @license MIT
 * @copyright Copyright (c) 2026, GoldFrite
 * @copyright Copyright (c) 2020, Nick Krecklow
 */

import * as net from 'node:net'
import { ServerError } from '$lib/utils/errors'
import BufferWriter from './tcp/bufferwriter'
import BufferReader from './tcp/bufferreader'
import { NotificationCode } from '$lib/utils/notifications'

export interface ServerStatus {
  ping: number
  version: string
  motd: string
  players: {
    max: number
    online: number
  }
}

export async function getServerStatus(
  ip: string,
  port: number = 25565,
  protocol: 'modern' | '1.6' | '1.4-1.5' = 'modern',
  pvn: number = -1,
  timeout: number = 5
): Promise<ServerStatus> {
  return new Promise((resolve, reject) => {
    const bufWriter = new BufferWriter()
    const start = Date.now()
    let socket = net.createConnection(port, ip)
    socket.setNoDelay(true)

    const connectionTimeout = setTimeout(() => {
      reject(new ServerError('Connection timed out', null, NotificationCode.NETWORK_ERROR, 504))
    }, timeout * 1000)

    socket.on('connect', () => {
      if (protocol === 'modern') {
        const buf = bufWriter.concat([
          bufWriter.writeVarInt(0),
          bufWriter.writeVarInt(pvn),
          bufWriter.writeVarInt(ip.length),
          bufWriter.writeString(ip),
          bufWriter.writeUShort(port),
          bufWriter.writeVarInt(1)
        ])
        socket.write(buf)

        const req = bufWriter.concat([bufWriter.writeVarInt(0)])
        socket.write(req)
      } else if (protocol === '1.6') {
        const buf = Buffer.concat([
          bufWriter.writeByte(0xfe),
          bufWriter.writeByte(1),
          bufWriter.writeByte(0xfa),
          bufWriter.writeShort(11),
          bufWriter.writeStringUTF16BE('MC|PingHost'),
          bufWriter.writeShort(7 + 2 * ip.length),
          bufWriter.writeByte(pvn),
          bufWriter.writeShort(2 * ip.length),
          bufWriter.writeStringUTF16BE(ip),
          bufWriter.writeInt(port)
        ])
        socket.write(buf)
      } else if (protocol === '1.4-1.5') {
        const buf = Buffer.concat([bufWriter.writeByte(0xfe), bufWriter.writeByte(1)])
        socket.write(buf)
      } else {
        reject(new ServerError('Unsupported protocol version', null, NotificationCode.NETWORK_ERROR, 400))
      }
    })

    let incomingBuf = Buffer.alloc(0)

    socket.on('data', (data) => {
      const ping = Date.now() - start
      const chunk = typeof data === 'string' ? Buffer.from(data) : data
      incomingBuf = Buffer.concat([incomingBuf, chunk])

      if (incomingBuf.length < 5) {
        return
      }

      if (protocol === 'modern') {
        const bufReader = new BufferReader(incomingBuf)
        const length = bufReader.readVarInt()

        if (incomingBuf.length - bufReader.getOffset() < length) {
          return
        }

        if (bufReader.readVarInt() === 0) {
          try {
            const json = JSON.parse(bufReader.readString())
            resolve({
              ping: ping,
              version: json.version.name,
              motd:
                typeof json.description === 'object' && json.description.text
                  ? json.description.text
                  : typeof json.description === 'string'
                    ? json.description
                    : '',
              players: { max: json.players.max, online: json.players.online }
            })
            socket.destroy()
            clearTimeout(connectionTimeout)
          } catch (err) {
            reject(new ServerError(`Received invalid response`, err, NotificationCode.NETWORK_ERROR, 502))
            socket.destroy()
            clearTimeout(connectionTimeout)
          }
        } else {
          reject(new ServerError(`Received unexpected packet`, null, NotificationCode.NETWORK_ERROR, 502))
          socket.destroy()
          clearTimeout(connectionTimeout)
        }
      } else {
        if (incomingBuf.readUInt8(0) === 0xff) {
          const bufReader = new BufferReader(incomingBuf)
          const fields = bufReader.readStringUTF16BE().split('\u0000')

          if (fields[0] !== '§1') {
            reject(new ServerError(`Received invalid response: the first field is not '§1'`, null, NotificationCode.NETWORK_ERROR, 502))
            socket.destroy()
            clearTimeout(connectionTimeout)
          }

          resolve({
            ping: ping,
            version: fields[2],
            motd: fields[3],
            players: { max: +fields[5], online: +fields[4] }
          })
          socket.destroy()
          clearTimeout(connectionTimeout)
        } else {
          reject(new ServerError(`Received invalid response: wrong packet identifier`, null, NotificationCode.NETWORK_ERROR, 502))
          socket.destroy()
          clearTimeout(connectionTimeout)
        }
      }
    })

    socket.on('error', (err) => reject(new ServerError('Network error', err, NotificationCode.NETWORK_ERROR, 502)))
  })
}
