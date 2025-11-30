// src/components/Footer.jsx
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-[#E3D7CC] bg-[#F5F2EF]">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-[#8A7A68]">
        {/* Parte superior */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          {/* Marca + frase */}
          <div>
            <div className="text-xs font-semibold tracking-[0.25em] text-[#5B3A20] uppercase">
              MEMORA
            </div>
            <p className="mt-3 max-w-sm">
              Acompañando con respeto y calidez cada despedida, para honrar la memoria de
              quienes amamos.
            </p>
          </div>

          {/* Datos de contacto / info rápida */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <h3 className="text-[11px] font-semibold tracking-wide text-[#5B3A20] uppercase">
                Contacto
              </h3>
              <p className="mt-2">Tel. (+52) 772-154-74-59</p>
              <p>atencion@memora.mx</p>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold tracking-wide text-[#5B3A20] uppercase">
                Información
              </h3>
              <p className="mt-2">Atención 24/7</p>
              <p>Servicios personalizados</p>
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="mt-8 pt-4 border-t border-[#E3D7CC] text-xs flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p className="text-[#A19282]">
            © {year} Memora. Todos los derechos reservados.
          </p>
          <p className="text-[#B3A496]">
            Diseñado para brindar serenidad en los momentos más difíciles.
          </p>
        </div>
      </div>
    </footer>
  )
}
