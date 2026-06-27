import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import InmueblesView from './views/InmueblesView'
import InmuebleDetalleView from './views/InmuebleDetalleView'
import ClientesView from './views/ClientesView'
import ReservasView from './views/ReservasView'
import ReservaDetalleView from './views/ReservaDetalleView'
import GastosView from './views/GastosView'
import LoginView from './views/LoginView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<InmueblesView />} />
            <Route path="/inmuebles/:id" element={<InmuebleDetalleView />} />
            <Route path="/clientes" element={<ClientesView />} />
            <Route path="/reservas" element={<ReservasView />} />
            <Route path="/reservas/:id" element={<ReservaDetalleView />} />
            <Route path="/gastos" element={<GastosView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
