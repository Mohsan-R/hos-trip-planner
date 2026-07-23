import api from './api';

export const tripApi = {
    createTrip: async (data) => {
        const response = await api.post('trips/', data);
        return response.data;
    }
};
