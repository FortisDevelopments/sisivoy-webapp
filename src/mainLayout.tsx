import { useState } from "react";
import { Layout, Grid, Drawer } from "antd";
import { Routes, Route, useNavigate } from "react-router-dom";
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

type NavItem = { key: string; label: string; path: string };

const navItems: NavItem[] = [
  { key: "inicio", label: "Inicio", path: "/" },
  { key: "quienes-somos", label: "¿Quiénes somos?", path: "/quienes-somos" },
  { key: "bolsa-trabajo", label: "Bolsa de trabajo", path: "/bolsa-trabajo" },
  { key: "contacto", label: "Contacto", path: "/contacto" },
];

const MainLayout = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const navLinks = (
    <>
      {navItems.map(({ key, label, path }) => (
        <a
          key={key}
          href={path}
          onClick={(e) => {
            e.preventDefault();
            navigate(path);
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
              onClick={() => navigate("/")}
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
                    onClick={() => {
                      navigate("/");
                      setDrawerOpen(false);
                    }}
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
                  {navItems.map(({ key, label, path }) => (
                    <a
                      key={key}
                      href={path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(path);
                        setDrawerOpen(false);
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

      <Content className="main-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route
            path="/bolsa-trabajo"
            element={
              <BolsaTrabajo
                onIrADescripcionTrabajo={() =>
                  navigate("/descripcion-trabajo")
                }
                onIrACargaCV={() => navigate("/carga-cv")}
              />
            }
          />
          <Route
            path="/contacto"
            element={
              <Contacto
                onCerrarModalEnviado={() => {
                  navigate("/");
                }}
              />
            }
          />
          <Route path="/aviso-privacidad" element={<AvisoPrivacidad />} />
          <Route
            path="/descripcion-trabajo"
            element={
              <DescripcionTrabajo onIrACargaCV={() => navigate("/carga-cv")} />
            }
          />
          <Route
            path="/carga-cv"
            element={
              <CargaCV
                onCerrarModalEnviado={() => {
                  navigate("/bolsa-trabajo");
                }}
              />
            }
          />
        </Routes>
      </Content>

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
            href="/aviso-privacidad"
            onClick={(e) => {
              e.preventDefault();
              navigate("/aviso-privacidad");
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
