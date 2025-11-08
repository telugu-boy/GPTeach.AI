
import { Outlet } from 'react-router-dom'
import Nav from '../components/Nav'

export default function AppLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Nav />
      <Outlet />
    </div>
  )
}
