import PropTypes from 'prop-types'

// 💰 Formateador reutilizable para precios
const money = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
    .format(Number(v ?? 0))

export default function AtaudCard({ ataud, onView }) {
  return (
    <article className="rounded-2xl border shadow-sm overflow-hidden">
      {/* Imagen */}
      <div className="h-48 bg-slate-100 flex items-center justify-center">
        {ataud?.imagen_url ? (
          <img
            src={ataud.imagen_url}
            alt={ataud.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-xs text-slate-400">Sin imagen</span>
        )}
      </div>

      {/* Texto */}
      <div className="p-4">
        <h3 className="font-semibold">{ataud?.nombre}</h3>
        <p className="text-orange-600 font-semibold">
          {money(ataud?.precio)}
        </p>

        <button
          className="mt-3 w-full rounded-lg bg-slate-900 text-white py-2"
          onClick={() => onView?.(ataud)}
        >
          Ver Detalles
        </button>
      </div>
    </article>
  )
}

AtaudCard.propTypes = {
  ataud: PropTypes.object,
  onView: PropTypes.func,
}
