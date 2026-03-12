import { useRef } from "react";
import { Row, Col } from "antd";
import estrellaImg from "../assets/images/inicio/estrella.svg";
import img1 from "../assets/images/trabajo/img1.png";
import img2 from "../assets/images/trabajo/img2.png";
import img3 from "../assets/images/trabajo/img3.png";
import img4 from "../assets/images/trabajo/img4.png";
import img5 from "../assets/images/trabajo/img5.png";
import flechaIzq from "../assets/images/quienes/flechaizq.svg";
import flechaDer from "../assets/images/quienes/flechader.svg";

const imagenesTrabajo = [img1, img2, img3, img4, img5];

type BolsaTrabajoProps = {
  onIrADescripcionTrabajo?: () => void;
  onIrACargaCV?: () => void;
};

const BolsaTrabajo = ({
  onIrADescripcionTrabajo,
  onIrACargaCV,
}: BolsaTrabajoProps) => {
  const carruselRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const scrollCarrusel = (direction: "left" | "right") => {
    const container = carruselRef.current;
    if (!container) return;
    const card = container.querySelector<HTMLDivElement>("div");
    const cardWidth = card?.offsetWidth ?? 220;
    const amount = direction === "left" ? -cardWidth : cardWidth;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const container = carruselRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDraggingRef.current) return;
    const container = carruselRef.current;
    if (!container) return;
    const dx = e.clientX - startXRef.current;
    container.scrollLeft = scrollLeftRef.current - dx;
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
  };

  return (
    <section
      className="vista-bolsa-trabajo"
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        width: "100%",
        padding: "40px 40px",
        minWidth: "100%",
        paddingBottom: "120px",
      }}
    >
      <Row gutter={[32, 32]} align="middle">
        <Col xs={24} md={12}>
          <div>
            <h1
              style={{
                color: "#d4238b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "2rem",
                marginBottom: "30px",
              }}
            >
              <img src={estrellaImg} alt="" style={{ width: 24, height: 24 }} />
              ¡Únete al equipo!
              <img src={estrellaImg} alt="" style={{ width: 24, height: 24 }} />
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              En SISI VOY, ya sea que tengas años de experiencia laboral o te
              acabes de graduar, hay una oportunidad laboral para ti. <br />
              ¡Comienza tu búsqueda aquí! Desarrollarás las habilidades
              tecnológicas y la mentalidad de crecimiento necesarias para
              convertirte en la versión más extraordinaria de ti mismo.
            </p>
            <h1
              style={{
                color: "#d4238b",
                fontSize: "2rem",
                marginBottom: "30px",
              }}
            >
              Vacantes publicadas recientemente
            </h1>
            <div
              className="vista-bolsa-trabajo-vacante"
              style={{
                position: "relative",
                backgroundColor: "#d4238b",
                color: "#ffffff",
                padding: "12px 16px",
                borderRadius: 8,
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                marginBottom: "50px",
                gap: "8px",
              }}
            >
              <img src={estrellaImg} alt="" style={{ width: 20, height: 20 }} />
              <p style={{ margin: 0, textAlign: "left", fontSize: "2.5rem" }}>
                Ejecutivo de ventas Jr
              </p>
              <img src={estrellaImg} alt="" style={{ width: 20, height: 20 }} />
              <button
                type="button"
                style={{
                  position: "absolute",
                  bottom: -40,
                  right: 0,
                  backgroundColor: "#FFB800",
                  color: "#d4238b",
                  padding: "14px 24px",
                  borderRadius: 10,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={onIrADescripcionTrabajo}
              >
                Postularme
              </button>
            </div>
            <div
              className="vista-bolsa-trabajo-vacante vista-bolsa-trabajo-vacante-opaca"
              style={{
                position: "relative",
                backgroundColor: "#d4238b",
                color: "#ffffff",
                padding: "12px 16px",
                borderRadius: 8,
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                marginBottom: "50px",
                gap: "8px",
              }}
            >
              <img src={estrellaImg} alt="" style={{ width: 20, height: 20 }} />
              <p style={{ margin: 0, textAlign: "left", fontSize: "2.5rem" }}>
                Ejecutivo de ventas Senior
              </p>
              <img src={estrellaImg} alt="" style={{ width: 20, height: 20 }} />
              <div
                style={{
                  position: "absolute",
                  bottom: -40,
                  right: 0,
                  backgroundColor: "#FFB800",
                  color: "#d4238b",
                  padding: "14px 24px",
                  borderRadius: 10,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                Postularme
              </div>
            </div>
            <div
              className="vista-bolsa-trabajo-vacante vista-bolsa-trabajo-vacante-opaca"
              style={{
                position: "relative",
                backgroundColor: "#d4238b",
                color: "#ffffff",
                padding: "12px 16px",
                borderRadius: 8,
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                marginBottom: "50px",
                gap: "8px",
              }}
            >
              <img src={estrellaImg} alt="" style={{ width: 20, height: 20 }} />
              <p style={{ margin: 0, textAlign: "left", fontSize: "2.5rem" }}>
                Supervisor comercial
              </p>
              <img src={estrellaImg} alt="" style={{ width: 20, height: 20 }} />
              <div
                style={{
                  position: "absolute",
                  bottom: -40,
                  right: 0,
                  backgroundColor: "#FFB800",
                  color: "#d4238b",
                  padding: "14px 24px",
                  borderRadius: 10,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                Postularme
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div
            style={{
              position: "relative",
            }}
          >
            <img
              src={flechaIzq}
              alt="Anterior"
              onClick={() => scrollCarrusel("left")}
              style={{
                position: "absolute",
                left: -25,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
            <img
              src={flechaDer}
              alt="Siguiente"
              onClick={() => scrollCarrusel("right")}
              style={{
                position: "absolute",
                right: -25,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
            <div
              className="quienes-carrusel"
              style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                paddingBottom: "8px",
              }}
              ref={carruselRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseLeave={stopDragging}
              onMouseUp={stopDragging}
            >
              {imagenesTrabajo.map((src, index) => (
                <div
                  key={`trabajo-${index}`}
                  style={{
                    minWidth: 200,
                    borderRadius: 16,
                    overflow: "hidden",
                    flexShrink: 0,
                    minHeight: 500,
                  }}
                >
                  <img
                    src={src}
                    alt={`Bolsa de trabajo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "500px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: "1.5rem" }}>
            <span style={{ fontWeight: "bold" }}>
              No te pierdas ninguna oportunidad y sube tu CV.
            </span>{" "}
            Nuestro equipo de reclutamiento se pondrá en contacto contigo.
          </p>
          <button
            type="button"
            style={{
              fontSize: "1.5rem",
              color: "#d4238b",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              font: "inherit",
            }}
            onClick={onIrACargaCV}
          >
            <span style={{ fontSize: "1.5rem" }}>Subir CV</span>
          </button>
        </Col>
      </Row>
    </section>
  );
};

export default BolsaTrabajo;
