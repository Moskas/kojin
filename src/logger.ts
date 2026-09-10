type Fields = Record<string, unknown>

function format(level: string, module: string, message: string, fields?: Fields): string {
  const base = `[${new Date().toISOString()}] ${level} ${module}: ${message}`
  if (!fields) return base
  const rest = Object.entries(fields)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')
  return `${base} ${rest}`
}

export const logger = {
  info(module: string, message: string, fields?: Fields) {
    console.log(format('INFO', module, message, fields))
  },
  warn(module: string, message: string, fields?: Fields) {
    console.error(format('WARN', module, message, fields))
  },
  error(module: string, message: string, fields?: Fields) {
    console.error(format('ERROR', module, message, fields))
  },
}
