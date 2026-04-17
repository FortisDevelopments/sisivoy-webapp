const RESET_PASSWORD_ENDPOINT =
  "https://api.sisivoy.com/api/reset-password";

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export async function resetPasswordWithToken(
  payload: ResetPasswordPayload,
): Promise<void> {
  const response = await fetch(RESET_PASSWORD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: payload.token,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al restablecer la contraseña (${response.status})`);
  }
}
