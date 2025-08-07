'use client'
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import axios from 'axios';

const ProductOrderForm = () => {
    const [selectedProducts, setSelectedProducts] = useState({});
    const [zoomedImage, setZoomedImage] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const products = [
        {
            id: 1,
            name: "Горнище от комплект Gold",
            color: "Бял",
            price: 60.00,
            image: "/gornishte.png",
            sizes: ['116-122', '128-134', '140-146', '152-158', '164-170', 'XS', 'S','M']
        },
        {
            id: 2,
            name: "Долнище от комплект Gold",
            color: "Бял",
            price: 60.00,
            image: "/dolnishte.png",
            sizes: ['116-122', '128-134', '140-146', '152-158', '164-170', 'XS', 'S','M']
        }
    ]

    const handleProductSelect = (productId, isSelected) => {
        if (isSelected) {
            setSelectedProducts(prev => ({
                ...prev,
                [productId]: {
                    size: 'S',
                    quantity: 1,
                    selected: true
                }
            }));
        } else {
            setSelectedProducts(prev => {
                const updated = { ...prev };
                delete updated[productId];
                return updated;
            });
        }
    };

    const updateProductOptions = (productId, field, value) => {
        setSelectedProducts(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    const calculateTotal = () => {
        return Object.entries(selectedProducts).reduce((total, [productId, options]) => {
            const product = products.find(p => p.id === parseInt(productId));
            return total + (product.price * options.quantity);
        }, 0);
    };

    const handleSubmit = async () => {
        if (!customerName.trim()) {
            alert('Моля въведете името си');
            return;
        }

        setIsSubmitting(true);

        const orderData = {
            customerName,
            additionalInfo,
            products: Object.entries(selectedProducts).map(([productId, options]) => {
                const product = products.find(p => p.id === parseInt(productId));
                return {
                    id: product.id,
                    name: product.name,
                    color: product.color,
                    price: product.price,
                    size: options.size,
                    quantity: options.quantity
                };
            }),
            total: calculateTotal(),
            orderDate: new Date().toISOString(),
            status: 'pending'
        };

        try {
            // First, let's test the webhook URL
            console.log('Sending order data:', orderData);

            // Let's try different URL formats to see which one works
            const baseUrl = 'https://n8n.bumpbots.com';
            const webhookId = '62e33cf2-b187-44c6-baee-5b4f3c821c48';


            const urlsToTry = [
                `${baseUrl}/webhook-test/${webhookId}`,
                `${baseUrl}/webhook/${webhookId}`,
                `${baseUrl}/api/webhook/${webhookId}`,
                `${baseUrl}/webhook-test/${webhookId}/`,
                `${baseUrl}/webhook/${webhookId}/`
            ];

            console.log('Trying webhook URLs:', urlsToTry);

            // Try the original URL first
            let response;
            let successUrl;

            for (const url of urlsToTry) {
                try {
                    console.log(`Trying URL: ${url}`);
                    response = await axios.post(url, orderData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        timeout: 10000,
                        withCredentials: false
                    });

                    if (response.status === 200) {
                        successUrl = url;
                        console.log(`Success with URL: ${url}`);
                        break;
                    }
                } catch (urlError) {
                    console.log(`Failed with URL ${url}:`, urlError.response?.status || urlError.message);
                    continue;
                }
            }

            if (!response || response.status !== 200) {
                throw new Error('Всички webhook URL-та не работят');
            }

            console.log('Successful response:', response.data);
            console.log('Working URL was:', successUrl);
            alert(`Поръчката е направена успешно! ${response.data?.message || ''}\nURL: ${successUrl}`);

            // Reset form
            setSelectedProducts({});
            setCustomerName('');
            setAdditionalInfo('');

        } catch (error) {
            console.error('Full error object:', error);
            console.error('Error response:', error.response);

            let errorMessage = 'Възникна грешка при изпращането на поръчката.';

            if (error.message === 'Всички webhook URL-та не работят') {
                errorMessage = 'Webhook-ът не е достъпен. Моля проверете дали n8n workflow-ът е активен и дали URL-то е правилно.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Webhook URL не е намерен (404). Моля проверете n8n настройките.';
            } else if (error.response?.status === 405) {
                errorMessage = 'Неправилен HTTP метод (405). Webhook-ът може да очаква GET вместо POST заявка.';
            }

            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-8xl mx-auto p-6 bg-slate-50 min-h-screen">
            {/* Logo */}
            <div className="flex justify-center mb-8">
                <img
                    src="/khealth-logo.webp"
                    alt="KHealth Logo"
                    className="h-20 md:h-24 lg:h-28 w-auto object-contain"
                />
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">Продукти</h1>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300">
                        {/* Product Image with Zoom */}
                        <div className="relative bg-slate-100 aspect-square">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setZoomedImage(product)}
                                className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-yellow-400 hover:shadow-xl transition-all duration-200 group"
                            >
                                <Search className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                            <h3 className="font-bold text-slate-800 mb-2 text-lg">{product.name}</h3>
                            <p className="text-sm text-slate-600 mb-2 font-medium">{product.color}</p>
                            {/*<p className="text-xl font-bold text-slate-800 mb-4">${product.price.toFixed(2)}</p>*/}

                            {/* Selection Checkbox */}
                            <div className="flex items-center mb-4 p-3 bg-slate-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id={`select-${product.id}`}
                                    checked={selectedProducts[product.id]?.selected || false}
                                    onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                                    className="w-5 h-5 text-black-400 bg-white border-2 border-slate-300 rounded focus:ring-yellow-400 focus:ring-2"
                                />
                                <label htmlFor={`select-${product.id}`} className="ml-3 text-sm text-slate-700 font-medium">
                                    Изберете този продукт
                                </label>
                            </div>

                            {/* Size and Quantity Dropdowns */}
                            {selectedProducts[product.id]?.selected && (
                                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-2">Размер</label>
                                        <select
                                            value={selectedProducts[product.id]?.size || 'S'}
                                            onChange={(e) => updateProductOptions(product.id, 'size', e.target.value)}
                                            className="w-full border-2 border-slate-400 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 shadow-sm"
                                        >
                                            {product.sizes.map(size => (
                                                <option key={size} value={size} className="text-slate-800 font-medium">{size}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-2">Брой</label>
                                        <select
                                            value={selectedProducts[product.id]?.quantity || 1}
                                            onChange={(e) => updateProductOptions(product.id, 'quantity', parseInt(e.target.value))}
                                            className="w-full border-2 border-slate-400 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 shadow-sm"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num} className="text-slate-800 font-medium">{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Form */}
            {Object.keys(selectedProducts).length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
                    <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b-4 border-yellow-400 pb-4">Обобщение на поръчката</h2>

                    {/* Selected Products Summary */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-700 mb-4">Избрани продукти:</h3>
                        <div className="space-y-3">
                            {Object.entries(selectedProducts).map(([productId, options]) => {
                                const product = products.find(p => p.id === parseInt(productId));
                                return (
                                    <div key={productId} className="flex justify-between items-center py-3 px-4 border-b border-slate-200 bg-slate-50 rounded-lg">
                                        <span className="text-sm font-medium text-slate-700">
                                            {product.name} ({product.color}) - Избран размер: {options.size} - Брой: {options.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleProductSelect(parseInt(productId), false)}
                                            className="ml-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all duration-200"
                                            title="Премахни продукт"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                            <div className="flex justify-between items-center pt-4 text-xl font-bold bg-yellow-100 p-4 rounded-lg border-2 border-yellow-400">
                                <span className="text-slate-800">Общо:</span>
                                {/*<span className="text-slate-800">{calculateTotal().toFixed(2)}лв</span>*/}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-bold text-slate-700 mb-3">
                                Име на клиента *
                            </label>
                            <input
                                type="text"
                                id="customerName"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-slate-800 font-medium"
                                placeholder="Моля въведете името си тук"
                            />
                        </div>

                        <div>
                            <label htmlFor="additionalInfo" className="block text-sm font-bold text-slate-700 mb-3">
                                Допълнителна информация
                            </label>
                            <textarea
                                id="additionalInfo"
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                                rows={4}
                                className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-slate-800 font-medium resize-none"
                                placeholder="Ръкавите да са с 1 см по-дълги..."
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-yellow-400 text-slate-800 py-4 px-6 rounded-lg font-bold text-lg hover:bg-yellow-500 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800 mr-3"></div>
                                    Обработване на поръчката...
                                </>
                            ) : (
                                'Поръчай'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    onClick={() => setZoomedImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setZoomedImage(null)}
                            className="absolute -top-14 right-0 text-white hover:text-yellow-400 transition-colors bg-slate-800 bg-opacity-70 rounded-full p-3 hover:bg-opacity-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={zoomedImage.image}
                            alt={zoomedImage.name}
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-4 border-white"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-slate-800 bg-opacity-90 text-white p-6 rounded-b-xl">
                            <h3 className="font-bold text-xl text-yellow-400">{zoomedImage.name}</h3>
                            <p className="text-sm text-slate-300 mt-1">{zoomedImage.color}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductOrderForm;