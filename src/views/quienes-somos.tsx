import { useRef } from "react";
import { Row, Col, Grid } from "antd";
import estrellaImg from "../assets/images/inicio/estrella.svg";
import img1 from "../assets/images/quienes/img1.png";
import img2 from "../assets/images/quienes/img2.png";
import img3 from "../assets/images/quienes/img3.png";
import img4 from "../assets/images/quienes/img4.png";
import img5 from "../assets/images/quienes/img5.png";
import logo1 from "../assets/images/quienes/sisivoy.svg";
import playstore from "../assets/images/inicio/googlePlay.svg";
import appstore from "../assets/images/inicio/appStore.svg";
import cafe from "../assets/images/quienes/cafeiphone.svg";
import mapa from "../assets/images/quienes/mapaiphone.svg";
import aumentaSvg from "../assets/images/quienes/aumenta.svg";
import atraeSvg from "../assets/images/quienes/atrae.svg";
import fidelizaSvg from "../assets/images/quienes/fideliza.svg";
import obtenSvg from "../assets/images/quienes/obten.svg";
import convierteSvg from "../assets/images/quienes/convierte.svg";
import puntosSvg from "../assets/images/quienes/puntos.svg";
import flechaIzq from "../assets/images/quienes/flechaizq.svg";
import flechaDer from "../assets/images/quienes/flechader.svg";

const { useBreakpoint } = Grid;

