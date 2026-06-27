import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, CalendarDays, ReceiptText } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { label: 'Inmuebles', path: '/', icon: Home },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Calendario', path: '/calendario', icon: CalendarDays },
  { label: 'Gastos', path: '/gastos', icon: ReceiptText },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-0.5 w-full h-full"
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  isActive ? 'text-primary' : 'text-text-muted'
                )}
              />
              <span
                className={cn(
                  'text-[10px] leading-tight',
                  isActive ? 'text-primary font-medium' : 'text-text-muted'
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
