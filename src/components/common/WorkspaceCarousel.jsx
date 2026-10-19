import { useEffect, useState } from 'react'
import photoOne from '../../assets/images/foto 1.jpg'
import photoTwo from '../../assets/images/foto2.jpg'
import photoThree from '../../assets/images/foto3.png'

const slides = [
	{ src: photoOne, alt: 'Estudiantes y comunidad CESDE' },
	{ src: photoTwo, alt: 'Actividades y espacios de aprendizaje CESDE' },
	{ src: photoThree, alt: 'Experiencias de formación CESDE' },
]

function WorkspaceCarousel() {
	const [activeSlide, setActiveSlide] = useState(0)

	useEffect(() => {
		const timer = window.setInterval(() => {
			setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length)
		}, 5000)

		return () => window.clearInterval(timer)
	}, [])

	function showSlide(offset) {
		setActiveSlide((currentSlide) => (
			(currentSlide + offset + slides.length) % slides.length
		))
	}

	return (
		<section className="workspace-carousel" aria-label="Galería CESDE">
			<div className="workspace-carousel-image">
				<img src={slides[activeSlide].src} alt={slides[activeSlide].alt} />
				<button
					type="button"
					className="workspace-carousel-control workspace-carousel-previous"
					onClick={() => showSlide(-1)}
					aria-label="Ver foto anterior"
				>
					‹
				</button>
				<button
					type="button"
					className="workspace-carousel-control workspace-carousel-next"
					onClick={() => showSlide(1)}
					aria-label="Ver foto siguiente"
				>
					›
				</button>
			</div>
			<div className="workspace-carousel-footer">
				<span>Conoce CESDE</span>
				<div className="workspace-carousel-dots" aria-label="Seleccionar foto">
					{slides.map((slide, index) => (
						<button
							type="button"
							key={slide.src}
							className={`workspace-carousel-dot${activeSlide === index ? ' is-active' : ''}`}
							onClick={() => setActiveSlide(index)}
							aria-label={`Mostrar foto ${index + 1}`}
							aria-current={activeSlide === index ? 'true' : undefined}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default WorkspaceCarousel
