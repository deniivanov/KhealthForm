'use client'
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import axios from 'axios';

const ProductOrderFormNoName = () => {
    const [cartItems, setCartItems] = useState([]); // [{productId, name, color, price, size, quantity}]
    const [tempSelections, setTempSelections] = useState({}); // per-product UI selection: { [id]: { size, quantity } }
    const [zoomedImage, setZoomedImage] = useState(null);

    const [customerName, setCustomerName] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [countdown, setCountdown] = useState(15);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Simple toast
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        let timer;
        if (orderSuccess) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        window.location.reload();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [orderSuccess]);

    // ====== Catalog (7 items) ======
    const products = [
        { id: 1, name: "Тениска Биляна Сублимация", color: "Черен", price: 60.00, image: "https://ik.imagekit.io/brandbeam/bilyana-1.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 2, name: "Тениска Биляна Сублимация", color: "Розов", price: 35.00, image: "https://ik.imagekit.io/brandbeam/bilyana-3.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 3, name: 'Горнище Биляна Сублимация', color: "Бял", price: 60.00, image: "https://ik.imagekit.io/brandbeam/bilyana-2.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 4, name: "Тениска Сублимация Gradient", color: "Розово/Черно", price: 75.00, image: "https://ik.imagekit.io/brandbeam/bilyana-4.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 5, name: "Клин KHealth дълъг", color: "Черен", price: 49.00, image: "https://ik.imagekit.io/brandbeam/bilyana-5.jpg",
            sizes: ['128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 6, name: "Блуза", color: "Черен", price: 39.00, image: "https://ik.imagekit.io/brandbeam/bilyana-11.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M', 'L'] },
        { id: 7, name: "Клин KHealth къс", color: "Черно", price: 89.00, image: "https://ik.imagekit.io/brandbeam/bilyana-8.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 8, name: "Тениска Биляна Памук", color: "Цикламено", price: 89.00, image: "https://ik.imagekit.io/brandbeam/bilyana-7.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 9, name: "Суичър Кхеалтх", color: "Розов", price: 89.00, image: "https://ik.imagekit.io/brandbeam/bilyana-12.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M', 'L'] },
        { id: 10, name: "Долнище Khealth", color: "Черно", price: 89.00, image: "https://ik.imagekit.io/brandbeam/bilyana-9.jpg",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] }
    ];


    const ensureTempSelection = (product) => {
        setTempSelections(prev => {
            if (prev[product.id]) return prev;
            return {
                ...prev,
                [product.id]: {
                    size: product.sizes?.[0] || 'S',
                    quantity: 1
                }
            };
        });
    };

    const setSelectionField = (productId, field, value) => {
        setTempSelections(prev => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                [field]: value
            }
        }));
    };

    const addToCart = (product) => {
        const sel = tempSelections[product.id] || { size: product.sizes?.[0] || 'S', quantity: 1 };
        const qty = Math.max(1, parseInt(sel.quantity, 10) || 1);

        setCartItems(prev => {
            // Merge with existing line if same product & size
            const idx = prev.findIndex(li => li.productId === product.id && li.size === sel.size);
            if (idx > -1) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
                return updated;
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    color: product.color,
                    price: product.price,
                    size: sel.size,
                    quantity: qty
                }
            ];
        });

        // feedback toast
        setToast({ show: true, message: `${product.name} • ${sel.size} × ${qty} добавено в поръчката` });
        setTimeout(() => setToast({ show: false, message: '' }), 1800);
    };

    const removeCartItem = (index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = () =>
        cartItems.reduce((sum, li) => sum + li.price * li.quantity, 0);

    const handleInitialSubmit = () => {
        if (!customerName.trim()) {
            alert('Моля въведете името си');
            return;
        }
        if (cartItems.length === 0) {
            alert('Моля добавете поне един продукт в поръчката.');
            return;
        }
        setShowConfirmation(true);
    };

    const handleConfirmedSubmit = async () => {
        setIsSubmitting(true);

        const orderData = {
            customerName,
            additionalInfo,
            products: cartItems.map(li => ({
                id: li.productId,
                name: li.name,
                color: li.color,
                price: li.price,
                size: li.size,
                quantity: li.quantity
            })),
            total: calculateTotal(),
            orderDate: new Date().toISOString(),
            status: 'pending'
        };

        try {
            const baseUrl = 'https://n8n.bumpbots.com';
            const webhookId = '62e33cf2-b187-44c6-baee-5b4f3c821c48';
            const urlsToTry = [
                `${baseUrl}/webhook-test/${webhookId}`,
                `${baseUrl}/webhook/${webhookId}`,
                `${baseUrl}/api/webhook/${webhookId}`,
                `${baseUrl}/webhook-test/${webhookId}/`,
                `${baseUrl}/webhook/${webhookId}/`
            ];

            let response;
            for (const url of urlsToTry) {
                try {
                    response = await axios.post(url, orderData, {
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        timeout: 10000,
                        withCredentials: false
                    });
                    if (response.status === 200) break;
                } catch {}
            }
            if (!response || response.status !== 200) throw new Error('Всички webhook URL-та не работят');

            setOrderSuccess({
                orderId: response.data?.orderId || Math.floor(Math.random() * 100000),
                customerName,
                productCount: cartItems.length,
                estimatedDelivery: response.data?.estimatedDelivery || '2-5 работни дни'
            });

            setCartItems([]);
            setCustomerName('');
            setAdditionalInfo('');
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error submitting order:', error);
            let errorMessage = 'Възникна грешка при изпращането на поръчката.';
            if (error.message === 'Всички webhook URL-та не работят') {
                errorMessage = 'Webhook-ът не е достъпен. Моля проверете дали n8n workflow-ът е активен и дали URL-то е правилно.';
            }
            alert(errorMessage);
            setShowConfirmation(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    // ===== Success view =====
    if (orderSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-900 p-6">
                <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-10 border border-green-200">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-green-500 p-4 rounded-full">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-4">Поръчката е потвърдена!</h2>
                    <p className="text-center text-green-700 mb-2">Благодарим ви, <strong>{orderSuccess.customerName}</strong>!</p>
                    <div className="text-center space-y-2">
                        <p>Номер на поръчка: <span className="font-mono bg-green-100 px-2 py-1 rounded">{orderSuccess.orderId}</span></p>
                        <p>{orderSuccess.productCount} продукт{orderSuccess.productCount !== 1 ? 'а' : ''}</p>
                        <p className="text-sm text-green-500 mt-4">Страницата ще се презареди автоматично след {countdown} секунди...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ===== Main view =====
    return (
        <div className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen">
            {/* Logo */}
            <div className="flex justify-center mb-8">
                <img src="/khealth-logo.webp" alt="KHealth Logo" className="h-20 md:h-24 lg:h-28 w-auto object-contain" />
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">Продукти</h1>

            {/* Layout: grid + summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Product Grid */}
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((product, idx) => {
                            const isLastAlone = products.length % 3 === 1 && idx === products.length - 1;
                            const centering = isLastAlone ? 'md:col-start-2' : '';
                            const sel = tempSelections[product.id] || { size: product.sizes?.[0] || 'S', quantity: 1 };

                            return (
                                <div key={product.id}
                                     className={`bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 ${centering}`}
                                     onMouseEnter={() => ensureTempSelection(product)}
                                >
                                    {/* Image with Zoom */}
                                    <div className="relative bg-slate-100 aspect-square">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setZoomedImage(product)}
                                            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-yellow-400 hover:shadow-xl transition-all duration-200 group"
                                        >
                                            <Search className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                                        </button>
                                    </div>

                                    {/* Info + controls */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-800 mb-2 text-lg">{product.name}</h3>
                                        <p className="text-sm text-slate-600 mb-4 font-medium">{product.color}</p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-800 mb-2">Размер</label>
                                                <select
                                                    value={sel.size}
                                                    onChange={(e) => setSelectionField(product.id, 'size', e.target.value)}
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
                                                    value={sel.quantity}
                                                    onChange={(e) => setSelectionField(product.id, 'quantity', parseInt(e.target.value, 10))}
                                                    className="w-full border-2 border-slate-400 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 shadow-sm"
                                                >
                                                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                                </select>
                                            </div>

                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full py-3 rounded-lg font-bold text-base bg-yellow-400 text-slate-800 hover:bg-yellow-500 hover:shadow-lg transition-all duration-200 focus:ring-4 focus:ring-yellow-300"
                                            >
                                                Добави към поръчката
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-4">
                    {cartItems.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200 lg:sticky lg:top-6">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-4 border-yellow-400 pb-3">
                                Обобщение на поръчката
                            </h2>

                            <div className="space-y-3 mb-8">
                                {cartItems.map((li, idx) => (
                                    <div key={`${li.productId}-${li.size}-${idx}`} className="flex justify-between items-center py-3 px-4 border-b border-slate-200 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                      {li.name} ({li.color}) — {li.size} × {li.quantity}
                    </span>
                                        <button
                                            onClick={() => removeCartItem(idx)}
                                            className="ml-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all duration-200"
                                            title="Премахни"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Customer info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Име на клиента *</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-slate-800 font-medium"
                                        placeholder="Моля въведете името си тук"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Допълнителна информация</label>
                                    <textarea
                                        value={additionalInfo}
                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                        rows={4}
                                        className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-slate-800 font-medium resize-none"
                                        placeholder="Ръкавите да са с 1 см по-дълги..."
                                    />
                                </div>

                                <button
                                    onClick={handleInitialSubmit}
                                    disabled={isSubmitting || orderSuccess}
                                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 focus:outline-none shadow-md flex items-center justify-center ${
                                        orderSuccess
                                            ? 'bg-green-500 text-white cursor-default'
                                            : isSubmitting
                                                ? 'bg-yellow-400 text-slate-800 opacity-70 cursor-not-allowed'
                                                : 'bg-yellow-400 text-slate-800 hover:bg-yellow-500 hover:shadow-lg transform hover:-translate-y-1 focus:ring-4 focus:ring-yellow-300'
                                    }`}
                                >
                                    {orderSuccess ? (
                                        <>
                                            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Поръчката е успешна! ({countdown}s)
                                        </>
                                    ) : isSubmitting ? (
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
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center border-b-4 border-yellow-400 pb-4">
                                Потвърждение на поръчката
                            </h2>

                            {/* Customer Information */}
                            <div className="mb-6 bg-slate-50 p-6 rounded-lg border-2 border-slate-200">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Информация за клиента</h3>
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="font-semibold text-slate-700 w-48">Име:</span>
                                        <span className="text-slate-800">{customerName}</span>
                                    </div>
                                    {additionalInfo && (
                                        <div className="flex">
                                            <span className="font-semibold text-slate-700 w-48">Допълнителна информация:</span>
                                            <span className="text-slate-800">{additionalInfo}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Products Table */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Продукти</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                        <tr className="bg-yellow-400">
                                            <th className="border-2 border-slate-300 px-4 py-3 text-left font-bold text-slate-800">Продукт</th>
                                            <th className="border-2 border-slate-300 px-4 py-3 text-left font-bold text-slate-800">Цвят</th>
                                            <th className="border-2 border-slate-300 px-4 py-3 text-center font-bold text-slate-800">Размер</th>
                                            <th className="border-2 border-slate-300 px-4 py-3 text-center font-bold text-slate-800">Брой</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {cartItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="border-2 border-slate-300 px-4 py-3 text-slate-800">{item.name}</td>
                                                <td className="border-2 border-slate-300 px-4 py-3 text-slate-700">{item.color}</td>
                                                <td className="border-2 border-slate-300 px-4 py-3 text-center font-semibold text-slate-800">{item.size}</td>
                                                <td className="border-2 border-slate-300 px-4 py-3 text-center font-semibold text-slate-800">{item.quantity}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                        <tfoot>
                                        <tr className="bg-yellow-100">
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Confirmation Question */}
                            <div className="bg-slate-100 p-6 rounded-lg border-2 border-slate-300 mb-6">
                                <p className="text-xl font-bold text-center text-slate-800 mb-4">
                                    Моля потвърдете, че информацията е вярна
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCancelConfirmation}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 px-6 rounded-lg font-bold text-lg bg-slate-300 text-slate-800 hover:bg-slate-400 transition-all duration-200 focus:ring-4 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Не, редактирай поръчката
                                </button>
                                <button
                                    onClick={handleConfirmedSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 px-6 rounded-lg font-bold text-lg bg-green-500 text-white hover:bg-green-600 transition-all duration-200 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                            Изпращане...
                                        </>
                                    ) : (
                                        'Да, потвърди поръчката'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Zoom modal */}
            {zoomedImage && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
                    <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setZoomedImage(null)} className="absolute -top-14 right-0 text-white hover:text-yellow-400 transition-colors bg-slate-800 bg-opacity-70 rounded-full p-3 hover:bg-opacity-90">
                            <X className="w-6 h-6" />
                        </button>
                        <img src={zoomedImage.image} alt={zoomedImage.name} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-4 border-white" />
                        <div className="absolute bottom-0 left-0 right-0 bg-slate-800 bg-opacity-90 text-white p-6 rounded-b-xl">
                            <h3 className="font-bold text-xl text-yellow-400">{zoomedImage.name}</h3>
                            <p className="text-sm text-slate-300 mt-1">{zoomedImage.color}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.show && (
                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default ProductOrderFormNoName;