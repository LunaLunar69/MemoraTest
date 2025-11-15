import MapEmbed from '../features/contact/MapEmbed.jsx'


export default function Contact(){
return (
<div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
<header className="text-center">
<h1 className="text-3xl font-semibold">Contáctanos</h1>
<p className="text-slate-600">Estamos aquí para ayudarte 24/7.</p>
</header>
{/* TODO: ContactInfo + WhatsApp/Call buttons + ContactForm (save to Supabase) */}
<MapEmbed query="Guadalajara, Jalisco" />
</div>
)
}