import api from './api';

/**
 * Obtiene la configuración de todos los banners de la página principal
 * @returns {Promise} Promesa con los datos de los banners
 */
export const getBanners = async () => {
    try {
        const response = await api.get('posts');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los banners:', error);
        throw error;
    }
};

/**
 * Transforma los datos del banner principal (Carousel hero) al formato esperado por el componente
 * @param {Object} bannerData - Datos del banner desde la API
 * @returns {Array} Array de slides formateados
 */
export const transformHeroSlides = (bannerData) => {
    if (!bannerData || !bannerData.imagenes) return [];
    
    return bannerData.imagenes.map((item, index) => ({
        id: index + 1,
        image: item.imagen,
        title: bannerData.titulo,
        subtitle: bannerData.subtitulo,
        buttonText: bannerData.boton?.texto,
        buttonLink: bannerData.boton?.direccion,
    }));
};

/**
 * Transforma los datos del banner "Sobre Nosotros" (BannerImage) al formato esperado
 * @param {Object} banner2Data - Datos del banner2 desde la API
 * @returns {Array} Array de slides formateados
 */
export const transformAboutSlides = (banner2Data) => {
    if (!banner2Data || !banner2Data.imagenes) return [];
    
    return banner2Data.imagenes.map((item, index) => ({
        id: index + 1,
        image: item.imagen,
        title: item.titulo,
        subtitle: item.subtitulo,
        text: item.descripcion,
        buttonText: item.boton?.texto,
        buttonLink: item.boton?.direccion,
    }));
};

/**
 * Transforma los datos del banner de proyectos (Carousel proyectos) al formato esperado
 * @param {Object} banner3Data - Datos del banner3 desde la API
 * @returns {Array} Array de slides formateados
 */
export const transformProjectsSlides = (banner3Data) => {
    if (!banner3Data || !banner3Data.imagenes) return [];
    
    return banner3Data.imagenes.map((item, index) => ({
        id: index + 1,
        image: item.imagen,
        title: item.titulo,
        subtitle: item.subtitulo,
        buttonText: item.boton?.texto,
        buttonLink: item.boton?.direccion,
    }));
};
