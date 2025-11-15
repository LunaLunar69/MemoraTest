import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'


export default function PublicLayout() {
return (
<div className="min-h-screen flex flex-col bg-white text-slate-900">
<Navbar />
<main className="flex-1"> <Outlet /> </main>
<Footer />
</div>
)
}