import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Alert,
  Select,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { API_BASE_URL, ENDPOINTS, type RegisterData } from "../API";

const { Title } = Typography;
const { Option } = Select;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  birth_date: string;
  gender: string;
  phone: string;
}

const RegisterForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onFinish = async (values: RegisterFormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const registerData: RegisterData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        birth_date: values.birth_date,
        gender: values.gender,
        phone: values.phone,
      };

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      if (response.status === 200) {
        message.success("Usuario registrado exitosamente");
        form.resetFields();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Error al registrar usuario");
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
      return Promise.reject(new Error("Por favor ingresa la contraseña"));
    }
    if (value.length < 8) {
      return Promise.reject(
        new Error("La contraseña debe tener al menos 8 caracteres")
      );
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: unknown, value: string) => {
    const password = form.getFieldValue("password");
    if (!value) {
      return Promise.reject(new Error("Por favor confirma la contraseña"));
    }
    if (value !== password) {
      return Promise.reject(new Error("Las contraseñas no coinciden"));
    }
    return Promise.resolve();
  };

  const validateEmail = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(
        new Error("Por favor ingresa el correo electrónico")
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
        maxWidth: 600,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Title level={2}>Registrar Nuevo Administrador</Title>

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      <Card style={{ width: "100%" }}>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="Nombre Completo"
            rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nombre completo" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[{ validator: validateEmail }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="correo@ejemplo.com"
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
              placeholder="Mínimo 8 caracteres"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar Contraseña"
            rules={[{ validator: validateConfirmPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirma tu contraseña"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: "Por favor selecciona un rol" }]}
          >
            <Select placeholder="Selecciona el rol">
              <Option value="admin">Administrador</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="birth_date"
            label="Fecha de Nacimiento"
            rules={[
              {
                required: true,
                message: "Por favor ingresa la fecha de nacimiento",
              },
            ]}
          >
            <Input prefix={<CalendarOutlined />} placeholder="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Género"
            rules={[
              { required: true, message: "Por favor selecciona el género" },
            ]}
          >
            <Select placeholder="Selecciona el género">
              <Option value="male">Masculino</Option>
              <Option value="female">Femenino</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Teléfono"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el teléfono a 10 dígitos",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Número de teléfono a 10 dígitos"
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
              {loading ? "Registrando..." : "Registrar Usuario"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterForm;
