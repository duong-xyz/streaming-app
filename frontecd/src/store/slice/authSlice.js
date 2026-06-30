import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem("token");
const user = localStorage.getItem("user") ? JSON.parse(
    localStorage.getItem("user")) : null;

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: user,
        token: token,
        isAuthenticated: !!token,
        isAdmin: user?.role?.includes("ADMIN") || false
    },
    reducers: {
        loginSuccess: (state, action) => {
            const { token, user } = action.payload;
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
            state.isAdmin = user.role?.includes("ADMIN") || false;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;