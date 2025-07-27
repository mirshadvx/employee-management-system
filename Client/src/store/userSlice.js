import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setIsUser: (state) => {
            state.role.user = true;
        },
        setNotUser: (state) => {
            state.role.user = false;
        },
        logoutReducer: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
        },
    },
});

export const { setAuthenticated, setIsUser, setUser, setNotUser, logoutReducer } = userSlice.actions;

export default userSlice.reducer;
