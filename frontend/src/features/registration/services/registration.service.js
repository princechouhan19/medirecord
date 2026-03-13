import api from "../../../hooks/useApi";

export const registrationService = {
  getPatients: (search = "") => api.get(`/patients?search=${search}`),
  registerPatient: (formData) =>
    api.post("/patients", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePatient: (id) => api.delete(`/patients/${id}`),
  getPatient: (id) => api.get(`/patients/${id}`),
};
