import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { loadCompanyRecords } from '../../services/localAuth'
import { loadProjects, saveProjects } from '../../services/localProjects'

function localDateValue(date = new Date()) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function ProjectManagement() {
	const { email } = useOutletContext()
	const [initialData] = useState(() => {
		let storedProjects = []
		let storedCompanies = []
		const errors = []

		try {
			storedProjects = loadProjects()
		} catch (storageError) {
			if (!(storageError instanceof Error)) throw storageError
			errors.push(storageError.message)
		}

		try {
			storedCompanies = loadCompanyRecords()
		} catch (storageError) {
			if (!(storageError instanceof Error)) throw storageError
			errors.push(storageError.message)
		}

		return {
			projects: storedProjects,
			companies: storedCompanies,
			error: errors.join(' '),
		}
	})
	const [error, setError] = useState(initialData.error)
	const [success, setSuccess] = useState('')
	const [projects, setProjects] = useState(initialData.projects)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [form, setForm] = useState({
		title: '',
		description: '',
		skills: '',
		deadline: '',
	})

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

		const title = form.title.trim()
		const description = form.description.trim()
		const skills = form.skills
			.split(',')
			.map((skill) => skill.trim())
			.filter(Boolean)

		if (!title || !description || skills.length === 0 || !form.deadline) {
			setError('Completa todos los campos e ingresa al menos una habilidad requerida.')
			return
		}

		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const deadline = new Date(`${form.deadline}T00:00:00`)
		if (Number.isNaN(deadline.getTime()) || deadline < today) {
			setError('La fecha límite debe ser hoy o una fecha futura.')
			return
		}

		setIsSubmitting(true)

		try {
			const allProjects = loadProjects()
			const newProject = {
				id: window.crypto.randomUUID(),
				title,
				description,
				skills,
				deadline: form.deadline,
				companyEmail: email,
				status: 'Pendiente',
				createdAt: new Date().toISOString(),
			}
			const updatedProjects = [...allProjects, newProject]

			saveProjects(updatedProjects)
			setProjects(updatedProjects)
			setForm({ title: '', description: '', skills: '', deadline: '' })
			setSuccess('Proyecto enviado a CESDE. Quedó pendiente de aprobación y aún no está visible para estudiantes.')
		} catch (storageError) {
			if (!(storageError instanceof Error)) throw storageError
			setError(storageError.message)
		} finally {
			setIsSubmitting(false)
		}
	}

	const companyProjects = projects
		.filter((project) => project.companyEmail === email)
		.sort((first, second) => second.createdAt.localeCompare(first.createdAt))
	const pendingProjects = companyProjects.filter(
		(project) => project.status.toLowerCase() === 'pendiente',
	).length
	const approvedProjects = companyProjects.filter(
		(project) => project.status.toLowerCase() === 'aprobado',
	).length
	const companyNames = new Map(
		initialData.companies
			.filter((company) => (
				typeof company?.correo === 'string'
				&& typeof company.nombre === 'string'
			))
			.map((company) => [company.correo.trim().toLowerCase(), company.nombre.trim()]),
	)
	const registeredProjects = [...projects].sort(
		(first, second) => second.createdAt.localeCompare(first.createdAt),
	)

	return (
		<main className="dashboard-page">
			<div className="dashboard-content">
				<section className="dashboard-intro" aria-labelledby="registrations-title">
					<div>
						<p className="dashboard-eyebrow">Espacio de empresas</p>
						<h2 id="registrations-title">Empresas y proyectos</h2>
						<p>Publica una oportunidad y consulta el estado de los proyectos de tu empresa.</p>
					</div>
					<div className="dashboard-company">
						<span className="company-avatar" aria-hidden="true">
							{email.charAt(0).toUpperCase()}
						</span>
						<div>
							<span>Publicando como</span>
							<strong>{email}</strong>
						</div>
					</div>
				</section>

				{error && <p className="form-message form-message-error" role="alert">{error}</p>}

				<section className="project-summary" aria-label="Resumen de proyectos">
					<article className="summary-card summary-card-total">
						<span className="summary-icon" aria-hidden="true">01</span>
						<div>
							<span className="summary-label">Total de proyectos</span>
							<strong>{companyProjects.length}</strong>
						</div>
					</article>
					<article className="summary-card summary-card-pending">
						<span className="summary-icon" aria-hidden="true">02</span>
						<div>
							<span className="summary-label">Pendientes</span>
							<strong>{pendingProjects}</strong>
						</div>
					</article>
					<article className="summary-card summary-card-approved">
						<span className="summary-icon" aria-hidden="true">03</span>
						<div>
							<span className="summary-label">Aprobados</span>
							<strong>{approvedProjects}</strong>
						</div>
					</article>
				</section>

				<div className="dashboard-layout">
					<section className="dashboard-panel project-create-panel" aria-labelledby="create-project-title">
						<div className="panel-heading">
							<div>
								<p className="dashboard-eyebrow">Comparte una oportunidad</p>
								<h3 id="create-project-title">Nuevo proyecto</h3>
							</div>
							<span className="panel-step" aria-hidden="true">+</span>
						</div>

						<form className="project-form" onSubmit={handleSubmit}>
							<div className="project-field">
								<label htmlFor="project-title">Título del proyecto</label>
								<input
									id="project-title"
									name="title"
									type="text"
									maxLength={120}
									placeholder="Ej.: Rediseño de tienda en línea"
									value={form.title}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="project-field">
								<label htmlFor="project-description">Descripción del proyecto</label>
								<textarea
									id="project-description"
									name="description"
									rows={5}
									maxLength={3000}
									placeholder="Cuéntanos sobre el reto y el resultado que esperas."
									value={form.description}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="project-field">
								<label htmlFor="project-skills">Habilidades requeridas</label>
								<input
									id="project-skills"
									name="skills"
									type="text"
									placeholder="Ej.: React, diseño UI, bases de datos"
									value={form.skills}
									onChange={handleChange}
									required
								/>
								<p className="input-help">Separa las habilidades con comas.</p>
							</div>

							<div className="project-field">
								<label htmlFor="project-deadline">Fecha límite</label>
								<input
									id="project-deadline"
									name="deadline"
									type="date"
									min={localDateValue()}
									value={form.deadline}
									onChange={handleChange}
									required
								/>
							</div>

							{success && <p className="form-message form-message-success" role="status">{success}</p>}

							<button type="submit" className="btn-registrar" disabled={isSubmitting}>
								{isSubmitting ? 'Enviando...' : 'Enviar proyecto a revisión'}
								<span aria-hidden="true">→</span>
							</button>
						</form>
						<p className="dashboard-note">
							CESDE revisará tu propuesta antes de compartirla con los estudiantes.
						</p>
					</section>

					<section className="dashboard-panel company-projects" aria-labelledby="projects-title">
						<div className="panel-heading projects-heading">
							<div>
								<p className="dashboard-eyebrow">Actividad</p>
								<h3 id="projects-title">Mis proyectos</h3>
							</div>
							<span className="projects-count">{companyProjects.length}</span>
						</div>

						{companyProjects.length === 0 ? (
							<div className="projects-empty">
								<span className="projects-empty-icon" aria-hidden="true">+</span>
								<h4>Tu próximo proyecto empieza aquí</h4>
								<p>Publica una oportunidad para que los estudiantes puedan conocerla.</p>
							</div>
						) : (
							<ul className="project-list">
								{companyProjects.map((project) => {
									const isApproved = project.status.toLowerCase() === 'aprobado'
									return (
										<li className="project-item" key={project.id}>
											<div className="project-item-heading">
												<h4>{project.title}</h4>
												<span className={`project-status ${isApproved ? 'project-status-approved' : 'project-status-pending'}`}>
													{project.status}
												</span>
											</div>
											<p className="project-description">{project.description}</p>
											<div className="project-skills" aria-label="Habilidades requeridas">
												{project.skills.map((skill) => (
													<span className="skill-chip" key={skill}>{skill}</span>
												))}
											</div>
											<p className="project-meta">
												<span>Fecha límite</span>
												<strong>
													{new Date(`${project.deadline}T00:00:00`).toLocaleDateString('es-CO')}
												</strong>
											</p>
										</li>
									)
								})}
							</ul>
						)}
					</section>
				</div>

				<section className="dashboard-panel registered-projects" aria-labelledby="registered-projects-title">
					<div className="panel-heading projects-heading">
						<div>
							<p className="dashboard-eyebrow">Oportunidades compartidas</p>
							<h3 id="registered-projects-title">Proyectos de las empresas</h3>
							<p className="registered-projects-caption">
								Consulta los proyectos registrados y conoce qué empresa los publicó.
							</p>
						</div>
						<span className="projects-count">{registeredProjects.length}</span>
					</div>

					{registeredProjects.length === 0 ? (
						<div className="projects-empty">
							<span className="projects-empty-icon" aria-hidden="true">+</span>
							<h4>Aún no hay proyectos registrados</h4>
							<p>Cuando una empresa publique una oportunidad, aparecerá aquí.</p>
						</div>
					) : (
						<ul className="registered-project-list">
							{registeredProjects.map((project) => {
								const companyName = companyNames.get(project.companyEmail.toLowerCase())
								const isApproved = project.status.toLowerCase() === 'aprobado'
								return (
									<li className="registered-project-item" key={project.id}>
										<div className="registered-project-company">
											<span className="company-avatar" aria-hidden="true">
												{(companyName || project.companyEmail).charAt(0).toUpperCase()}
											</span>
											<div>
												<span>Publicado por</span>
												<strong>{companyName || project.companyEmail}</strong>
											</div>
										</div>
										<div className="registered-project-content">
											<div className="project-item-heading">
												<h4>{project.title}</h4>
												<span className={`project-status ${isApproved ? 'project-status-approved' : 'project-status-pending'}`}>
													{project.status}
												</span>
											</div>
											<p className="project-description">{project.description}</p>
											<div className="project-skills" aria-label="Habilidades requeridas">
												{project.skills.map((skill) => (
													<span className="skill-chip" key={skill}>{skill}</span>
												))}
											</div>
											<p className="project-meta">
												<span>Fecha límite</span>
												<strong>
													{new Date(`${project.deadline}T00:00:00`).toLocaleDateString('es-CO')}
												</strong>
											</p>
										</div>
									</li>
								)
							})}
						</ul>
					)}
				</section>
			</div>
		</main>
	)
}

export default ProjectManagement
