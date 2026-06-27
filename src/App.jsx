import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import InmueblesView from './views/InmueblesView'
import ClientesView from './views/ClientesView'
import ReservasView from './views/ReservasView'
import ReservaDetalleView from './views/ReservaDetalleView'
import GastosView from './views/GastosView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<InmueblesView />} />
          <Route path="/clientes" element={<ClientesView />} />
          <Route path="/reservas" element={<ReservasView />} />
          <Route path="/reservas/:id" element={<ReservaDetalleView />} />
          <Route path="/gastos" element={<GastosView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
