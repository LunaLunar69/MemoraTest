import { Route, Routes } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import Home from '../pages/Home.jsx'
import Catalog from '../pages/Catalog.jsx'
import Contact from '../pages/Contact.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Account from '../pages/Account.jsx'
import Payment from '../pages/Payment.jsx'
import AdminDashboard from '../pages/AdminDashboard.jsx'
import AdminOrders from '../pages/AdminOrders.jsx'
import AdminAtaudes from '../pages/AdminAtaudes.jsx'
import NotFound from '../pages/NotFound.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import AdminRoute from './AdminRoute.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Público */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/ataudes" element={<Catalog />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Área del usuario (protegida) con el MISMO layout público */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/pago" element={<Payment />} />
          <Route path="/cuenta" element={<Account />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="/admin/ataudes" element={<AdminAtaudes />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
