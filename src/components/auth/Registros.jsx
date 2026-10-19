import { useState } from 'react'
import { Link } from 'react-router-dom'
import buildingImage from '../../assets/images/cesde.img.png'
import { loadCompanyRecords, REGISTROS_STORAGE_KEY } from '../../services/localAuth'

function Registros() {
	const [form, setForm] = useState({
		rol: '',
		nombre: '',
		correo: '',
		telefono: '',
		clave: '',
	})
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	function handleChange(event) {
		const { name, value } = event.target
		setForm((currentForm) => ({ ...currentForm, [name]: value }))
		setError('')
		setSuccess('')
	}

	function handleSubmit(event) {
		event.preventDefault()
		setError('')
		setSuccess('')

		const correoNormalizado = form.correo.trim().toLowerCase()
		const correoInput = event.currentTarget.elements.namedItem('correo')
		if (!form.rol) {
			setError('Selecciona tu rol para continuar.')
			return
		}

		if (!form.nombre.trim() || !correoNormalizado || !form.telefono.trim() || !form.clave) {
			setError('Completa todos los campos del formulario.')
			return
		}

		if (!correoNormalizado.includes('@') || !correoInput.validity.valid) {
			setError('Ingresa un correo electrónico válido que incluya @.')
			return
		}

		if (form.clave.length < 8) {
			setError('La clave debe tener mínimo 8 caracteres.')
			return
		}

		if (!/[A-Z]/.test(form.clave)) {
			setError('La clave debe incluir al menos una letra mayúscula.')
			return
		}

		if (!/[a-z]/.test(form.clave)) {
			setError('La clave debe incluir al menos una letra minúscula.')
			return
		}

		if (!/[0-9]/.test(form.clave)) {
			setError('La clave debe incluir al menos un número.')
			return
		}

		if (!/[^A-Za-z0-9\s]/.test(form.clave)) {
			setError('La clave debe incluir al menos un carácter especial.')
			return
		}

		setIsSubmitting(true)

		try {
			let registros
			try {
				registros = loadCompanyRecords()
			} catch (storageError) {
				if (!(storageError instanceof Error)) throw storageError
				setError(`${storageError.message} No se guardó este registro.`)
				return
			}

			const correoExistente = registros.some(
				(registro) => registro.correo?.toLowerCase() === correoNormalizado,
			)

			if (correoExistente) {
				setError('Ya existe un registro con ese correo electrónico.')
				return
			}

			const nuevoRegistro = {
				rol: form.rol,
				nombre: form.nombre.trim(),
				correo: correoNormalizado,
				telefono: form.telefono.trim(),
				clave: form.clave,
				createdAt: new Date().toISOString(),
			}

			try {
				window.localStorage.setItem(
					REGISTROS_STORAGE_KEY,
					JSON.stringify([...registros, nuevoRegistro]),
				)
			} catch (storageError) {
				if (!(storageError instanceof DOMException)) throw storageError
				setError(
					storageError.name === 'QuotaExceededError'
						? 'No hay espacio disponible para guardar el registro.'
						: 'No se permitió guardar el registro.',
				)
				return
			}

			setForm({ rol: '', nombre: '', correo: '', telefono: '', clave: '' })
			setSuccess('Registro completado correctamente.')
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
					<h2>Registro de usuario</h2>
					<p className="subtitle">
						Selecciona tu rol y completa tus datos para crear una cuenta.
					</p>

					<form onSubmit={handleSubmit} noValidate>
						<div className="input-group">
							<label className="input-label" htmlFor="rol_registro">Rol</label>
							<select
								id="rol_registro"
								name="rol"
								value={form.rol}
								onChange={handleChange}
								required
							>
								<option value="">Selecciona tu rol</option>
								<option value="estudiante">Estudiante</option>
								<option value="empresa">Empresa</option>
							</select>
						</div>

						<div className="input-group">
							<input
								type="text"
								id="nombre_empresa"
								name="nombre"
								placeholder={form.rol === 'empresa' ? 'Nombre de la empresa' : 'Nombre completo'}
								aria-label={form.rol === 'empresa' ? 'Nombre de la empresa' : 'Nombre completo'}
								autoComplete={form.rol === 'empresa' ? 'organization' : 'name'}
								value={form.nombre}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="input-group">
							<input
								type="email"
								id="correo_empresa"
								name="correo"
								placeholder="Correo electrónico"
								aria-label="Correo electrónico"
								autoComplete="email"
								value={form.correo}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="input-group">
							<input
								type="tel"
								id="telefono_empresa"
								name="telefono"
								placeholder="Teléfono"
								aria-label="Teléfono"
								autoComplete="tel"
								value={form.telefono}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="input-group">
							<input
								type="password"
								id="clave_empresa"
								name="clave"
								placeholder="Crea tu clave (mínimo 8 caracteres)"
								aria-label="Crea tu clave"
								autoComplete="new-password"
								minLength={8}
								pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{8,}"
								value={form.clave}
								onChange={handleChange}
								required
							/>
							<p className="input-help">
								Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
							</p>
						</div>

						{error && <p className="form-message form-message-error" role="alert">{error}</p>}
						{success && <p className="form-message form-message-success" role="status">{success}</p>}

						<button type="submit" className="btn-registrar" disabled={isSubmitting}>
							{isSubmitting ? 'Registrando...' : 'Registrar'}
						</button>
					</form>

					<p className="auth-switch">
						¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
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

export default Registros
