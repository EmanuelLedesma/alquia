import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="h-screen overflow-y-auto bg-background">
      <main className="pb-20 h-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
