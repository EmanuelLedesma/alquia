import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import BottomNav from './BottomNav'
import { useAuth } from '../../contexts/AuthContext'

export default function AppLayout() {
  const { signOut } = useAuth()

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur flex items-center justify-between px-4 h-12">
        <span className="text-text-main font-bold">Alquia</span>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-1 text-sm text-text-muted"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </header>
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
