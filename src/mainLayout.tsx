import { useState } from "react";
import { Layout, Grid, Drawer } from "antd";
import logoImg from "./assets/images/logo.png";
import faceIcon from "./assets/images/footer/faceicon.png";
import instaIcon from "./assets/images/footer/instaicon.png";
import tiktokIcon from "./assets/images/footer/tiktokicon.png";
import xIcon from "./assets/images/footer/xicon.png";
import lkIcon from "./assets/images/footer/lkicon.png";
import waIcon from "./assets/images/footer/waicon.png";
import Inicio from "./views/inicio";
import QuienesSomos from "./views/quienes-somos";
import BolsaTrabajo from "./views/bolsa-trabajo";
import Contacto from "./views/contacto";
import AvisoPrivacidad from "./views/aviso-privacidad";
import DescripcionTrabajo from "./views/descripcion-trabajo";
import CargaCV from "./views/carga-cv";

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

type Vista =
  | "inicio"
  | "quienes-somos"
  | "bolsa-trabajo"
  | "contacto"
  | "aviso-privacidad"
  | "descripcion-trabajo"
  | "carga-cv";

const navItems: { key: Vista; label: string }[] = [
  { key: "inicio", label: "Inicio" },
  { key: "quienes-somos", label: "¿Quiénes somos?" },
  { key: "bolsa-trabajo", label: "Bolsa de trabajo" },
  { key: "contacto", label: "Contacto" },
];

const MainLayout = () => {
  const [vistaActiva, setVistaActiva] = useState<Vista>("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const renderVista = () => {
    switch (vistaActiva) {
      case "inicio":
        return <Inicio />;
      case "quienes-somos":
        return <QuienesSomos />;
      case "bolsa-trabajo":
        return (
          <BolsaTrabajo
            onIrADescripcionTrabajo={() => goTo("descripcion-trabajo")}
            onIrACargaCV={() => goTo("carga-cv")}
          />
        );
      case "contacto":
        return (
          <Contacto onCerrarModalEnviado={() => goTo("inicio")} />
        );
      case "aviso-privacidad":
        return <AvisoPrivacidad />;
      case "descripcion-trabajo":
        return (
          <DescripcionTrabajo onIrACargaCV={() => goTo("carga-cv")} />
        );
      case "carga-cv":
        return (
          <CargaCV onCerrarModalEnviado={() => goTo("bolsa-trabajo")} />
        );
      default:
        return null;
    }
  };

  const goTo = (v: Vista) => {
    setVistaActiva(v);
    setDrawerOpen(false);
  };

  const navLinks = (
    <>
      {navItems.map(({ key, label }) => (
        <a
          key={key}
          href={`#${key}`}
          onClick={(e) => {
            e.preventDefault();
            goTo(key);
          }}
          className="nav-link"
        >
          {label}
        </a>
      ))}
    </>
  );

  return (
    <Layout className="app-layout">
      <Header className="main-header">
        <div className="header-inner">
          <div className="logo-area">
            <button
              type="button"
              onClick={() => goTo("inicio")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "block",
                lineHeight: 0,
              }}
              aria-label="Ir a Inicio"
            >
              <img src={logoImg} alt="SISI VOY" className="header-logo" />
            </button>
          </div>
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="hamburger-btn"
                aria-label="Abrir menú"
              >
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
              </button>
              <Drawer
                title={null}
                placement="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                className="nav-drawer"
                styles={{
                  body: { padding: "1rem", backgroundColor: "#d4238b" },
                  header: { backgroundColor: "#d4238b", borderBottom: "none" },
                  wrapper: { backgroundColor: "#d4238b" },
                }}
              >
                <div className="drawer-logo-wrap">
                  <button
                    type="button"
                    onClick={() => goTo("inicio")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      display: "block",
                      lineHeight: 0,
                    }}
                    aria-label="Ir a Inicio"
                  >
                    <img src={logoImg} alt="SISI VOY" className="drawer-logo" />
                  </button>
                </div>
                <nav className="main-nav main-nav-vertical">
                  {navItems.map(({ key, label }) => (
                    <a
                      key={key}
                      href={`#${key}`}
                      onClick={(e) => {
                        e.preventDefault();
                        goTo(key);
                      }}
                      className="nav-link"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </Drawer>
            </>
          ) : (
            <nav className="main-nav">{navLinks}</nav>
          )}
        </div>
      </Header>

      <Content className="main-content">{renderVista()}</Content>

      <Footer className="main-footer">
        <div className="footer-icons">
          <a
            href="https://www.facebook.com/sisivoymx/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon-link"
            aria-label="SISI VOY en Facebook"
          >
            <img src={faceIcon} alt="Facebook" className="footer-icon" />
          </a>
          <a
            href="https://www.instagram.com/sisivoymx?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon-link"
            aria-label="SISI VOY en Instagram"
          >
            <img src={instaIcon} alt="Instagram" className="footer-icon" />
          </a>
          <a
            href="https://www.tiktok.com/@sisivoymx?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon-link"
            aria-label="SISI VOY en TikTok"
          >
            <img src={tiktokIcon} alt="TikTok" className="footer-icon" />
          </a>
          <a
            href="https://x.com/SISIVOY?s=20"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon-link"
            aria-label="SISI VOY en X"
          >
            <img src={xIcon} alt="X" className="footer-icon" />
          </a>
          <img src={lkIcon} alt="LinkedIn" className="footer-icon" />
          <a
            href="https://api.whatsapp.com/send/?phone=525562130883&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon-link"
            aria-label="Contactar por WhatsApp"
          >
            <img src={waIcon} alt="WhatsApp" className="footer-icon" />
          </a>
        </div>
        <div className="footer-right">
          <a
            href="#aviso-privacidad"
            onClick={(e) => {
              e.preventDefault();
              setVistaActiva("aviso-privacidad");
            }}
            className="footer-link"
          >
            Aviso de privacidad
          </a>
          <span className="footer-info">
            | info@sisivoy.com | © 2026 Todos los derechos reservados por
            SISIVOY
          </span>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
