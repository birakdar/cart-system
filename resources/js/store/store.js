import { configureStore } from '@reduxjs/toolkit';
import guestReducer from './guestSlice';

export const store = configureStore({
    reducer: {
        guest: guestReducer,
    },
});
