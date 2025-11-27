'use client';
import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ProductSizeSummary = () => {
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});

    useEffect(() => {
        async function fetchOrders() {
            try {
                const { data } = await axios.get("/api/fetch-orders", {
                    headers: {
                        'Cache-Control': 'no-store'
                    }
                });

                if (data.success) {
                    setOrdersData(data.orders);
                } else {
                    console.error("Failed to fetch orders:", data.message);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, []);

    const toggleOrder = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const summaryData = useMemo(() => {
        const summary = {};

        ordersData.forEach(order => {
            order.products.forEach(product => {
                const name = product.name;
                const size = product.size;
                const qty = product.quantity || 1;
                const color = product.color || 'N/A';

                // Create a unique key combining name and color
                const productKey = `${name} (${color})`;

                if (!summary[productKey]) summary[productKey] = {};
                if (!summary[productKey][size]) summary[productKey][size] = 0;

                summary[productKey][size] += qty;
            });
        });
        return { summary };
    }, [ordersData]);

    const allSizes = useMemo(() => {
        const sizes = new Set();
        ordersData.forEach(order => {
            order.products.forEach(p => sizes.add(p.size));
        });

        return Array.from(sizes).sort((a, b) => {
            if (a === 'XS') return -1;
            if (b === 'XS') return 1;
            if (a === 'S') return -1;
            if (b === 'S') return 1;
            return a.localeCompare(b);
        });
    }, [ordersData]);

    const productNames = useMemo(() => {
        const products = new Set();
        ordersData.forEach(order => {
            order.products.forEach(p => {
                const productKey = `${p.name} (${p.color || 'N/A'})`;
                products.add(productKey);
            });
        });
        return Array.from(products).sort();
    }, [ordersData]);

    const sizeTotals = useMemo(() => {
        const totals = {};
        allSizes.forEach(size => {
            totals[size] = productNames.reduce((sum, productName) => {
                return sum + (summaryData.summary[productName]?.[size] || 0);
            }, 0);
        });
        return totals;
    }, [summaryData, allSizes, productNames]);

    const productTotals = useMemo(() => {
        const totals = {};
        productNames.forEach(name => {
            totals[name] = Object.values(summaryData.summary[name] || {}).reduce((a, b) => a + b, 0);
        });
        return totals;
    }, [summaryData, productNames]);

    const grandTotal = Object.values(productTotals).reduce((a, b) => a + b, 0);

    const perOrderSummary = useMemo(() => {
        return ordersData.map(order => {
            const orderMap = {};
            let orderTotal = 0;

            order.products.forEach(p => {
                const size = p.size;
                const name = p.name;
                const qty = p.quantity || 1;
                const color = p.color || 'N/A';
                const productKey = `${name} (${color})`;

                if (!orderMap[size]) orderMap[size] = {};
                if (!orderMap[size][productKey]) orderMap[size][productKey] = 0;

                orderMap[size][productKey] += qty;
                orderTotal += qty;
            });

            return {
                orderId: order.orderId,
                customerName: order.customerName,
                orderDate: order.orderDate,
                summary: orderMap,
                total: orderTotal
            };
        });
    }, [ordersData]);

    if (loading) {
        return (
            <div className="p-10 text-center text-xl text-gray-600">
                Зареждане на поръчките...
            </div>
        );
    }

    if (ordersData.length === 0) {
        return (
            <div className="p-10 text-center text-xl text-red-600">
                Няма намерени поръчки.
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* --- ORDER-BY-ORDER ACCORDION --- */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">🧾 Поръчки</h2>
                    <p className="text-gray-600">Брой поръчки: <span className="font-bold">{ordersData.length}</span></p>

                    {perOrderSummary.map(order => {
                        // Calculate order summary by product
                        const orderProductSummary = {};
                        const orderSizeSummary = {};

                        Object.entries(order.summary).forEach(([size, products]) => {
                            Object.entries(products).forEach(([productName, qty]) => {
                                if (!orderProductSummary[productName]) orderProductSummary[productName] = 0;
                                orderProductSummary[productName] += qty;

                                if (!orderSizeSummary[size]) orderSizeSummary[size] = 0;
                                orderSizeSummary[size] += qty;
                            });
                        });

                        return (
                            <div key={order.orderId} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                                {/* Accordion Header */}
                                <button
                                    onClick={() => toggleOrder(order.orderId)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 text-left">
                                        <h3 className="text-lg font-bold text-gray-900">{order.orderId}</h3>
                                        <p className="text-gray-700">{order.customerName}</p>
                                        <p className="text-gray-500 text-sm">
                                            Дата: {new Date(order.orderDate).toLocaleString()} • Общо артикули: <span className="font-semibold">{order.total}</span>
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        {expandedOrders[order.orderId] ? (
                                            <ChevronUp className="w-6 h-6 text-gray-600" />
                                        ) : (
                                            <ChevronDown className="w-6 h-6 text-gray-600" />
                                        )}
                                    </div>
                                </button>

                                {/* Accordion Content */}
                                {expandedOrders[order.orderId] && (
                                    <div className="px-6 pb-6 border-t border-gray-500">
                                        <div className="mt-4 space-y-4">
                                            {/* Individual Items Table */}
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Продукти в поръчката:</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                        <tr className="bg-gray-900">
                                                            <th className="border border-gray-900 px-4 py-2 text-left text-white">Продукт</th>
                                                            <th className="border border-gray-900 px-4 py-2 text-left text-white">Размер</th>
                                                            <th className="border border-gray-900 px-4 py-2 text-center text-white">Количество</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {Object.entries(order.summary).map(([size, products]) =>
                                                            Object.entries(products).map(([productKey, qty]) => (
                                                                <tr key={size + productKey} className="hover:bg-gray-100">
                                                                    <td className="border border-gray-300 px-4 py-2 text-gray-700 font-medium">{productKey}</td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-gray-700">{size}</td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">{qty}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Order Summary */}
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                <h4 className="font-bold text-blue-900 mb-3">Обобщение на поръчката:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* By Product */}
                                                    <div>
                                                        <p className="text-sm font-semibold text-blue-800 mb-2">По продукт:</p>
                                                        <ul className="space-y-1">
                                                            {Object.entries(orderProductSummary).map(([product, qty]) => (
                                                                <li key={product} className="text-sm text-gray-700">
                                                                    <span className="font-medium">{product}:</span> {qty} бр.
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* By Size */}
                                                    <div>
                                                        <p className="text-sm font-semibold text-blue-800 mb-2">По размер:</p>
                                                        <ul className="space-y-1">
                                                            {Object.entries(orderSizeSummary).map(([size, qty]) => (
                                                                <li key={size} className="text-sm text-gray-700">
                                                                    <span className="font-medium">{size}:</span> {qty} бр.
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-blue-300">
                                                    <p className="font-bold text-blue-900">Общо артикули в поръчката: {order.total}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- FINAL TOTAL SUMMARY (ALWAYS VISIBLE) --- */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-6 py-5 text-white border-b border-blue-500">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            📊 ОБЩО ОБОБЩЕНИЕ
                        </h1>
                        <div className="mt-3 flex gap-6 text-lg">
                            <p className="text-blue-100">
                                Общо продукти: <span className="font-bold text-white text-xl">{grandTotal}</span>
                            </p>
                            <p className="text-blue-100">
                                Брой поръчки: <span className="font-bold text-white text-xl">{ordersData.length}</span>
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-white overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-200 px-4 py-3 text-left font-semibold text-blue-900">Продукт</th>
                                {allSizes.map(size => (
                                    <th key={size} className="border border-blue-200 px-4 py-3 text-center font-semibold text-blue-900">{size}</th>
                                ))}
                                <th className="border border-blue-200 px-4 py-3 bg-blue-100 text-blue-900 font-bold">Общо</th>
                            </tr>
                            </thead>

                            <tbody>
                            {productNames.map(productKey => (
                                <tr key={productKey} className="hover:bg-blue-50 transition-colors">
                                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">{productKey}</td>

                                    {allSizes.map(size => (
                                        <td key={size} className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                                            {summaryData.summary[productKey]?.[size] || '-'}
                                        </td>
                                    ))}

                                    <td className="border border-gray-300 px-4 py-3 font-bold bg-blue-50 text-blue-800 text-center text-lg">
                                        {productTotals[productKey]}
                                    </td>
                                </tr>
                            ))}
                            </tbody>

                            <tfoot>
                            <tr className="bg-blue-600 text-white font-bold text-lg">
                                <td className="border border-blue-500 px-4 py-4">Общо по размери</td>
                                {allSizes.map(size => (
                                    <td key={size} className="border border-blue-500 px-4 py-4 text-center">
                                        {sizeTotals[size]}
                                    </td>
                                ))}
                                <td className="border border-blue-500 px-4 py-4 text-center bg-blue-700 text-xl">
                                    {grandTotal}
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductSizeSummary;