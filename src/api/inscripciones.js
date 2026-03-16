import api from "./api";
const API_URL = import.meta.env.VITE_API_URL;

export const enrollInCourse = async (userId, courseId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No se encontró token de autenticación');
  }

  try {
    const response = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_user_platform: userId,
        id_course: courseId,
        status: 'Interesado',
        payment_order_url: 'local'
      })
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      const errorData = await response.json();
      // Simplificar el mensaje de error para el usuario
      if (errorData.detail && errorData.detail.includes('already enrolled')) {
        throw new Error('Ya estás inscrito en este curso');
      }
      throw new Error(errorData.detail || 'Error al inscribirse en el curso');
    }

    return await response.json();
  } catch (error) {
    // Manejar errores de red (sin conexión)
    if (error.message === 'UNAUTHORIZED') {
      throw error;
    }
    if (error.message.includes('Ya estás inscrito')) {
      throw error;
    }
    if (error instanceof TypeError || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('No hay conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.');
    }
    throw error;
  }
};

export const getUserEnrollments = async (userId, enrollmentStatus = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No se encontró token de autenticación');
  }

  try {
    // Construir URL con query params si hay filtro de estado
    let url = `${API_URL}/enrollments/user/${userId}`;
    if (enrollmentStatus) {
      url += `?enrollment_status=${encodeURIComponent(enrollmentStatus)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al obtener los cursos inscritos');
    }

    return await response.json();
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      throw error;
    }
    if (error instanceof TypeError || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('No hay conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.');
    }
    throw error;
  }
};
/**
 * Sube una imagen (multipart/form-data) y retorna la URL
 * @param {File} file
 */

export const uploadDocumentForEnrollment = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/pdf/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('Archivo subido exitosamente:', response.data);
        return response.data;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Tiempo de espera agotado. Verifica tu conexión a internet.');
        }
        if (error.response) {
            throw new Error(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
        }
        throw new Error(`Error de red: ${error.message}`);
    }
};
