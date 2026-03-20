import { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Input,
  Checkbox,
  Button,
  Radio,
  ConfigProvider,
  Modal,
} from "antd";
import comunidadImg from "../assets/images/trabajo/comunidad.png";
import estrellaImg from "../assets/images/inicio/estrella.svg";
import avionSvg from "../assets/images/trabajo/avion.svg";
import { sendJobApplication } from "../services/mailservice";
import type { JobFormData } from "../services/mailservice";

const estiloTrigger = {
  width: "100%",
  padding: "8px 11px",
  fontSize: 14,
  border: "1px solid #d9d9d9",
  borderRadius: 6,
  cursor: "pointer",
  backgroundColor: "#fff",
  minHeight: 40,
  lineHeight: "22px",
} as const;

const estiloPanel = {
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

const CV_ACCEPT = ".pdf,.doc,.docx";

function esArchivoCvPermitido(file: File): boolean {
  const name = file.name.toLowerCase();
  const t = file.type;
  return (
    t === "application/pdf" ||
    name.endsWith(".pdf") ||
    t === "application/msword" ||
    name.endsWith(".doc") ||
    t ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  );
}

const OPCIONES_AREA = [
  { label: "Ventas", value: "ventas" },
  { label: "Administración", value: "administracion" },
  { label: "Mercadotecnia (publicidad)", value: "mercadotecnia" },
  { label: "Legal", value: "legal" },
  { label: "Recursos humanos", value: "recursos_humanos" },
  { label: "Soporte técnico", value: "soporte_tecnico" },
  { label: "Contabilidad", value: "contabilidad" },
];

type CargaCVProps = {
  onCerrarModalEnviado?: () => void;
};

const CargaCV = ({ onCerrarModalEnviado }: CargaCVProps) => {
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tieneCurriculum, setTieneCurriculum] = useState(false);
  const [linkedin, setLinkedin] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [areasPreferencia, setAreasPreferencia] = useState<string[]>([]);
  const [disponibilidadViajar, setDisponibilidadViajar] = useState<
    string | null
  >(null);
  const [situacionLaboral, setSituacionLaboral] = useState<string | null>(null);
  const [openArea, setOpenArea] = useState(false);
  const [openDisponibilidad, setOpenDisponibilidad] = useState(false);
  const [openSituacion, setOpenSituacion] = useState(false);
  const refArea = useRef<HTMLDivElement>(null);
  const refDisponibilidad = useRef<HTMLDivElement>(null);
  const refSituacion = useRef<HTMLDivElement>(null);
  const [modalEnviadoOpen, setModalEnviadoOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refArea.current && !refArea.current.contains(target))
        setOpenArea(false);
      if (
        refDisponibilidad.current &&
        !refDisponibilidad.current.contains(target)
      )
        setOpenDisponibilidad(false);
      if (refSituacion.current && !refSituacion.current.contains(target))
        setOpenSituacion(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cvFile || !disponibilidadViajar || !situacionLaboral) return;

    const disponibilidadTexto = disponibilidadViajar === "si" ? "Sí" : "No";
    const situacionTexto =
      situacionLaboral === "empleado"
        ? "Empleado actualmente"
        : "Buscando oportunidades activamente";

    const areaTexto = areasPreferencia
      .map((v) => OPCIONES_AREA.find((o) => o.value === v)?.label ?? v)
      .join(", ");

    const payload: JobFormData = {
      nombre,
      correo,
      telefono,
      disponibilidad: disponibilidadTexto,
      situacion: situacionTexto,
      linkedin: linkedin || undefined,
      area: areaTexto || undefined,
    };

    try {
      setEnviando(true);
      setErrorEnvio(null);
      await sendJobApplication(payload, cvFile);
      setModalEnviadoOpen(true);
    } catch {
      setErrorEnvio(
        "Hubo un problema al enviar tu postulación. Intenta de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const isFormValid =
    nombre.trim().length > 0 &&
    correo.trim().length > 0 &&
    telefono.trim().length > 0 &&
    tieneCurriculum &&
    areasPreferencia.length > 0 &&
    !!disponibilidadViajar &&
    !!situacionLaboral &&
    aceptoTerminos;

  const themeVistaCV = {
    token: { colorPrimary: "#d4238b" },
  };

  return (
    <ConfigProvider theme={themeVistaCV}>
      <section
        className="vista-carga-cv"
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          padding: "40px 20px",
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
                justifyContent: "left",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <img
                src={estrellaImg}
                alt=""
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
              <h1
                style={{
                  margin: 0,
                  color: "#d4238b",
                  fontSize: "1.8rem",
                  fontWeight: 600,
                }}
              >
                Comunidad de talento SISIVOY
              </h1>
              <img
                src={estrellaImg}
                alt=""
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </div>
            <p
              style={{
                marginBottom: "16px",
                fontSize: "1.2rem",
                fontWeight: 400,
              }}
            >
              Inscríbete a la Comunidad de Talento SISIVOY para que podamos
              ponernos en contacto contigo con oportunidades profesionales de
              acuerdo a tu perfil.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="nombre-apellidos"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Nombre y apellidos
                </label>
                <Input
                  id="nombre-apellidos"
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
                  htmlFor="correo"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Correo electrónico
                </label>
                <Input
                  id="correo"
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
                  htmlFor="telefono"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Número de teléfono
                </label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Número de teléfono"
                  size="large"
                  required
                  style={{ width: "100%" }}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="linkedin"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Perfil de LinkedIn
                </label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="URL de tu perfil de LinkedIn"
                  size="large"
                  style={{ width: "100%" }}
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
                <p
                  style={{
                    marginTop: "4px",
                    marginBottom: 0,
                    fontSize: "0.75rem",
                    color: "#666666",
                  }}
                >
                  *Al incluir voluntariamente la URL de tu perfil de LinkedIn a
                  continuación o en tu currículum, nos das tu consentimiento
                  para que completemos tu perfil con la información profesional
                  que compartes en esa red social.
                </p>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="curriculum"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Curriculum
                </label>
                <input
                  id="curriculum"
                  type="file"
                  accept={CV_ACCEPT}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) {
                      setTieneCurriculum(false);
                      setCvFile(null);
                      setErrorArchivo(null);
                      return;
                    }

                    const maxBytes = 6 * 1024 * 1024;

                    if (!esArchivoCvPermitido(file)) {
                      setErrorArchivo(
                        "Solo se permiten archivos PDF, Word (.doc, .docx).",
                      );
                      setTieneCurriculum(false);
                      setCvFile(null);
                      e.target.value = "";
                      return;
                    }

                    if (file.size > maxBytes) {
                      setErrorArchivo("Archivo demasiado grande");
                      setTieneCurriculum(false);
                      setCvFile(null);
                      e.target.value = "";
                      return;
                    }

                    setErrorArchivo(null);
                    setTieneCurriculum(true);
                    setCvFile(file);
                  }}
                />
                <p
                  style={{
                    marginTop: "4px",
                    marginBottom: 0,
                    fontSize: "0.75rem",
                    color: "#666",
                  }}
                >
                  Se aceptan archivos PDF o Word (.doc, .docx) menores a
                  6&nbsp;MB
                </p>
                {errorArchivo && (
                  <p
                    style={{
                      marginTop: "4px",
                      marginBottom: 0,
                      fontSize: "0.75rem",
                      color: "#d4238b",
                    }}
                  >
                    {errorArchivo}
                  </p>
                )}
              </div>
              <div style={{ marginBottom: "16px" }} ref={refArea}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Área de preferencia
                </span>
                <button
                  type="button"
                  style={{ ...estiloTrigger, textAlign: "left" }}
                  onClick={() => setOpenArea((v) => !v)}
                >
                  {areasPreferencia.length
                    ? areasPreferencia
                        .map(
                          (v) =>
                            OPCIONES_AREA.find((o) => o.value === v)?.label ??
                            v,
                        )
                        .join(", ")
                    : "Seleccionar área(s)..."}
                </button>
                {openArea && (
                  <div style={estiloPanel}>
                    <Checkbox.Group
                      options={OPCIONES_AREA}
                      value={areasPreferencia}
                      onChange={(values) => setAreasPreferencia(values)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "16px" }} ref={refDisponibilidad}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Disponibilidad para viajar
                </span>
                <button
                  type="button"
                  style={{ ...estiloTrigger, textAlign: "left" }}
                  onClick={() => setOpenDisponibilidad((v) => !v)}
                >
                  {disponibilidadViajar === "si" && "Sí"}
                  {disponibilidadViajar === "no" && "No"}
                  {!disponibilidadViajar && "Seleccionar..."}
                </button>
                {openDisponibilidad && (
                  <div style={estiloPanel}>
                    <Radio.Group
                      value={disponibilidadViajar}
                      onChange={(e) => {
                        setDisponibilidadViajar(e.target.value);
                        setOpenDisponibilidad(false);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <Radio value="si">Sí</Radio>
                        <Radio value="no">No</Radio>
                      </div>
                    </Radio.Group>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "16px" }} ref={refSituacion}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Situación laboral actual
                </span>
                <button
                  type="button"
                  style={{ ...estiloTrigger, textAlign: "left" }}
                  onClick={() => setOpenSituacion((v) => !v)}
                >
                  {situacionLaboral === "empleado" && "Empleado"}
                  {situacionLaboral === "buscando" &&
                    "Buscando oportunidades activamente"}
                  {!situacionLaboral && "Seleccionar..."}
                </button>
                {openSituacion && (
                  <div style={estiloPanel}>
                    <Radio.Group
                      value={situacionLaboral}
                      onChange={(e) => {
                        setSituacionLaboral(e.target.value);
                        setOpenSituacion(false);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <Radio value="empleado">Empleado</Radio>
                        <Radio value="buscando">
                          Buscando oportunidades activamente
                        </Radio>
                      </div>
                    </Radio.Group>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "24px" }}>
                <Checkbox
                  checked={aceptoTerminos}
                  onChange={(e) => setAceptoTerminos(e.target.checked)}
                >
                  Aceptar términos y condiciones
                </Checkbox>
              </div>
              <div
                className="vista-carga-cv-boton-enviar-wrap"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  disabled={!isFormValid || enviando}
                  style={{
                    backgroundColor: "#d4238b",
                    borderColor: "#d4238b",
                    paddingInline: 22,
                    height: 48,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {enviando ? "Enviando..." : "Enviar"}
                </Button>
              </div>
              {errorEnvio && (
                <p
                  style={{
                    marginTop: "10px",
                    marginBottom: 0,
                    color: "#d32f2f",
                    fontSize: "0.9rem",
                    textAlign: "right",
                  }}
                >
                  {errorEnvio}
                </p>
              )}
            </form>
          </Col>
          <Col xs={24} md={12} className="vista-carga-cv-col-imagen">
            <div
              style={{
                width: "100%",
                minHeight: 400,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: "#f5f5f5",
              }}
            >
              <img
                src={comunidadImg}
                alt="Comunidad"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 400,
                  objectFit: "cover",
                  display: "block",
                }}
              />
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
            Uno de nuestros asesores de Recursos Humanos se pondrá en contacto
            contigo en caso de alinearse tu perfil con la vacante o departamento
            seleccionado
          </p>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default CargaCV;
