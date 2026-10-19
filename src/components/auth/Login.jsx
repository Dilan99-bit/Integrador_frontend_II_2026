import { useState } from 'react'
import buildingImage from '../../assets/images/cesde.img.png'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
	loadCompanyRecords,
	SESSION_NAME_KEY,
	SESSION_ROLE_KEY,
	SESSION_STORAGE_KEY,
	verifyPassword,
} from '../../services/localAuth'

function Login() {
	const [rol, setRol] = useState('')
	const [correo, setCorreo] = useState('')
	const [clave, setClave] = useState('')
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()
	const routeError = location.state?.error

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')

		if (!rol) {
			setError('Selecciona tu rol para continuar.')
			return
		}

		const normalizedEmail = correo.trim().toLowerCase()
		if (!normalizedEmail.includes('@') || !event.currentTarget.elements.namedItem('correo').validity.valid) {
			setError('Ingresa un correo electrónico válido.')
			return
		}

		if (!clave) {
			setError('Ingresa tu clave.')
			return
		}

		setIsSubmitting(true)

		try {
			let records
			try {
				records = loadCompanyRecords()
			} catch (storageError) {
				if (!(storageError instanceof Error)) throw storageError
				setError(storageError.message)
				return
			}

			const record = records.find(
				(company) => typeof company?.correo === 'string'
					&& company.correo.toLowerCase() === normalizedEmail,
			)

			const accountRole = record?.rol === undefined ? 'empresa' : record.rol
			if (!record || accountRole !== rol) {
				setError('El correo, la clave o el rol no coinciden con un registro.')
				return
			}

			let passwordMatches = typeof record?.clave === 'string' && record.clave === clave
			if (record && !passwordMatches && typeof record.clave !== 'string') {
				try {
					passwordMatches = await verifyPassword(clave, record)
				} catch (verificationError) {
					if (!(verificationError instanceof Error)) throw verificationError
					setError('No se pudo verificar la clave con los datos registrados.')
					return
				}
			}

			if (!passwordMatches) {
				setError('El correo o la clave no coinciden con un registro.')
				return
			}

			try {
				window.sessionStorage.setItem(SESSION_STORAGE_KEY, normalizedEmail)
				window.sessionStorage.setItem(SESSION_ROLE_KEY, accountRole)
				window.sessionStorage.setItem(
					SESSION_NAME_KEY,
					typeof record.nombre === 'string' && record.nombre.trim()
						? record.nombre.trim()
						: normalizedEmail,
				)
			} catch (storageError) {
				if (!(storageError instanceof DOMException)) throw storageError
				window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
				window.sessionStorage.removeItem(SESSION_ROLE_KEY)
				window.sessionStorage.removeItem(SESSION_NAME_KEY)
				setError('No se permitió iniciar sesión.')
				return
			}

			const destination = location.state?.from?.pathname
				|| (accountRole === 'empresa' ? '/registros-proyectos' : '/categorias')
			navigate(destination, { replace: true })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="container">
			<div className="form-section">
				<div className="logo">
					<h1><span>E-</span>CESDE</h1>
				</div>

				<div className="form-content">
					<h2>Iniciar sesión</h2>
					<p className="subtitle">Ingresa con el correo y la clave registrados.</p>

					{routeError && <p className="form-message form-message-error" role="alert">{routeError}</p>}

					<form onSubmit={handleSubmit} noValidate>
						<div className="input-group">
							<label className="input-label" htmlFor="rol_login">Rol</label>
							<select
								id="rol_login"
								name="rol"
								value={rol}
								onChange={(event) => {
									setRol(event.target.value)
									setError('')
								}}
								required
							>
								<option value="">Selecciona tu rol</option>
								<option value="estudiante">Estudiante</option>
								<option value="empresa">Empresa</option>
							</select>
						</div>

						<div className="input-group">
							<input
								type="email"
								name="correo"
								placeholder="Correo electrónico"
								aria-label="Correo electrónico"
								autoComplete="email"
								value={correo}
								onChange={(event) => {
									setCorreo(event.target.value)
									setError('')
								}}
								required
							/>
						</div>

						<div className="input-group">
							<input
								type="password"
								name="clave"
								placeholder="Clave"
								aria-label="Clave"
								autoComplete="current-password"
								value={clave}
								onChange={(event) => {
									setClave(event.target.value)
									setError('')
								}}
								required
							/>
						</div>

						{error && <p className="form-message form-message-error" role="alert">{error}</p>}

						<button type="submit" className="btn-registrar" disabled={isSubmitting}>
							{isSubmitting ? 'Verificando...' : 'Ingresar'}
						</button>
					</form>

					<p className="auth-switch">
						¿Aún no tienes cuenta? <Link to="/registro">Regístrate como estudiante o empresa</Link>
					</p>
				</div>
			</div>

			<div className="image-section">
				<div className="illustration-placeholder">
					<img src={buildingImage} alt="Edificio CESDE" />
				</div>
			</div>
		</div>
	)
}

export default Login
