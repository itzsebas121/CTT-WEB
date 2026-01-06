import api from './api';

export const getCourses = async (page = 1, pageSize = 10, status = null, category = null, token = null) => {
    try {
        const params = {
            page,
            page_size: pageSize
        };
        
        // Solo agregar status si se proporciona (debe ser 'activo' o 'inactivo')
        if (status) {
            params.status = status.toLowerCase();
        }
        
        // Solo agregar category si se proporciona
        if (category) {
            params.category = category;
        }
        let response;
        if (token) {
            response = await api.get('/courses/available', { params, headers: { 'Authorization': `Bearer ${token}` } });
        }
        else {
            response = await api.get('/courses', { params });      
        }
        const data = response.data;
        if (!data.courses) {
            throw new Error('No se encontraron cursos en la respuesta de la API');
        }
        return data;
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


export const getCoursesByCategory = async (category, page = 1, pageSize = 10, status = null) => {
    try {
        const params = {
            page,
            page_size: pageSize
        };
        
        // Solo agregar status si se proporciona (debe ser 'activo' o 'inactivo')
        if (status) {
            params.status = status.toLowerCase();
        }
        
        const response = await api.get(`/courses/category/${encodeURIComponent(category)}`, { params });
        const data = response.data;

        if (!data.courses) {
            throw new Error('No se encontraron cursos en la respuesta de la API');
        }

        return data;
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

export const getCourseById = async (courseId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/courses/${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
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

/**
 * Obtiene cursos filtrados por rango de horas
 * @param {number} minHours - Horas mínimas
 * @param {number} maxHours - Horas máximas
 * @returns {Promise<Course[]>} Lista de cursos filtrados por horas
 * @throws {Error} Si ocurre un error en la petición
 */
export const getCoursesByHoursRange = async (minHours, maxHours) => {
    try {
        const response = await api.get(`/courses/hours-range/?min_hours=${minHours}&max_hours=${maxHours}`);
        const data = response.data;

        if (!data.courses) {
            throw new Error('No se encontraron cursos en la respuesta de la API');
        }

        return data.courses;
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

/**
 * Crea un nuevo curso
 * @param {Object} courseData - Datos del curso a crear
 * @returns {Promise<Object>} Curso creado
 * @throws {Error} Si ocurre un error en la petición
 */
export const createCourse = async (courseData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post('/courses', courseData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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

/**
 * Actualiza un curso existente
 * @param {string} courseId - ID del curso a actualizar
 * @param {Object} courseData - Datos del curso a actualizar
 * @returns {Promise<Object>} Curso actualizado
 * @throws {Error} Si ocurre un error en la petición
 */
export const updateCourse = async (courseId, courseData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.patch(`/courses/${courseId}`, courseData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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

/**
 * Sube una imagen (multipart/form-data) y retorna la URL
 * @param {File} file
 * @returns {Promise<{url?: string, image_url?: string, path?: string}>}
 */
export const uploadImage = async (file) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/images/upload', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
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

/**
 * Elimina una imagen existente enviando image_url en el body
 * @param {string} imageUrl
 * @returns {Promise<Object>}
 */
export const deleteImage = async (imageUrl) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.delete(`/images/delete?image_url=${imageUrl}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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

/**
 * Busca cursos por título
 * @param {string} query - Término de búsqueda
 * @param {number} page - Número de página
 * @param {number} pageSize - Tamaño de página
 * @param {string|null} status - Estado del curso (opcional)
 * @returns {Promise<Object>} Resultados de la búsqueda
 * @throws {Error} Si ocurre un error en la petición
 */
export const searchCourses = async (query, page = 1, pageSize = 10, status = null) => {
    try {
        const params = {
            query,
            page,
            page_size: pageSize
        };
        
        // Solo agregar status si se proporciona (debe ser 'activo' o 'inactivo')
        if (status) {
            params.status = status.toLowerCase();
        }
        
        const response = await api.get('/courses/search', { params });
        const data = response.data;

        if (!data.courses) {
            throw new Error('No se encontraron cursos en la respuesta de la API');
        }
        return data;
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