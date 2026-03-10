import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Space,
  Alert,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import {
  API_BASE_URL,
  ENDPOINTS,
  type LoginData,
  type LoginResponse,
} from "./API";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

const LoginView: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    setErrorMessage(""); // Limpiar mensaje de error anterior

    try {
      const loginData: LoginData = {
        email: values.email,
        password: values.password,
      };

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Incluir cookies para que el servidor pueda establecer HttpOnly cookies
        body: JSON.stringify(loginData),
      });

      if (response.status === 200) {
        const loginResponse: LoginResponse = await response.json();

        // Verificar que el rol sea admin
        if (loginResponse.user.role !== "admin") {
          setErrorMessage("Credenciales no válidas");
          return;
        }

        // Usar el contexto de autenticación para almacenar datos
        login(
          loginResponse.user,
          loginResponse.accessToken,
          loginResponse.refreshToken
        );

        message.success(loginResponse.message || "Inicio de sesión exitoso");
        form.resetFields();

        // Redirigir al dashboard
        navigate("/");
      } else {
        // Manejar diferentes códigos de error
        const errorData = await response.json();

        if (response.status === 401) {
          setErrorMessage("Credenciales no válidas");
        } else if (response.status === 404) {
          setErrorMessage("Usuario no encontrado. Verifica tu email.");
        } else if (response.status === 400) {
          setErrorMessage(
            "Datos inválidos. Verifica el formato de tu email y contraseña."
          );
        } else {
          setErrorMessage(
            errorData.message || "Error al iniciar sesión. Inténtalo de nuevo."
          );
        }
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Inténtalo de nuevo.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Por favor ingresa tu contraseña"));
    }
    return Promise.resolve();
  };

  const validateEmail = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(
        new Error("Por favor ingresa tu correo electrónico")
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(
        new Error("Por favor ingresa un correo electrónico válido")
      );
    }
    return Promise.resolve();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "white",
        padding: "20px",
        width: "100%",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              Iniciar Sesión
            </Title>
            <Text type="secondary">Ingresa a tu cuenta</Text>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              style={{ marginBottom: "16px" }}
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Correo Electrónico"
              rules={[{ validator: validateEmail }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="tu@email.com"
                type="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ validator: validatePassword }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Ingresa tu contraseña"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  width: "100%",
                  height: "45px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default LoginView;
