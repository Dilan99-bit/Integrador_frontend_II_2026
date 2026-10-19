import { Navigate, Outlet, Route, Routes, useLocation, useOutletContext } from 'react-router-dom'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Categorias from './components/students/Categorias'
import WorkspaceCarousel from './components/common/WorkspaceCarousel'
import Empresas from './components/companies/Empresas'
import Evidencias from './components/students/Evidencias'
import Login from './components/auth/Login'
import Registros from './components/auth/Registros'
import RegistrosPanel from './components/companies/RegistrosPanel'
import Prioridades from './components/companies/Prioridades'
import Retos from './components/students/Retos'
import { SESSION_NAME_KEY, SESSION_ROLE_KEY, SESSION_STORAGE_KEY } from './services/localAuth'

function RequireAuth() {
  const location = useLocation()
  let email
  let role
  let displayName
  let error

  try {
    email = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    role = window.sessionStorage.getItem(SESSION_ROLE_KEY) || 'empresa'
    displayName = window.sessionStorage.getItem(SESSION_NAME_KEY) || email
  } catch (storageError) {
    if (!(storageError instanceof DOMException)) throw storageError
    error = 'No se permitió comprobar la sesión.'
  }

  if (!email) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, error }}
      />
    )
  }

  if (!['estudiante', 'empresa'].includes(role)) {
    return <Navigate to="/login" replace state={{ error: 'La sesión tiene un rol inválido.' }} />
  }

  return <Outlet context={{ email, role, displayName }} />
}

const studentNavigation = [
  { label: 'Categorías', path: '/categorias', icon: 'CA' },
  { label: 'Retos', path: '/retos', icon: 'RE' },
  { label: 'Evidencias', path: '/evidencias', icon: 'EV' },
]

const companyNavigation = [
  { label: 'Categorías', path: '/categorias', icon: 'CA' },
  { label: 'Empresas', path: '/empresas', icon: 'EM' },
  { label: 'Evidencias', path: '/evidencias', icon: 'EV' },
  { label: 'Prioridades', path: '/prioridades', icon: 'PR' },
  { label: 'Registros', path: '/registros-proyectos', icon: 'RG' },
  { label: 'Retos', path: '/retos', icon: 'RE' },
]

function Workspace() {
  const { email, role, displayName } = useOutletContext()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const navigation = role === 'estudiante' ? studentNavigation : companyNavigation

  function handleLogout() {
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
      window.sessionStorage.removeItem(SESSION_ROLE_KEY)
      window.sessionStorage.removeItem(SESSION_NAME_KEY)
      navigate('/login', { replace: true })
    } catch (storageError) {
      if (!(storageError instanceof DOMException)) throw storageError
      setError('El navegador no permitió cerrar la sesión. Intenta nuevamente.')
    }
  }

  return (
    <div className="workspace">
      <header className="workspace-header">
        <NavLink className="logo workspace-logo" to="/dashboard" aria-label="E-CESDE, inicio">
          <h1><span>E-</span>CESDE</h1>
        </NavLink>
        <div className="workspace-account">
          <div className="workspace-account-copy">
            <span>Sesión iniciada como</span>
            <strong>{displayName}</strong>
            <span className="workspace-account-email">{email}</span>
            <span className="workspace-role">{role === 'estudiante' ? 'Estudiante' : 'Empresa'}</span>
          </div>
          <button type="button" className="dashboard-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="workspace-body">
        <aside className="workspace-sidebar" aria-label="Navegación principal">
          <p className="workspace-sidebar-label">MENÚ</p>
          <nav className="workspace-nav">
            {navigation.map((item) => (
              <NavLink
                className={({ isActive }) => `workspace-nav-link${isActive ? ' is-active' : ''}`}
                key={item.path}
                to={item.path}
              >
                <span className="workspace-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="workspace-sidebar-account">
            <span className="workspace-avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
            <span className="workspace-sidebar-email">{displayName}</span>
          </div>
        </aside>

        <main className="workspace-main">
          {error && <p className="form-message form-message-error" role="alert">{error}</p>}
          <WorkspaceCarousel />
          <Outlet context={{ email, role, displayName }} />
        </main>
      </div>
    </div>
  )
}

function RequireCompany() {
  const context = useOutletContext()
  const { role } = context
  return role === 'empresa'
    ? <Outlet context={context} />
    : <Navigate to="/categorias" replace />
}

function DashboardHome() {
  const { role } = useOutletContext()
  return role === 'empresa'
    ? <Navigate to="/registros-proyectos" replace />
    : <Navigate to="/categorias" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registros />} />
      <Route element={<RequireAuth />}>
        <Route element={<Workspace />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/retos" element={<Retos />} />
          <Route path="/evidencias" element={<Evidencias />} />
          <Route element={<RequireCompany />}>
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/prioridades" element={<Prioridades />} />
            <Route path="/registros-proyectos" element={<RegistrosPanel />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
