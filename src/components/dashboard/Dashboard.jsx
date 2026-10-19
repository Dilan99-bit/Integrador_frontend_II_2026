import { useOutletContext } from 'react-router-dom'

function Dashboard() {
	const { displayName, role } = useOutletContext()
	const isCompany = role === 'empresa'

	return (
		<main className="dashboard-page">
			<div className="dashboard-content">
				<section className="dashboard-intro" aria-labelledby="dashboard-title">
					<div>
						<p className="dashboard-eyebrow">
							Espacio de {isCompany ? 'empresas' : 'estudiantes'}
						</p>
						<h2 id="dashboard-title">
							{isCompany ? 'Bienvenido a E-CESDE' : 'Tu espacio de aprendizaje'}
						</h2>
						<p>
							{isCompany
								? `Hola, ${displayName}. Desde el menú puedes gestionar tus registros y explorar las demás secciones.`
								: `Hola, ${displayName}. Desde el menú puedes explorar categorías, retos y evidencias.`}
						</p>
					</div>
					<div className="dashboard-company">
						<span className="company-avatar" aria-hidden="true">
							{displayName.charAt(0).toUpperCase()}
						</span>
						<div>
							<span>Sesión iniciada como</span>
							<strong>{displayName}</strong>
						</div>
					</div>
				</section>
			</div>
		</main>
	)
}

export default Dashboard
