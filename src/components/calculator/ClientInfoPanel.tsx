import { formatKennitala } from '@/lib/format'
import type { ClientInfo } from '@/types'

interface Props {
  client: ClientInfo
  onChange: (client: ClientInfo) => void
}

export function ClientInfoPanel({ client, onChange }: Props) {
  const update = (field: keyof ClientInfo, value: string) => {
    onChange({ ...client, [field]: value })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="font-condensed text-lg font-semibold text-brand-dark">Upplýsingar um viðskiptavin</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-500">Nafn</label>
          <input
            type="text"
            value={client.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Nafn tengiliðar"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Fyrirtæki</label>
          <input
            type="text"
            value={client.company}
            onChange={e => update('company', e.target.value)}
            placeholder="Fyrirtæki"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Kennitala</label>
          <input
            type="text"
            value={client.kennitala}
            onChange={e => update('kennitala', formatKennitala(e.target.value))}
            placeholder="000000-0000"
            maxLength={11}
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Sími</label>
          <input
            type="tel"
            value={client.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="000-0000"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Netfang</label>
          <input
            type="email"
            value={client.email}
            onChange={e => update('email', e.target.value)}
            placeholder="netfang@fyrirtaeki.is"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Heimilisfang</label>
          <input
            type="text"
            value={client.address}
            onChange={e => update('address', e.target.value)}
            placeholder="Heimilisfang verkstaðar"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500">Eftirlitsaðili</label>
          <input
            type="text"
            value={client.inspector ?? ''}
            onChange={e => update('inspector', e.target.value)}
            placeholder="Eftirlitsaðili (valfrjálst)"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
      </div>
    </div>
  )
}
