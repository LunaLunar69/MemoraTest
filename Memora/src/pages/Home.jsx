import { Link } from 'react-router-dom'


export default function Home(){
return (
<section className="max-w-6xl mx-auto px-4 py-16">
<h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-center">Dignidad y Gracia en la Despedida Final</h1>
<p className="max-w-2xl mx-auto text-center mt-4 text-slate-600">En tiempos de pérdida, encuentra consuelo...</p>
<div className="text-center mt-8">
<Link to="/ataudes" className="inline-block rounded-lg bg-orange-600 text-white px-5 py-2.5">Explora Nuestra Colección</Link>
</div>
</section>
)
}