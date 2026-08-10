import axios from 'axios';

const apiCountries_URL = 'https://api.restcountries.com';

const apiCountries = axios.create({
    baseURL: apiCountries_URL,
    timeout: 8000,
    headers: {
        Authorization: 'Bearer rc_live_demo'
    }
});

const fallbackCountries = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
    'Cuba', 'Ecuador', 'El Salvador', 'España', 'Estados Unidos', 'Guatemala',
    'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú',
    'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela'
];

export const getCountriesList = async () => {
    try {
        const response = await apiCountries.get('/countries/v5/all');

        if (!Array.isArray(response.data)) {
            throw new Error('Respuesta inesperada de la API de países');
        }

        const countries = response.data
            .map(country => country?.name?.common || country?.name?.official)
            .filter(Boolean);

        const uniqueCountries = [...new Set(countries)];
        return uniqueCountries.sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error('Error fetching countries:', error);
        return fallbackCountries;
    }
};

export default apiCountries;