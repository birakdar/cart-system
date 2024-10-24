import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Swal from 'sweetalert2';
import { store } from './store/store';
import { setGuestId } from './store/guestSlice';

const App = () => {
    const guestId = useSelector((state) => state.guest.guestId);
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({}); // Initialize cart as an object

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

    // Fetch products and cart data after guestId is retrieved
    useEffect(() => {
        if (guestId) {
            // Fetch products
            axios.get(`/products/index/${guestId}`)
                .then((response) => {
                    setProducts(response.data.products);
                })
                .catch((error) => {
                    console.error('Error fetching products:', error);
                });

            // Fetch cart
            axios.get(`/carts/index/${guestId}`)
                .then((response) => {
                    const cartData = response.data.cart || {}; // Safely assign cart data, defaulting to an empty object
                    setCart(cartData); // Set cart as the entire cart object
                })
                .catch((error) => {
                    console.error('Error fetching cart:', error);
                });
        }
    }, [guestId]);

    // Handle Add to Cart
    const addToCart = (product) => {
        const quantityInput = document.getElementById(`quantity-${product.id}`);
        const quantity = quantityInput.value;

        if (!quantity) {
            Swal.fire({
                title: 'Quantity Required',
                text: 'Please enter a quantity before adding to cart.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Confirm adding to cart
        Swal.fire({
            title: 'Add to Cart',
            text: `Are you sure you want to add ${product.name} with quantity ${quantity}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                // Call API to add product to cart
                axios.post('/carts/add', {
                    product_id: product.id,
                    quantity: quantity,
                    guest_id: guestId
                })
                    .then(() => {
                        // Refresh cart after adding the item
                        refreshCart();
                        Swal.fire('Added!', `${product.name} has been added to your cart.`, 'success');
                        quantityInput.value = '';
                    })
                    .catch((error) => {
                        console.error('Error adding to cart:', error);
                        Swal.fire('Error!', 'There was an error adding the product to your cart.', 'error');
                    });
            }
        });
    };

    // Handle Remove from Cart
    const removeFromCart = (product) => {
        Swal.fire({
            title: 'Remove from Cart',
            text: `Are you sure you want to remove ${product.name} from your cart?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                // Call API to remove product from cart
                axios.post('/carts/remove', {
                    product_id: product.id,
                    guest_id: guestId
                })
                    .then(() => {
                        // Refresh cart after removing the item
                        refreshCart();
                        Swal.fire('Removed!', `${product.name} has been removed from your cart.`, 'success');
                    })
                    .catch((error) => {
                        console.error('Error removing from cart:', error);
                        Swal.fire('Error!', 'There was an error removing the product from your cart.', 'error');
                    });
            }
        });
    };

    // Refresh cart data
    const refreshCart = () => {
        if (guestId) {
            axios.get(`/carts/index/${guestId}`)
                .then((response) => {
                    const cartData = response.data.cart || {};
                    setCart(cartData); // Set cart as the entire cart object
                })
                .catch((error) => {
                    console.error('Error refreshing cart:', error);
                });
        }
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
                            products.map((product) => (
                                <div key={product.id} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <p className="text-lg font-bold text-gray-900 mb-2">{product.name}</p>
                                    <p className="text-gray-700 mb-2">Price: ${product.price}</p>
                                    <p className={`mb-2 ${product.in_cart ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.in_cart ? 'Already in Cart' : 'Not in Cart'}
                                    </p>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Quantity"
                                        id={`quantity-${product.id}`}
                                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                    <button
                                        onClick={() => addToCart(product)}
                                        className={`w-full p-3 rounded-lg font-semibold text-white transition bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    >
                                        {'Add to Cart'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Section: Cart */}
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Cart</h2>
                    {cart.products && cart.products.length === 0 ? (
                        <p className="text-gray-500">Your cart is empty.</p>
                    ) : (
                        <>
                            <ul className="space-y-4">
                                {cart.products && cart.products.map((item, index) => (
                                    <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                                        {item.name} - {item.pivot.quantity} x ${item.price}
                                        <button
                                            onClick={() => removeFromCart(item)}
                                            className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4">
                                <p className="font-semibold text-lg">Total Items: {cart.total_items || 0}</p>
                                <p className="font-semibold text-lg">Total Price: ${cart.total_price || 0}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
    <Provider store={store}>
        <App/>
    </Provider>
);
