import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Row, Col } from "antd";
import imagenInicio from "../assets/images/inicio/iPhone14Pro.svg";
import groupImg from "../assets/images/inicio/group.svg";
import estrellaImg from "../assets/images/inicio/estrella.svg";
import appStoreImg from "../assets/images/inicio/appStore.svg";
import googlePlayImg from "../assets/images/inicio/googlePlay.svg";
import mailIconImg from "../assets/images/inicio/mailicon.svg";
import { sendContactForm } from "../services/mailservice";

const Inicio = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEmailValid = /^\S+@\S+\.\S+$/.test(email.trim());

  useEffect(() => {
    const timer = setTimeout(() => setModalVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (modalVisible) dialogRef.current?.showModal();
  }, [modalVisible]);

  const handleClose = () => setModalVisible(false);

  useEffect(() => {
    if (!modalVisible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalVisible]);

  const handleEnviarNewsletter = async () => {
    const correo = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(correo)) return;

    try {
      setEnviando(true);
      setErrorEnvio(null);
      await sendContactForm({
        nombre: "Registro a Newsletter",
        correo,
        telefono: "Sin numero",
        motivo: "Registro de correo a Newsletter",
        mensaje: "Hola, me gustaría registrar mi correo a su Newsletter",
      });
      setEnviado(true);
      // Cerrar el modal justo después de recibir éxito del servidor.
      setModalVisible(false);
      setEmail("");
      setEnviado(false);
    } catch {
      setErrorEnvio("No se pudo registrar tu correo. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  let textoBotonEnviar = "Enviar";
  if (enviando) textoBotonEnviar = "Enviando...";
  if (enviado) textoBotonEnviar = "¡Listo!";

  return (
    <section className="vista-inicio">
      <div
        className="vista-inicio-bg"
        style={{ backgroundImage: `url(${groupImg})` }}
        aria-hidden="true"
      />
      <Row gutter={[24, 24]} align="middle" className="vista-inicio-inner">
        <Col xs={24} md={12} lg={10}>
          <div className="vista-inicio-imagen">
            <img
              src={imagenInicio}
              alt="SISI VOY - Inicio"
              className="img-iphone-inicio"
            />
          </div>
        </Col>
        <Col xs={24} md={12} lg={14}>
          <div className="vista-inicio-texto">
            <div className="vista-inicio-texto-inner">
              <h1 className="vista-inicio-titulo">
                <span className="vista-inicio-exclamacion">
                  <img
                    src={estrellaImg}
                    alt=""
                    className="vista-inicio-estrella"
                  />
                  {"¡ DISFRUTA DE TODAS"}
                </span>
                <span className="vista-inicio-titulo">
                  LAS{" "}
                  <span className="vista-inicio-destacado">PROMOCIONES Y</span>
                </span>
                <span className="vista-inicio-exclamacion">
                  <span className="vista-inicio-destacado">DESCUENTOS !</span>
                  <img
                    src={estrellaImg}
                    alt=""
                    className="vista-inicio-estrella"
                  />
                </span>
              </h1>
              <div className="vista-inicio-stores">
                <a
                  href="https://apps.apple.com/mx/app/sisivoy/id6756131297"
                  className="vista-inicio-store-link"
                  aria-label="Descargar en App Store"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={appStoreImg}
                    alt="App Store"
                    className="vista-inicio-store-img"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.garm9609.sisivoy&pli=1"
                  className="vista-inicio-store-link"
                  aria-label="Descargar en Google Play"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={googlePlayImg}
                    alt="Google Play"
                    className="vista-inicio-store-img"
                  />
                </a>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      {modalVisible &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="modal-novedades-overlay"
            onClose={handleClose}
            aria-labelledby="modal-novedades-titulo"
          >
            <div className="modal-novedades-box">
              <button
                type="button"
                className="modal-novedades-close"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
              <div className="modal-novedades-content">
                <div className="modal-novedades-iconWrap" aria-hidden="true">
                  <img
                    src={mailIconImg}
                    alt=""
                    className="modal-novedades-icon"
                  />
                </div>
                <h2 className="modal-novedades-title">
                  ¡No te píerdas las promociones especiales!
                </h2>
                <p
                  id="modal-novedades-titulo"
                  className="modal-novedades-texto"
                >
                  Ingresa tu correo electrónico y recibe todas las novedades en
                  la plataforma, promociones exclusivas y dinámicas para obtener
                  más beneficios.
                </p>
                <div className="modal-novedades-formRow">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modal-novedades-input"
                    disabled={enviando || enviado}
                  />
                  <button
                    type="button"
                    className="modal-novedades-nextBtn"
                    disabled={!isEmailValid || enviando || enviado}
                    onClick={handleEnviarNewsletter}
                  >
                    {textoBotonEnviar}
                  </button>
                </div>
                {errorEnvio && (
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#b71c1c",
                      fontSize: "0.95rem",
                      textAlign: "center",
                    }}
                  >
                    {errorEnvio}
                  </p>
                )}
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </section>
  );
};

export default Inicio;
