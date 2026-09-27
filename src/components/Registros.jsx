import buildingImage from '../../img/cesde.img.png'
import '../../Style.css'

function Registros() {
	return (
		<div className="container">
			<div className="form-section">
				<div className="logo">
					<h1><span>E-</span>CESDE</h1>
				</div>

				<div className="form-content">
					<h2>Registro de Empresas</h2>
					<p className="subtitle">
						Ingresa el nombre de tu empresa y crea una clave para enviarnos tus proyectos reales.
					</p>

					<form action="#">
						<div className="input-group">
							<input type="text" id="nombre_empresa" placeholder="Nombre de la empresa" required />
						</div>

						<div className="input-group">
							<input type="password" id="clave_empresa" placeholder="Crea tu clave" required />
						</div>

						<button type="submit" className="btn-registrar">Registrar</button>
					</form>

					<p className="footer-text">Bienvenidos grupos Empresariales</p>
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
