// src/features/catalog/AtaudCard.jsx
import PropTypes from 'prop-types'

const money = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
    .format(Number(v ?? 0))

export default function AtaudCard({ ataud, onView }) {
  const hasImage = Boolean(ataud?.imagen_url)

  return (
    <article
      className="group rounded-3xl border border-[#E3D7CC] bg-[#FDF9F5] overflow-hidden shadow-sm 
                 hover:shadow-lg transition-shadow duration-300 flex flex-col 
                 hover:-translate-y-1 transform will-change-transform"
    >
      {/* Imagen */}
      <div className="relative h-44 bg-[#EDE0D3] overflow-hidden">
        {hasImage ? (
          <img
            src={ataud.imagen_url}
            alt={ataud.nombre || 'Ataúd'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#EDE0D3] via-[#E3D3C3] to-[#D4B597]" />
        )}

        {/* Badge opcional */}
        {ataud?.etiqueta && (
          <div className="absolute top-3 left-3 rounded-full bg-[#5B3A20]/85 text-[#F5F2EF] text-[10px] px-3 py-1 tracking-wide uppercase">
            {ataud.etiqueta}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-[#5B3A20] text-sm mb-1 line-clamp-1">
          {ataud?.nombre ?? 'Ataúd'}
        </h3>

        {ataud?.descripcion && (
          <p className="text-xs text-[#8A7A68] line-clamp-2 mb-3">
            {ataud.descripcion}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#B28153]">
              Desde
            </p>
            <p className="text-lg font-semibold text-[#5B3A20]">
              {money(ataud?.precio)}
            </p>
          </div>

          <button
            className="rounded-full px-4 py-2 text-xs font-medium bg-[#B28153] text-[#F5F2EF] 
                       hover:bg-[#8C5F32] transition-colors"
            onClick={() => onView?.(ataud)}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </article>
  )
}

AtaudCard.propTypes = {
  ataud: PropTypes.object,
  onView: PropTypes.func
}
