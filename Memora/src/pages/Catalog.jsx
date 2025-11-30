// src/pages/Catalog.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAtaudes } from '../features/catalog/catalog.service.js'
import AtaudGrid from '../features/catalog/AtaudGrid.jsx'
import AtaudDetailPanel from '../features/catalog/AtaudDetailPanel.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { createPedido } from '../features/orders/orders.service.js'

export default function Catalog() {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { session } = useAuth() || {}
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getAtaudes()
      .then(setItems)
      .catch((e) => {
        console.error(e)
        setError('No se pudieron cargar los ataúdes.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Scroll suave + bloquear scroll del body cuando el panel está abierto
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        document
          .getElementById('ataud-detail-panel')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [selected])

  async function handleProceed(ataud) {
    if (!session) {
      return navigate('/login?redirect=/ataudes')
    }

    try {
      const pedido = await createPedido({
        ataud,
        user: session.user
      })
      navigate(`/pago?pid=${pedido.public_id || pedido.id}`)
    } catch (e) {
      console.error('Error al crear pedido:', e)
      alert('Ocurrió un error al crear el pedido. Intenta de nuevo.')
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-14 space-y-10">
      {/* Encabezado */}
      <header className="text-center space-y-3">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#B28153]">
          Colección de ataúdes
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#5B3A20]">
          Elige un descanso digno
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-[#8A7A68]">
          Cada pieza ha sido seleccionada para brindar serenidad, respeto
          y elegancia en la despedida de tus seres queridos.
        </p>
      </header>

      {/* Contenido */}
      <div className="space-y-8">
        {loading && (
          <p className="text-center text-sm text-[#8A7A68]">
            Cargando ataúdes…
          </p>
        )}
        {error && (
          <p className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <AtaudGrid items={items} onView={setSelected} />
          </>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-center text-sm text-[#8A7A68]">
            Aún no hay ataúdes registrados. Vuelve más tarde.
          </p>
        )}
      </div>

      {/* Modal de detalle */}
      {selected && (
        <AtaudDetailPanel
          ataud={selected}
          onClose={() => setSelected(null)}
          onProceed={handleProceed}
        />
      )}
    </section>
  )
}
