import { useState, useRef, useEffect } from "react";
import { Row, Col, Input, Button, ConfigProvider, Modal, Checkbox } from "antd";
import waSvg from "../assets/images/contacto/wa.svg";
import mailSvg from "../assets/images/contacto/mail.svg";
import estrellaImg from "../assets/images/inicio/estrella.svg";
import avionSvg from "../assets/images/trabajo/avion.svg";

const { TextArea } = Input;

const estiloTriggerContacto = {
  width: "100%",
  padding: "8px 11px",
  fontSize: 14,
  border: "1px solid #d9d9d9",
  borderRadius: 6,
  cursor: "pointer",
  backgroundColor: "#fff",
  minHeight: 40,
  lineHeight: "22px",
  textAlign: "left" as const,
} as const;

const estiloPanelContacto = {
  marginTop: 4,
  padding: "12px",
  border: "1px solid #d9d9d9",
  borderRadius: 6,
  backgroundColor: "#fff",
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column" as const,
  gap: 8,
};

const OPCIONES_MOTIVO = [
  { label: "Registrar un negocio", value: "registrar_negocio" },
  { label: "Reportar un incidente", value: "reportar_incidente" },
  { label: "Alianza comercial", value: "alianza_comercial" },
  { label: "Otro", value: "otro" },
];

type ContactoProps = {
  onCerrarModalEnviado?: () => void;
};

