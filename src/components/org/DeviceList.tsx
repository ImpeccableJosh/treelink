'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Copy, Check } from 'lucide-react'

interface Device {
  id: string
  name: string
  is_active: boolean
  created_at: string
  last_seen_at?: string | null
}

interface DeviceListProps {
  organizationId: string
  devices: Device[]
}

export function DeviceList({ organizationId, devices: initialDevices }: DeviceListProps) {
  const [devices, setDevices] = useState(initialDevices)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [loading, setLoading] = useState(false)
  const [newDeviceSecret, setNewDeviceSecret] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          name: deviceName,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create device')
      }
      
      const { data, secret, warning } = await response.json()
      setDevices([...devices, data])
      setNewDeviceSecret(secret)
      setDeviceName('')
      setShowAddForm(false)
      alert(warning || 'Device created! Save the secret now.')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCopySecret = () => {
    if (newDeviceSecret) {
      navigator.clipboard.writeText(newDeviceSecret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return (
    <div className="space-y-6">
      {newDeviceSecret && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Save this device secret now. It will not be shown again!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white rounded border border-yellow-300 text-sm">
              {newDeviceSecret}
            </code>
            <button
              onClick={handleCopySecret}
              className="p-2 hover:bg-yellow-100 rounded transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reader Devices</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Device
        </Button>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleAddDevice} className="p-4 bg-gray-50 rounded-lg space-y-4">
          <Input
            label="Device Name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            required
            placeholder="e.g., Front Desk Reader"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Device'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      
      {devices.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>No devices yet. Add your first NFC reader device above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{device.name}</h3>
                  <Badge variant={device.is_active ? 'success' : 'default'}>
                    {device.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Created {new Date(device.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

