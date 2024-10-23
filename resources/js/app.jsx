import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { store } from './store/store';
import { setGuestId } from './store/guestSlice';

const App = () => {
    const guestId = useSelector((state) => state.guest.guestId);
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    // Get the guest ID on first visit
    useEffect(() => {
        if (!guestId) {
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

    // Fetch products from the server after guestId is retrieved
    useEffect(() => {
        if (guestId) {
            axios.get(`/products/index/${guestId}`)
                .then((response) => {
                    setProducts(response.data.products);
                })
                .catch((error) => {
                    console.error('Error fetching products:', error);
                });
        }
    }, [guestId]);

    // Handle Add to Cart
    const addToCart = (product, quantity) => {
        if (!quantity) return; // Ensure quantity is provided

        // Add product to cart logic (can be handled with API call to add the product)
        setCart([...cart, { ...product, quantity }]);
        alert(`${product.name} added to cart with quantity: ${quantity}`);
    };

    return (
        <div>
            <h1>Hello, {guestId ? `Guest: ${guestId}` : 'Loading...'}</h1>

            <h2>Products:</h2>
            <div>
                {products.length === 0 ? (
                    <p>Loading products...</p>
                ) : (
                    products.map((product, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <p><strong>Name:</strong> {product.name}</p>
                            <p><strong>Price:</strong> ${product.price}</p>
                            <p><strong>In Cart:</strong> {product.in_cart ? 'Yes' : 'No'}</p>
                            <input
                                type="number"
                                min="1"
                                placeholder="Quantity"
                                id={`quantity-${index}`}
                            />
                            <button
                                onClick={() =>
                                    addToCart(product, document.getElementById(`quantity-${index}`).value)
                                }
                                disabled={product.in_cart} // Disable button if product is already in cart
                            >
                                {product.in_cart ? 'Already in Cart' : 'Add to Cart'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <h2>Cart:</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {cart.map((item, index) => (
                        <li key={index}>
                            {item.name} - {item.quantity} x ${item.price}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);
