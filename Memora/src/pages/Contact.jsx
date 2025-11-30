// src/pages/Contact.jsx
import MapEmbed from '../features/contact/MapEmbed.jsx'
import { Phone, MessageCircle, MapPin, Clock, ExternalLink } from 'lucide-react'

export default function Contact() {
  const address =
    'Belisario Domínguez 1332, Calvario Bajo, 42380 Tasquillo, Hgo.'
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Belisario+Dom%C3%ADnguez+1332,+Calvario+Bajo,+42380+Tasquillo,+Hidalgo'

  return (
    <section className="max-w-6xl mx-auto px-4 py-14 space-y-10">
      {/* Encabezado */}
      <header className="text-center">
        <h1 className="text-4xl font-semibold text-[#5B3A20] tracking-tight">
          Nuestra ubicación
        </h1>
        <p className="text-[#8A7A68] mt-2">
          Estamos aquí para ayudarte las 24 horas del día, los 7 días de la semana.
        </p>
      </header>

      {/* Tarjeta principal */}
      <div className="grid md:grid-cols-2 gap-10 items-center bg-[#F5F2EF] border border-[#E3D7CC] rounded-3xl p-6 sm:p-8 shadow-sm">

        {/* Mapa */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-[#8A7A68]">
            Encuéntranos en:
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#E3D7CC] shadow-md transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <MapEmbed query={address} />
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#5B3A20] hover:text-[#8C5F32] underline-offset-4 hover:underline"
          >
            Ver en Google Maps
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Información y acciones */}
        <div className="space-y-6 bg-gradient-to-br from-[#F5F2EF] via-[#F1E4D8] to-[#E0C4A8] rounded-2xl p-6 sm:p-7 shadow-inner">

          {/* Nombre y teléfono */}
          <div className="space-y-1">
            <h2 className="text-sm tracking-wide text-[#8A7A68] uppercase">
              Agencia funeraria
            </h2>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#5B3A20]">
              SEÑOR DEL CALVARIO
            </h3>
            <p className="text-sm text-[#8A7A68]">
              Acompañando a tu familia con dignidad y respeto.
            </p>
          </div>

          {/* Dirección */}
          <div className="flex gap-3 text-sm text-[#5B3A20]">
            <div className="mt-1">
              <MapPin size={18} className="text-[#B28153]" />
            </div>
            <div>
              <p className="font-semibold">Dirección</p>
              <p className="text-[#8A7A68]">{address}</p>
            </div>
          </div>

          {/* Horario */}
          <div className="flex gap-3 text-sm text-[#5B3A20]">
            <div className="mt-1">
              <Clock size={18} className="text-[#B28153]" />
            </div>
            <div>
              <p className="font-semibold">Horario de atención</p>
              <p className="text-[#8A7A68]">
                Atención telefónica y por WhatsApp: <span className="font-medium">24/7</span>
              </p>
              <p className="text-[#8A7A68]">
                Atención en sala: <span className="font-medium">08:00 a 22:00 hrs</span>
              </p>
            </div>
          </div>

          {/* Botones de contacto */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            {/* WhatsApp */}
            <a
              href="https://wa.me/527721547459"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#B28153] text-[#5B3A20] hover:bg-[#B28153] hover:text-[#F5F2EF] transition-colors text-sm"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            {/* Llamar */}
            <a
              href="tel:+527721547459"
              className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#B28153] text-[#F5F2EF] hover:bg-[#8C5F32] transition-colors shadow-sm text-sm"
            >
              <Phone size={18} />
              Llamar ahora
            </a>
          </div>

          {/* Cómo llegar */}
          <div className="pt-2 border-t border-white/60 mt-2 text-xs text-[#8A7A68] space-y-1">
            <p className="font-semibold text-[#5B3A20]">¿Cómo llegar?</p>
            <p>
              Nos encontramos a unos minutos del centro de Tasquillo. Puedes
              seguir la ruta sugerida por Google Maps o comunicarte con nosotros
              para brindarte indicaciones personalizadas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
