import { useState } from 'react'
import { Card, Button, Input } from '../components/ui'
import RoleGuard from '../components/RoleGuard'
import { listLibrary, addLibraryItem, removeLibraryItem, type LibraryItem } from '../services/library'

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>(() => listLibrary())
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  function onAdd() {
    if (!title.trim()) return
    const created = addLibraryItem({ title, author, url })
    setItems(prev => [created, ...prev])
    setTitle(''); setAuthor(''); setUrl('')
  }

  function onDelete(id: string) {
    removeLibraryItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-4">
      <Card className="text-gray-200">
        <h2 className="text-white font-semibold mb-3">Elektron kutubxona</h2>
        <RoleGuard allow={['admin']}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Nomi" value={title} onChange={e => setTitle(e.target.value)} />
            <Input placeholder="Muallif" value={author} onChange={e => setAuthor(e.target.value)} />
            <Input placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />
            <Button onClick={onAdd}>Qo‘shish</Button>
          </div>
        </RoleGuard>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="text-left px-4 py-2">Nomi</th>
              <th className="text-left px-4 py-2">Muallif</th>
              <th className="text-left px-4 py-2">Havola</th>
              <th className="px-4 py-2 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {items.map(i => (
              <tr key={i.id} className="border-t border-border">
                <td className="px-4 py-2">{i.title}</td>
                <td className="px-4 py-2">{i.author}</td>
                <td className="px-4 py-2">
                  {i.url ? <a className="text-primary" href={i.url} target="_blank">Ochish</a> : '-'}
                </td>
                <td className="px-4 py-2 text-right">
                  <RoleGuard allow={['admin']}>
                    <Button variant="outline" onClick={() => onDelete(i.id)}>O‘chirish</Button>
                  </RoleGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}


