function SectionPlaceholder({ title, description }) {
	return (
		<section className="workspace-section" aria-labelledby="workspace-section-title">
			<p className="workspace-section-eyebrow">E-CESDE</p>
			<h2 id="workspace-section-title">{title}</h2>
			<div className="workspace-empty">
				<span className="workspace-empty-icon" aria-hidden="true">
					{title.charAt(0)}
				</span>
				<h3>Sección lista</h3>
				<p>{description}</p>
				<span className="workspace-empty-note">
					El contenido de esta sección estará disponible próximamente.
				</span>
			</div>
		</section>
	)
}

export default SectionPlaceholder
