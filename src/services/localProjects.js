export const PROJECTS_STORAGE_KEY = 'cesde_proyectos'

export function loadProjects() {
	let storedProjects

	try {
		storedProjects = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
	} catch (error) {
		if (!(error instanceof DOMException)) throw error
		throw new Error('El navegador no permitió acceder a los proyectos guardados.', { cause: error })
	}

	if (!storedProjects) return []

	let projects
	try {
		projects = JSON.parse(storedProjects)
	} catch (error) {
		if (!(error instanceof SyntaxError)) throw error
		throw new Error('Los proyectos guardados no se pudieron leer.', { cause: error })
	}

	if (!Array.isArray(projects)) {
		throw new Error('El almacenamiento de proyectos tiene un formato inválido.')
	}

	const validProjects = projects.every((project) => (
		project
		&& typeof project.id === 'string'
		&& typeof project.title === 'string'
		&& typeof project.description === 'string'
		&& Array.isArray(project.skills)
		&& project.skills.every((skill) => typeof skill === 'string')
		&& typeof project.deadline === 'string'
		&& typeof project.companyEmail === 'string'
		&& typeof project.status === 'string'
		&& typeof project.createdAt === 'string'
	))

	if (!validProjects) {
		throw new Error('Uno o más proyectos guardados tienen un formato inválido.')
	}

	return projects
}

export function saveProjects(projects) {
	try {
		window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
	} catch (error) {
		if (!(error instanceof DOMException)) throw error
		throw new Error(
			error.name === 'QuotaExceededError'
				? 'No hay espacio disponible para guardar el proyecto en este navegador.'
				: 'El navegador no permitió guardar el proyecto.',
			{ cause: error },
		)
	}
}