const QuienesSomos = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
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
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        minWidth: "100%",
        padding: "40px 20px",
        paddingBottom: "120px",
      }}
    >
      {/* Bloque 1: texto izquierda, carrusel derecha */}
      <Row gutter={[32, 32]} align="middle" style={{ marginBottom: "40px" }}>
        <Col xs={24} md={12}>
          <div>
            <h1
              style={{
                color: "#d4238b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src={estrellaImg}
                alt=""
                style={{ width: 24, height: 24, textAlign: "center" }}
              />
              ¿Quiénes somos?
              <img src={estrellaImg} alt="" style={{ width: 24, height: 24 }} />
            </h1>
            <p>
              SISI VOY es una app que conecta a usuarios con comercios locales a
              través de recompensas y visibilidad digital. Ayuda a los pequeños
              negocios a atraer clientes y fortalecer su presencia en la
              comunidad, promoviendo un consumo local más inteligente y
              sostenible.
            </p>
            <p>
              Los negocios locales carecen de visibilidad y de presupuesto para
              marketing especializado, lo que limita su crecimiento frente a
              grandes cadenas. Al mismo tiempo, los usuarios desconocen opciones
              cercanas o dudan en probar lugares no “virales”. SISI VOY conecta
              ambos mundos con una solución simple que impulsa la presencia
              digital de los comercios, fomenta el descubrimiento y fortalece la
              economía de la comunidad.
            </p>
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
              {[img1, img2, img3, img4, img5].map((src, index) => (
                <div
                  key={String(index)}
                  style={{
                    minWidth: 180,
                    maxWidth: 220,
                    borderRadius: 16,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={src}
                    alt={`Quiénes somos ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Bloque 2: imagen izquierda, texto derecha */}
      <Row gutter={[32, 32]} align="stretch" style={{ marginBottom: "40px" }}>
        <Col xs={24} md={12}>
          <div
            style={{
              height: "100%",
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              gap: "8px",
              margin: "0 auto",
              alignItems: "stretch",
            }}
          >
            {/* Columna 1: 3 filas */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={logo1}
                  alt="SISI VOY"
                  style={{ width: "100%", objectFit: "contain" }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <a
                  href="https://apps.apple.com/mx/app/sisivoy/id6756131297"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <img
                    src={appstore}
                    alt="App Store"
                    style={{
                      width: "100%",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </a>
              </div>
              <div
                style={{
                  display: "flex",
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <a
                  href="https://play.google.com/store/apps/details?id=com.garm9609.sisivoy&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <img
                    src={playstore}
                    alt="Google Play"
                    style={{
                      width: "100%",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </a>
              </div>
            </div>
            {/* Columna 2: 1 bloque alto (ocupa 3 filas) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <img
                src={mapa}
                alt="mapa"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            {/* Columna 3: 1 bloque alto (ocupa 3 filas) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <img
                src={cafe}
                alt="cafe"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div>
            <h1
              style={{
                color: "#d4238b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src={estrellaImg}
                alt=""
                style={{ width: 20, height: 20, textAlign: "center" }}
              />
              ¿Qué lo hace único? - Propuesta de Valor
              <img src={estrellaImg} alt="" style={{ width: 20, height: 20 }} />
            </h1>
            <p>
              SISI VOY integra en una sola app un mapa interactivo para
              descubrir negocios cercanos, tarjetas digitales de lealtad que
              premian la recurrencia y descuentos / promociones (incluido2x1)
              que activan tráfico inmediato. Ofrece onboarding asistido para
              locatarios y visibilidad orgánica (sin depender de publicidad
              pagada), priorizando al 98% del mercado que son PYMEs.
            </p>
            <p>
              SISI VOY no solo busca recompensar el consumo, sino reconstruir la
              conexión entre las personas y los negocios de su comunidad,
              fortaleciendo la economía local a través de tecnología simple y
              cercana.
            </p>
          </div>
        </Col>
      </Row>

      {/* Bloque 3: aumenta, atrae, fideliza — scroll horizontal en móvil */}
      <Row gutter={[32, 32]} style={{ marginBottom: "40px" }} justify="center">
        <Col xs={24}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              backgroundColor: "#ffb800",
              padding: "14px 20px",
              marginBottom: 0,
              width: isMobile ? "100%" : "30%",
            }}
          >
            <img
              src={estrellaImg}
              alt=""
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#d4238b",
                margin: 0,
              }}
            >
              Beneficio para los negocios
            </span>
            <img
              src={estrellaImg}
              alt=""
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "stretch",
              borderRadius: "0 0 16px 16px",
              overflow: "hidden",
              paddingTop: 16,
              ...(isMobile
                ? {
                    overflowX: "auto",
                    flexWrap: "nowrap",
                    scrollSnapType: "x mandatory",
                    paddingBottom: 16,
                    marginLeft: -20,
                    marginRight: -20,
                    paddingLeft: 20,
                    paddingRight: 20,
                    WebkitOverflowScrolling: "touch",
                  }
                : { flexWrap: "wrap", justifyContent: "center" }),
            }}
          >
            {[
              { src: aumentaSvg, alt: "Aumenta" },
              { src: atraeSvg, alt: "Atrae" },
              { src: fidelizaSvg, alt: "Fideliza" },
            ].map((item) => (
              <div
                key={item.alt}
                style={{
                  flex: isMobile ? "0 0 auto" : 1,
                  minWidth: isMobile ? 280 : 0,
                  maxWidth: isMobile ? "85vw" : "none",
                  scrollSnapAlign: isMobile ? "start" : undefined,
                  scrollSnapStop: isMobile ? "always" : undefined,
                  borderRadius: 16,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 320,
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: 320,
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <div
        style={{
          height: "2px",
          borderColor: "#ffb800",
          borderWidth: "2px",
          borderStyle: "solid",
          width: "100%",
          marginBottom: "40px",
        }}
      ></div>

      {/* Bloque 4: obten, convierte, puntos — scroll horizontal en móvil */}
      <Row gutter={[32, 32]} style={{ marginBottom: "40px" }} justify="center">
        <Col xs={24}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              backgroundColor: "#ffb800",
              padding: "14px 20px",
              marginBottom: 0,
              width: isMobile ? "100%" : "30%",
            }}
          >
            <img
              src={estrellaImg}
              alt=""
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#d4238b",
                margin: 0,
              }}
            >
              Beneficio para los usuarios
            </span>
            <img
              src={estrellaImg}
              alt=""
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "stretch",
              borderRadius: "0 0 16px 16px",
              overflow: "hidden",
              paddingTop: 16,
              ...(isMobile
                ? {
                    overflowX: "auto",
                    flexWrap: "nowrap",
                    scrollSnapType: "x mandatory",
                    paddingBottom: 16,
                    marginLeft: -20,
                    marginRight: -20,
                    paddingLeft: 20,
                    paddingRight: 20,
                    WebkitOverflowScrolling: "touch",
                  }
                : { flexWrap: "wrap", justifyContent: "center" }),
            }}
          >
            {[
              { src: obtenSvg, alt: "Obten" },
              { src: convierteSvg, alt: "Convierte" },
              { src: puntosSvg, alt: "Puntos" },
            ].map((item) => (
              <div
                key={item.alt}
                style={{
                  flex: isMobile ? "0 0 auto" : 1,
                  minWidth: isMobile ? 280 : 0,
                  maxWidth: isMobile ? "85vw" : "none",
                  scrollSnapAlign: isMobile ? "start" : undefined,
                  scrollSnapStop: isMobile ? "always" : undefined,
                  borderRadius: 16,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 320,
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: 320,
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </section>
  );
};

export default QuienesSomos;
