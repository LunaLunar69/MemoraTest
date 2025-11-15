export default function Footer(){
return (
<footer className="border-t mt-16">
<div className="max-w-6xl mx-auto px-4 py-10 text-sm text-slate-500">
<div className="font-semibold text-slate-700 mb-2">Ethereal Repose</div>
<p>Ofreciendo arreglos finales dignos con compasión y respeto.</p>
<p className="mt-4">© {new Date().getFullYear()} Ethereal Repose. Todos los derechos reservados.</p>
</div>
</footer>
)
}