const Contacto = ({ onCerrarModalEnviado }: ContactoProps) => {
  const [modalEnviadoOpen, setModalEnviadoOpen] = useState(false);
  const [motivoContacto, setMotivoContacto] = useState<string[]>([]);
  const [openMotivo, setOpenMotivo] = useState(false);
  const refMotivo = useRef<HTMLDivElement>(null);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refMotivo.current && !refMotivo.current.contains(target))
        setOpenMotivo(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalEnviadoOpen(true);
  };

  const isFormValid =
    nombre.trim().length > 0 &&
    correo.trim().length > 0 &&
    telefono.trim().length > 0 &&
    motivoContacto.length > 0 &&
    mensaje.trim().length > 0;

  const themeVistaContacto = {
    token: { colorPrimary: "#d4238b" },
  };

  return (
    <ConfigProvider theme={themeVistaContacto}>
      <section
        className="vista-contacto"
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          padding: "40px 50px",
          minWidth: "100%",
          paddingBottom: "120px",
        }}
      >
        <Row gutter={[32, 32]} align="top">
          <Col xs={24} md={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <img
                src={estrellaImg}
                alt=""
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
              <h1 style={{ color: "#d4238b", margin: 0 }}>Contacto</h1>
              <img
                src={estrellaImg}
                alt=""
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </div>
            <p
              style={{
                marginBottom: "24px",
                color: "#333",
                lineHeight: 1.5,
                fontSize: "1.5rem",
              }}
            >
              Ingresa tu información y uno de nuestros asesores se comunicará
              contigo a la brevedad.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="contacto-nombre"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Nombre y apellidos
                </label>
                <Input
                  id="contacto-nombre"
                  placeholder="Nombre y apellidos"
                  size="large"
                  required
                  style={{ width: "100%" }}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="contacto-correo"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Correo electrónico
                </label>
                <Input
                  id="contacto-correo"
                  type="email"
                  placeholder="Correo electrónico"
                  size="large"
                  required
                  style={{ width: "100%" }}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="contacto-telefono"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Número de teléfono
                </label>
                <Input
                  id="contacto-telefono"
                  type="tel"
                  placeholder="Número de teléfono"
                  size="large"
                  required
                  style={{ width: "100%" }}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "16px" }} ref={refMotivo}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Motivo de contacto
                </span>
                <button
                  type="button"
                  style={estiloTriggerContacto}
                  onClick={() => setOpenMotivo((v) => !v)}
                >
                  {motivoContacto.length
                    ? motivoContacto
                        .map(
                          (v) =>
                            OPCIONES_MOTIVO.find((o) => o.value === v)?.label ??
                            v,
                        )
                        .join(", ")
                    : "Seleccionar motivo(s)..."}
                </button>
                {openMotivo && (
                  <div style={estiloPanelContacto}>
                    <Checkbox.Group
                      options={OPCIONES_MOTIVO}
                      value={motivoContacto}
                      onChange={(values) => setMotivoContacto(values)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="contacto-ayuda"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  ¿En qué te podemos ayudar?
                </label>
                <TextArea
                  id="contacto-ayuda"
                  placeholder="Escribe tu mensaje..."
                  rows={4}
                  required
                  style={{ width: "100%", resize: "vertical" }}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!isFormValid}
                  style={{
                    backgroundColor: "#d4238b",
                    borderColor: "#4d238b",
                    fontSize: "1.5rem",
                    padding: "10px 20px",
                    height: "50px",
                  }}
                >
                  Enviar
                </Button>
              </div>
            </form>
          </Col>
          <Col xs={24} md={12} className="vista-contacto-col-medios">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <img
                src={estrellaImg}
                alt=""
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
              <h1 style={{ color: "#d4238b", margin: 0 }}>
                Medios de contacto adicionales
              </h1>
              <img
                src={estrellaImg}
                alt=""
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </div>
            <p
              style={{
                marginBottom: "24px",
                color: "#333",
                lineHeight: 1.5,
                fontSize: "1.5rem",
              }}
            >
              Te recordamos que nuestros servicios de atención son de Lunes a
              Viernes de 08:00am a 18:00pm.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <a
                href="mailto:info@sisivoy.com"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  border: "1px solid #e8e8e8",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#333",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#4d238b";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(77, 35, 139, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#e8e8e8";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#4d238b";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(77, 35, 139, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e8e8e8";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img
                  src={mailSvg}
                  alt="Correo"
                  style={{ width: 48, height: 48, objectFit: "contain" }}
                />
                <div>
                  <strong style={{ display: "block", marginBottom: "4px" }}>
                    Correo electrónico
                  </strong>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    info@sisivoy.com
                  </span>
                </div>
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=525562130883&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  border: "1px solid #e8e8e8",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#333",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#4d238b";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(77, 35, 139, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#e8e8e8";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#4d238b";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(77, 35, 139, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e8e8e8";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img
                  src={waSvg}
                  alt="WhatsApp"
                  style={{ width: 48, height: 48, objectFit: "contain" }}
                />
                <div>
                  <strong style={{ display: "block", marginBottom: "4px" }}>
                    WhatsApp
                  </strong>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    Escríbenos al +52 55 6213 0883
                  </span>
                </div>
              </a>
            </div>
          </Col>
        </Row>
      </section>
      <Modal
        open={modalEnviadoOpen}
        onCancel={() => {
          setModalEnviadoOpen(false);
          onCerrarModalEnviado?.();
        }}
        footer={null}
        centered
        width={550}
      >
        <div style={{ textAlign: "center", padding: "8px 0", width: "100%" }}>
          <div style={{ marginBottom: "20px" }}>
            <img
              src={avionSvg}
              alt=""
              style={{ width: 80, height: 80, objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "16px",
              flexWrap: "nowrap",
            }}
          >
            <img
              src={estrellaImg}
              alt=""
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <h3
              style={{
                margin: 0,
                color: "#d4238b",
                fontSize: "clamp(0.95rem, 4vw, 1.25rem)",
                fontWeight: 600,
                lineHeight: 1.3,
                flex: "1 1 auto",
                minWidth: 0,
                textAlign: "center",
              }}
            >
              ¡Tus datos han sido enviados correctamente!
            </h3>
            <img
              src={estrellaImg}
              alt=""
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          </div>
          <p style={{ margin: 0, color: "#333", fontSize: "1rem" }}>
            Uno de nuestros asesores se pondrá en contacto contigo lo más pronto
            posible para revisar tu caso.
          </p>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default Contacto;
