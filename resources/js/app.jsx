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
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                {guestId ? `Welcome, Guest: ${guestId}` : 'Loading...'}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Section: Products */}
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Available Products</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                        {products.length === 0 ? (
                            <p className="text-gray-500">Loading products...</p>
                        ) : (
                            products.map((product, index) => (
                                <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <p className="text-lg font-bold text-gray-900 mb-2">{product.name}</p>
                                    <p className="text-gray-700 mb-2">Price: ${product.price}</p>
                                    <p className={`mb-2 ${product.in_cart ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.in_cart ? 'Already in Cart' : 'Not in Cart'}
                                    </p>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Quantity"
                                        id={`quantity-${index}`}
                                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                    <button
                                        onClick={() => addToCart(product, document.getElementById(`quantity-${index}`).value)}
                                        disabled={product.in_cart}
                                        className={`w-full p-3 rounded-lg font-semibold text-white transition ${
                                            product.in_cart
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        }`}
                                    >
                                        {product.in_cart ? 'Already in Cart' : 'Add to Cart'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Section: Cart */}
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Cart</h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-500">Your cart is empty.</p>
                    ) : (
                        <ul className="space-y-4">
                            {cart.map((item, index) => (
                                <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                                    {item.name} - {item.quantity} x ${item.price}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);
