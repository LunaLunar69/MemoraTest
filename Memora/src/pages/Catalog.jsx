// src/pages/Catalog.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAtaudes } from '../features/catalog/catalog.service.js'
import AtaudGrid from '../features/catalog/AtaudGrid.jsx'
import AtaudDetailPanel from '../features/catalog/AtaudDetailPanel.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { createPedido } from '../features/orders/orders.service.js'   // 👈 importar desde orders

export default function Catalog() {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const { session } = useAuth() || {}
  const navigate = useNavigate()

  // Cargar catálogo
  useEffect(() => {
    getAtaudes().then(setItems).catch(console.error)
  }, [])

  async function handleProceed(ataud) {
    if (!session) {
      return navigate(`/login?redirect=${encodeURIComponent('/ataudes')}`)
    }
    try {
      // 👇 usamos la firma nueva: { ataud, user }
      const pedido = await createPedido({ ataud, user: session.user })
      navigate(`/pago?pid=${encodeURIComponent(pedido.public_id)}`)
    } catch (e) {
      console.error('Error al crear pedido:', e)
      alert('Ocurrió un error al crear el pedido. Intenta de nuevo.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8">Nuestra Colección</h1>
      <AtaudGrid items={items} onView={setSelected} />
      <AtaudDetailPanel
        ataud={selected}
        onClose={() => setSelected(null)}
        onProceed={handleProceed}
      />
    </div>
  )
}
