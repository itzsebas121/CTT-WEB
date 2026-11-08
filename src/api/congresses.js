import api from './api';

/**
 * Listar congresos con paginación, filtros de año y término de búsqueda
 */
export const getCongresses = async ({
  page = 1,
  pageSize = 10,
  year = null,
  searchTerm = null,
  orderBy = 'fecha_inicio',
  orderDesc = true,
} = {}) => {
  try {
    const params = {
      page,
      page_size: pageSize,
      order_by: orderBy,
      order_desc: orderDesc,
    };

    if (year !== null && year !== undefined && year !== '' && year !== 'Todos') {
      params.year = parseInt(year, 10);
    }
    if (searchTerm && searchTerm.trim().length > 0) {
      params.search_term = searchTerm.trim();
    }

    const response = await api.get('/congresses-new', { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Error del servidor: ${error.response.status} - ${
          error.response.data?.detail || 'Error al obtener congresos'
        }`
      );
    }
    throw new Error(error.message || 'Error de red al conectar con el servidor');
  }
};

/**
 * Obtener los años con congresos registrados
 */
export const getCongressYears = async () => {
  try {
    const response = await api.get('/congresses-new/years');
    return response.data?.data?.years || response.data?.years || [];
  } catch (error) {
    return [];
  }
};

/**
 * Buscar congresos por término y año
 */
export const searchCongresses = async (query, year = null, limit = 20) => {
  try {
    const params = {
      query: query.trim(),
      limit,
    };
    if (year !== null && year !== undefined && year !== '' && year !== 'Todos') {
      params.year = parseInt(year, 10);
    }

    const response = await api.get('/congresses-new/search', { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Error del servidor: ${error.response.status} - ${
          error.response.data?.detail || 'Error al buscar congresos'
        }`
      );
    }
    throw new Error(error.message || 'Error de red al conectar con el servidor');
  }
};

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
