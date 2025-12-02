// src/features/catalog/AtaudDetailPanel.jsx
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'

const money = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
    .format(Number(v ?? 0))

export default function AtaudDetailPanel({ ataud, onClose, onProceed }) {
  const panelRef = useRef(null)

  // Animación de entrada
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.classList.add('opacity-0', 'translate-y-6', 'scale-[0.97]')

      requestAnimationFrame(() => {
        panelRef.current.classList.remove('opacity-0', 'translate-y-6', 'scale-[0.97]')
        panelRef.current.classList.add('opacity-100', 'translate-y-0', 'scale-100')
      })
    }
  }, [ataud])

  if (!ataud) return null

  const hasImage = Boolean(ataud.imagen_url)

  function handleClose() {
    if (!panelRef.current) return onClose?.()

    panelRef.current.classList.remove('opacity-100', 'translate-y-0', 'scale-100')
    panelRef.current.classList.add('opacity-0', 'translate-y-6', 'scale-[0.97]')

    setTimeout(() => {
      onClose?.()
    }, 200)
  }

  function handleProceed() {
    onProceed?.(ataud)
  }

  return (
    <div
      id="ataud-detail-panel"
      className="fixed inset-0 z-40 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8
                 bg-black/40 backdrop-blur-sm"
    >
      {/* Capa clicable para cerrar */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 w-full h-full cursor-default"
        aria-label="Cerrar detalles"
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg sm:max-w-xl lg:max-w-3xl
                   rounded-2xl sm:rounded-3xl border border-[#E3D7CC] bg-[#FDF9F5]
                   shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto
                   transition-all duration-300 opacity-0 translate-y-6 scale-[0.97]"
      >
        <div className="grid md:grid-cols-[1.1fr,1fr]">
          {/* Imagen */}
          <div className="relative bg-[#EDE0D3] min-h-[220px] md:min-h-full">
            {hasImage ? (
              <img
                src={ataud.imagen_url}
                alt={ataud.nombre || 'Ataúd'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#EDE0D3] via-[#E3D3C3] to-[#D4B597]" />
            )}
          </div>

          {/* Detalles */}
          <div className="p-4 sm:p-6 space-y-5">
            {/* Botón X arriba a la derecha */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full 
                           border border-[#E3D7CC] text-[#8A7A68] hover:bg-[#F5F2EF] text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#B28153] mb-1">
                Detalle del ataúd
              </p>
              <h2 className="text-2xl font-semibold text-[#5B3A20]">
                {ataud.nombre}
              </h2>
              {ataud.descripcion && (
                <p className="text-sm text-[#8A7A68] mt-2">
                  {ataud.descripcion}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#5B3A20]">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#B28153]">Material</p>
                <p className="text-[#8A7A68]">
                  {ataud.material || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#B28153]">Interior</p>
                <p className="text-[#8A7A68]">
                  {ataud.interior || 'No especificado'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] uppercase tracking-wide text-[#B28153]">
                  Dimensiones
                </p>
                <p className="text-[#8A7A68]">
                  {ataud.dimensiones || 'No especificado'}
                </p>
              </div>
            </div>

            {/* Precio + acciones */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#B28153]">
                  Precio
                </p>
                <p className="text-2xl font-semibold text-[#5B3A20]">
                  {money(ataud.precio)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  className="rounded-full border border-[#D0BFAE] px-5 py-2 text-sm text-[#5B3A20] hover:bg-[#F5F2EF] transition-colors"
                  onClick={handleClose}
                >
                  Cerrar
                </button>
                <button
                  className="rounded-full bg-[#B28153] px-5 py-2 text-sm font-medium text-[#F5F2EF] hover:bg-[#8C5F32] transition-colors"
                  onClick={handleProceed}
                >
                  Proceder al pago
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

AtaudDetailPanel.propTypes = {
  ataud: PropTypes.object,
  onClose: PropTypes.func,
  onProceed: PropTypes.func
}
