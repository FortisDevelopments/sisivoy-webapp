import { Row, Col } from "antd";
import estrellaImg from "../assets/images/inicio/estrella.png";
import flecha from "../assets/images/trabajo/flecha.svg";
import personaImg from "../assets/images/trabajo/persona.svg";

type DescripcionTrabajoProps = {
  onIrACargaCV?: () => void;
};

const DescripcionTrabajo = ({ onIrACargaCV }: DescripcionTrabajoProps) => {
  return (
    <section
      className="vista-descripcion-trabajo"
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        padding: "40px 20px",
        minWidth: "100%",
        paddingBottom: "120px",
      }}
    >
      <Row gutter={[32, 32]}>
        <Col xs={24} md={12} style={{ marginBottom: "50px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#ffb800",
              justifyContent: "center",
              marginBottom: "24px",
              margin: 0,
              width: "100%",
            }}
          >
            <img
              src={estrellaImg}
              alt=""
              style={{
                width: 28,
                height: 28,
                filter: "brightness(0) invert(1)",
              }}
            />
            <h1 style={{ color: "#d4238b", margin: 2 }}>
              Vacante: Ejecutivo de ventas Jr
            </h1>
            <img
              src={estrellaImg}
              alt=""
              style={{
                width: 28,
                height: 28,
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                color: "#d4238b",
                fontSize: "1.8rem",
                marginBottom: "8px",
              }}
            >
              <img src={flecha} alt="" style={{ width: 24, height: 24 }} />
              Requisitos:
            </h1>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.25rem",
                lineHeight: 1.6,
                listStyleType: "disc",
              }}
            >
              <li>Escolaridad mínima de preparatoria concluida.</li>
              <li>Conocimiento de técnicas de venta y negociación.</li>
              <li>Facilidad de palabra y excelente actitud comercial.</li>
              <li>Gusto por las ventas y el trato con cliente.</li>
              <li>
                Habilidades sólidas de comunicación, persuasión y negociación.
              </li>
              <li>Organización y seguimiento de cartera de clientes.</li>
              <li>Preferiblemente vivir cerca de Alcaldía Benito Juárez.</li>
            </ul>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                color: "#d4238b",
                fontSize: "1.8rem",
                marginBottom: "8px",
              }}
            >
              <img src={flecha} alt="" style={{ width: 24, height: 24 }} />
              Funciones:
            </h1>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.25rem",
                lineHeight: 1.6,
                listStyleType: "disc",
              }}
            >
              <li>
                Prospección activa de nuevos negocios para su integración a la
                app.
              </li>
              <li>
                Seguimiento y gestión de cartera de clientes (nuevos y
                existentes).
              </li>
              <li>
                Presentación y demostración del valor y beneficios de la app.
              </li>
              <li>
                Elaboración de reportes de actividad, resultados y avance de
                cartera.
              </li>
              <li>
                Coordinación con el área de operaciones para el onboarding de
                clientes.
              </li>
            </ul>
          </div>
        </Col>
        <Col
          xs={24}
          md={10}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            className="vista-descripcion-trabajo-ofrecemos"
            style={{
              position: "relative",
              marginBottom: "20px",
              borderWidth: 3,
              borderColor: "#ffb800",
              borderStyle: "solid",
              padding: 8,
            }}
          >
            <img
              src={personaImg}
              alt=""
              className="vista-descripcion-trabajo-persona"
              style={{
                position: "absolute",
                top: -25,
                right: -75,
                width: 150,
                height: 150,
              }}
            />
            <h1
              className="vista-descripcion-trabajo-ofrecemos-titulo"
              style={{
                color: "#d4238b",
                fontSize: "1.8rem",
                marginBottom: "8px",
              }}
            >
              <img src={flecha} alt="" style={{ width: 24, height: 24 }} />
              Ofrecemos:
            </h1>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.25rem",
                lineHeight: 1.6,
                listStyleType: "disc",
              }}
            >
              <li>Salario bruto $10,512 mensuales.</li>
              <li>Prestaciones de ley desde el primer día.</li>
              <li>Contrato por tiempo indeterminado.</li>
              <li>Capacitación constante en producto y técnicas de venta.</li>
              <li>
                Horario laboral: 48 horas semanales con flexibilidad de horario
                (posibilidad de fines de semana).
              </li>
              <li>
                Lugar de trabajo: WTC (Montecito 38, Col. Nápoles, CDMX,
                Alcaldía Benito Juárez).
              </li>
              <li>Equipo móvil y laptop/tablet empresarial.</li>
              <li>Uniforme gratuito.</li>
              <li>Comisión mensual sobre ventas.</li>
            </ul>
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 16 }}
          >
            <button
              type="button"
              style={{
                backgroundColor: "#d4238b",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                borderRadius: 8,
                fontSize: "1.1rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={onIrACargaCV}
            >
              Postularme
            </button>
          </div>
        </Col>
      </Row>
    </section>
  );
};

export default DescripcionTrabajo;
