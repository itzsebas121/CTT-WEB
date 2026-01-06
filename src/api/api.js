import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Note: Course-related functions have been moved to courses.js
// Use import { getCourses, getCoursesByCategory, etc. } from './courses'

export default api;
