import { Link } from 'react-router-dom'
export default function NotFound(){
return (
<div className="min-h-[60vh] grid place-items-center text-center p-10">
<div>
<h1 className="text-4xl font-semibold mb-3">404</h1>
<p className="text-slate-600">Página no encontrada</p>
<Link to="/" className="inline-block mt-6 text-orange-600">Volver al inicio</Link>
</div>
</div>
)
}