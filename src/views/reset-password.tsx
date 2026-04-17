import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, ConfigProvider, Alert, App } from "antd";
import { resetPasswordWithToken } from "../services/password-reset";

const themeResetPassword = {
  token: { colorPrimary: "#d4238b" },
};

const tieneAlMenosUnNumero = /\d/;

function cumpleReglasContraseña(nueva: string, confirmar: string): boolean {
  if (!nueva || !confirmar) return false;
  if (nueva.length < 8) return false;
  if (!tieneAlMenosUnNumero.test(nueva)) return false;
  return nueva === confirmar;
}

const ResetPasswordContenido = () => {
  const { message: mensaje } = App.useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token")?.trim() ?? "";
  const tokenValido = token.length > 0;

  const [form] = Form.useForm();
  const [enviando, setEnviando] = useState(false);

  const nuevaContraseña = Form.useWatch("nuevaContraseña", form) ?? "";
  const confirmarContraseña = Form.useWatch("confirmarContraseña", form) ?? "";
  const puedeRestablecer = useMemo(
    () =>
      tokenValido &&
      cumpleReglasContraseña(nuevaContraseña, confirmarContraseña),
    [tokenValido, nuevaContraseña, confirmarContraseña],
  );

  return (
    <section
      className="vista-reset-password"
      style={{
        backgroundColor: "#fce4ec",
        minHeight: "100vh",
        minWidth: "100%",
        padding: "48px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: "32px 28px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1
          style={{
            margin: "0 0 24px",
            fontSize: 22,
            fontWeight: 600,
            color: "#1f1f1f",
          }}
        >
          Restablecer contraseña
        </h1>
        {tokenValido ? (
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={async (values) => {
              try {
                setEnviando(true);
                await resetPasswordWithToken({
                  token,
                  password: values.nuevaContraseña,
                });
                mensaje.success("Tu contraseña se actualizó correctamente.");
                navigate("/");
              } catch {
                mensaje.error(
                  "No pudimos restablecer la contraseña. Verifica el enlace o intenta más tarde.",
                );
              } finally {
                setEnviando(false);
              }
            }}
          >
            <Form.Item
              name="nuevaContraseña"
              label="Nueva contraseña"
              rules={[
                { required: true, message: "Ingresa una nueva contraseña" },
                {
                  min: 8,
                  message: "La contraseña debe tener al menos 8 caracteres",
                },
                {
                  pattern: tieneAlMenosUnNumero,
                  message: "La contraseña debe incluir al menos un número",
                },
              ]}
            >
              <Input.Password
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item
              name="confirmarContraseña"
              label="Confirmar contraseña"
              dependencies={["nuevaContraseña"]}
              rules={[
                { required: true, message: "Confirma tu contraseña" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("nuevaContraseña") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Las contraseñas no coinciden"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                disabled={!puedeRestablecer}
                loading={enviando}
              >
                Restablecer contraseña
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Alert
            type="warning"
            showIcon
            title="Enlace no válido"
            description="Para restablecer tu contraseña debes usar el enlace que recibiste por correo. Si el enlace expiró, solicita uno nuevo."
          />
        )}
      </div>
    </section>
  );
};

const ResetPassword = () => (
  <ConfigProvider theme={themeResetPassword}>
    <App>
      <ResetPasswordContenido />
    </App>
  </ConfigProvider>
);

export default ResetPassword;
