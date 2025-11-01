export function toCsv(rows: string[][]): string {
  return rows.map(r => r.map(cell => escape(cell)).join(',')) .join('\n')
}

function escape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"'
  }
  return v
}

export function downloadCsv(fileName: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export async function readFileText(file: File): Promise<string> {
  return await file.text()
}

export function parseCsv(csv: string): string[][] {
  const rows: string[][] = []
  let i = 0, cur = '', row: string[] = [], inQuotes = false
  while (i < csv.length) {
    const ch = csv[i]
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') { cur += '"'; i += 2; continue }
      if (ch === '"') { inQuotes = false; i++; continue }
      cur += ch; i++; continue
    }
    if (ch === '"') { inQuotes = true; i++; continue }
    if (ch === ',') { row.push(cur); cur = ''; i++; continue }
    if (ch === '\n' || ch === '\r') {
      if (cur.length || row.length) { row.push(cur); rows.push(row); row = []; cur = '' }
      while (csv[i] === '\n' || csv[i] === '\r') i++
      continue
    }
    cur += ch; i++
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row) }
  return rows
}


