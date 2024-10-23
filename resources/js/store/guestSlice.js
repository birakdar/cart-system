import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    guestId: localStorage.getItem('guest_id') || null,
};

const guestSlice = createSlice({
    name: 'guest',
    initialState,
    reducers: {
        setGuestId: (state, action) => {
            state.guestId = action.payload;
            localStorage.setItem('guest_id', action.payload); // Save to local storage
        },
    },
});

export const { setGuestId } = guestSlice.actions;

export default guestSlice.reducer;
