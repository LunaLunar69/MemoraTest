import PropTypes from 'prop-types'

// 💰 Utilidad para formatear precios
const money = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
    .format(Number(v ?? 0))

export default function AtaudDetailPanel({ ataud, onClose, onProceed }) {
  if (!ataud) return null

  return (
    <section className="max-w-3xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-semibold mb-4">{ataud.nombre}</h2>

      {/* Imagen grande */}
      <div className="h-56 rounded-xl bg-slate-100 mb-4 flex items-center justify-center overflow-hidden">
        {ataud.imagen_url ? (
          <img
            src={ataud.imagen_url}
            alt={ataud.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">Sin imagen</span>
        )}
      </div>

      <p className="text-slate-700 mb-4">{ataud.descripcion}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-semibold">Material:</span>{' '}
          {ataud.material || '—'}
        </div>
        <div>
          <span className="font-semibold">Interior:</span>{' '}
          {ataud.interior || '—'}
        </div>
        <div className="sm:col-span-2">
          <span className="font-semibold">Dimensiones:</span>{' '}
          {ataud.dimensiones || '—'}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        {/* precio corregido */}
        <div className="text-2xl text-orange-600 font-semibold">
          {money(ataud.precio)}
        </div>

        <button
          className="rounded-lg border px-4 py-2"
          onClick={onClose}
        >
          Cerrar
        </button>

        <button
          className="rounded-lg bg-orange-600 text-white px-4 py-2"
          onClick={() => onProceed?.(ataud)}
        >
          Proceder al Pago
        </button>
      </div>
    </section>
  )
}

AtaudDetailPanel.propTypes = {
  ataud: PropTypes.object,
  onClose: PropTypes.func,
  onProceed: PropTypes.func,
}
