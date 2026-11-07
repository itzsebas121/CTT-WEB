import api from './api';

/**
 * Obtener un congreso por ID con todas sus relaciones (sesiones, speakers, sponsors)
 * @param {number|string} congressId
 */
export const getCongressById = async (congressId) => {
  try {
    const id = parseInt(congressId, 10);
    if (!id || isNaN(id) || id <= 0) {
      throw new Error('Identificador de congreso inválido o no especificado.');
    }
    const response = await api.get(`/congresses-new/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Error del servidor: ${error.response.status} - ${
          error.response.data?.detail || 'Error al obtener congreso'
        }`
      );
    }
    throw new Error(error.message || 'Error de red al conectar con el servidor');
  }
};

