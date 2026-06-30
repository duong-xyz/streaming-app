import apiClient from './apiClient'

const authService = {
    login: async (loginData) => {
        // loginData gồm: { username, password }
        return apiClient.post('/users/login', loginData);
    },
    register: async (registerData) => {
        // registerData gồm: { username, password, email, role }
        return apiClient.post("/users/register", registerData);
    }
}

export default authService;