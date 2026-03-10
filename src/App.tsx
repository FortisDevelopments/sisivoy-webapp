import { Layout, Menu, Button } from "antd";
import { useState } from "react";
import {
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  UserAddOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import RegisterForm from "./components/RegisterForm";
import UsersView from "./components/UsersView";
import StoresView from "./components/StoresView";
import DashboardView from "./components/DashboardView";
import LoginView from "./LoginView";
import ProtectedRoute from "./ProtectedRoute";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const { Header, Content, Footer, Sider } = Layout;

function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMenuClick = (view: string) => {
    setActiveView(view);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ color: "white", padding: "16px", textAlign: "center" }}>
          {collapsed ? "WA" : "WebAdminApp"}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[activeView]}>
          <Menu.Item
            key="dashboard"
            icon={<DashboardOutlined />}
            onClick={() => handleMenuClick("dashboard")}
          >
            Dashboard
          </Menu.Item>
          <Menu.Item
            key="usuarios"
            icon={<UserOutlined />}
            onClick={() => handleMenuClick("usuarios")}
          >
            Usuarios
          </Menu.Item>
          <Menu.Item
            key="tiendas"
            icon={<ShopOutlined />}
            onClick={() => handleMenuClick("tiendas")}
          >
            Tiendas
          </Menu.Item>
          <Menu.Item
            key="register"
            icon={<UserAddOutlined />}
            onClick={() => handleMenuClick("register")}
          >
            Registrar Admin
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout
        style={{
          background: "#fff",
          width: "100%",
          marginLeft: collapsed ? 80 : 200,
          minHeight: "100vh",
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "fixed",
            top: 0,
            right: 0,
            left: collapsed ? 80 : 200,
            zIndex: 999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "left 0.2s",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span>Hola, {user?.name}</span>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              type="text"
            >
              Cerrar Sesión
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: "64px 16px 80px 16px",
            padding: "24px",
            background: "#fff",
            minHeight: "calc(100vh - 144px)",
          }}
        >
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "usuarios" && <UsersView />}
          {activeView === "tiendas" && <StoresView />}
          {activeView === "register" && <RegisterForm />}
        </Content>
        <Footer
          style={{
            textAlign: "center",
            width: "100%",
            position: "fixed",
            bottom: 0,
            right: 0,
            left: collapsed ? 80 : 200,
            zIndex: 999,
            background: "#fff",
            borderTop: "1px solid #f0f0f0",
            transition: "left 0.2s",
          }}
        >
          WebAdminApp ©2025 Consola Admin
        </Footer>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
