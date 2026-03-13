export type JobFormData = {
  nombre: string;
  correo: string;
  telefono: string;
  disponibilidad: string;
  situacion: string;
  linkedin?: string;
  area?: string;
};

const JOB_FORM_ENDPOINT = "https://api.sisivoy.com/api/forms/job";

export async function sendJobApplication(
  data: JobFormData,
  pdfFile: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));
  formData.append("pdf", pdfFile);

  const response = await fetch(JOB_FORM_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error al enviar postulación (${response.status})`);
  }
}
