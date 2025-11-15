import { NavLink, Outlet } from 'react-router-dom'


export default function AccountLayout() {
return (
<div className="max-w-6xl mx-auto px-4 py-8">
<div className="border-b mb-6 flex gap-6">
</div>
<Outlet />
</div>
)
}