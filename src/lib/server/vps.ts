import { execSync } from 'child_process'
import os from 'os'

export function getOS(): string {
  return os.type() + ' ' + os.release()
}

export function getStorage(): [used: number, total: number] {
  let totalSpaceCommand: string
  let freeSpaceCommand: string
  let unit: 'GB' | 'KB' | 'B'

  if (os.platform() === 'linux') {
    totalSpaceCommand = "df -k / | sed '1d' | awk '{print $2}'"
    freeSpaceCommand = "df / | sed '1d' | awk '{print $4}'"
    unit = 'GB'
  } else if (os.platform() === 'win32') {
    totalSpaceCommand = 'wmic logicaldisk get Size /value | findstr /r /c:"[0-9]"'
    freeSpaceCommand = 'wmic logicaldisk get FreeSpace /value | findstr /r /c:"[0-9]"'
    unit = 'B'
  } else if (os.platform() === 'darwin') {
    totalSpaceCommand = "df -k / | awk 'NR==2{print $2}'"
    freeSpaceCommand = "df -k / | awk 'NR==2{print $4}'"
    unit = 'KB'
  } else {
    return [0, 0]
  }

  const totalSpaceOutput = execSync(totalSpaceCommand).toString().trim()
  const freeSpaceOutput = execSync(freeSpaceCommand).toString().trim()

  const totalSpace = parseSizeOutput(totalSpaceOutput, unit)
  const freeSpace = parseSizeOutput(freeSpaceOutput, unit)
  const usedSpace = totalSpace - freeSpace

  return [usedSpace, totalSpace]
}

function parseSizeOutput(output: string, unit: 'GB' | 'KB' | 'B') {
  const sizeString = output.replace(/\D/g, '')
  const size = parseInt(sizeString)

  if (unit === 'KB') {
    return size * 1024
  } else {
    return size
  }
}