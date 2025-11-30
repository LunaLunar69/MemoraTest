// src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { Leaf, Truck, HeartHandshake, Sparkles } from 'lucide-react'

// IMPORTA LAS IMÁGENES DESDE src/assets
import heroBg from '../assets/hero-memora.jpeg'
import storyImg from '../assets/imagen-velacion.jpg'

const FEATURES = [
  {
    icon: Leaf,
    title: 'Artesanía de Calidad',
    desc: 'Ataúdes elaborados con materiales seleccionados, pensados para un descanso final digno y sereno.',
  },
  {
    icon: Truck,
    title: 'Entrega Discreta',
    desc: 'Coordinamos entregas puntuales y respetuosas a funerarias y domicilios particulares.',
  },
  {
    icon: HeartHandshake,
    title: 'Apoyo Compasivo',
    desc: 'Te acompañamos con empatía en cada paso del proceso, escuchando tus necesidades.',
  },
  {
    icon: Sparkles,
    title: 'Opciones de Personalización',
    desc: 'Detalles especiales para honrar la memoria de tu ser querido de forma única.',
  },
]

export default function Home() {
  return (
    <main className="bg-[#F5F2EF]">
      {/* HERO */}
      <section className="relative border-b border-[#E3D7CC]">
        {/* Fondo con imagen */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Capa de color suave */}
        <div className="absolute inset-0 bg-[#F5F2EF]/50 backdrop-blur-sm" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center lg:items-start gap-10">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xs tracking-[0.25em] uppercase text-[#8A7A68] mb-3">
              MEMORA · SERVICIO FUNERARIO
            </p>

            <h1 className="text-4xl sm:text-6xl font-semibold leading-tight text-[#5B3A20]">
              Dignidad y Gracia en la
              <br />
              Despedida Final
            </h1>

            <p className="max-w-xl mt-6 text-[#8A7A68] text-lg mx-auto lg:mx-0">
              En momentos de pérdida, te ofrecemos un acompañamiento sereno y respetuoso,
              para honrar la memoria de quienes amas.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/ataudes"
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-full
                           bg-[#B28153] text-[#F5F2EF] shadow-md
                           hover:bg-[#8C5F32] transition-colors"
              >
                Explora Nuestra Colección
              </Link>

              <Link
                to="/contacto"
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-full
                           border border-[#D6C6B8] text-[#5B3A20]
                           hover:bg-white/70 transition-colors"
              >
                Habla con nosotros
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS DE COMPROMISO */}
      <section className="py-16 border-b border-[#E3D7CC]">
        <div className="max-w-6xl mx-auto px-6">
          <header className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-[#5B3A20]">
              Nuestro Compromiso Contigo
            </h2>
            <p className="mt-3 text-[#8A7A68] max-w-2xl mx-auto">
              Ofrecemos una gama de servicios pensados para aliviar la carga logística
              y emocional en un momento delicado.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="bg-white/80 border border-[#E3D7CC] rounded-2xl px-5 py-6 shadow-sm
                           hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full 
                                bg-[#FFF4E9] text-[#B28153] mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-[#5B3A20] mb-2">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-[#8A7A68]">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN HISTORIA / MENSAJE */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-center bg-white/70 border border-[#E3D7CC]
                          rounded-3xl shadow-sm p-8 lg:p-10">
            {/* Texto */}
            <div>
              <h2 className="text-3xl font-semibold text-[#5B3A20] mb-4">
                Una Tradición de Compasión
              </h2>
              <p className="text-sm sm:text-base text-[#8A7A68] leading-relaxed mb-4">
                Desde hace años, Memora ha acompañado a familias de la región brindando apoyo,
                orientación y un servicio digno. Nuestra misión es honrar cada vida con respeto,
                cuidado y atención a los detalles.
              </p>
              <p className="text-sm sm:text-base text-[#8A7A68] leading-relaxed">
                Nuestro equipo está comprometido en ofrecer un ambiente sereno, donde puedas
                tomar decisiones con calma y encontrar el espacio adecuado para despedirte
                de tu ser querido.
              </p>
            </div>

            {/* Imagen */}
            <div className="h-64 sm:h-72 lg:h-full">
              <div className="w-full h-full rounded-2xl border border-[#E3D7CC] bg-[#F5F2EF] overflow-hidden flex items-center justify-center">
                <img
                  src={storyImg}
                  alt="Sala de velación de Memora"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
