import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: localStorage.getItem("emailId") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
      if (action.payload) {
        localStorage.setItem("emailId", action.payload);
      } else {
        localStorage.removeItem("emailId");
      }
    },
    clearEmail: (state) => {
      state.email = null;
      localStorage.removeItem("emailId");
    },
  },
});

export const { setEmail, clearEmail } = authSlice.actions;
export default authSlice.reducer;
