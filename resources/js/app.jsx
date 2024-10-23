import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { store } from './store/store';
import { setGuestId } from './store/guestSlice';

const App = () => {
    const guestId = useSelector((state) => state.guest.guestId);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!guestId) {
            // If guest_id is not in local storage, make an API call
            axios.get('/carts/first')
                .then((response) => {
                    const { guest_id } = response.data;
                    dispatch(setGuestId(guest_id)); // Save guest_id to Redux and local storage
                })
                .catch((error) => {
                    console.error('Error fetching guest_id:', error);
                });
        }
    }, [guestId, dispatch]);

    return (
        <div>
            <h1>Hello, {guestId ? `Guest: ${guestId}` : 'Loading...'}</h1>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);
