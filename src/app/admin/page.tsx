'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, Search, Filter, CalendarDays } from 'lucide-react';
import type { LegacyOrder } from '@/lib/legacy-types';

const AdminOrdersTable = () => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState<LegacyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        async function fetchOrders() {
            try {
                const { data } = await axios.get('/api/fetch-orders', {
                    headers: { 'Cache-Control': 'no-store' }
                });
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    setLoadError(data.message || 'Failed to fetch orders');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setLoadError('Грешка при зареждане на поръчките.');
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const toggleRowExpansion = (orderId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedRows(newExpanded);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year}, ${hours}:${minutes}`;
    };

    const formatCurrency = (amount: number) => {
        return `${amount} лв.`;
    };

    const filteredOrders = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Поръчки</h1>
                            <p className="text-gray-600 mt-1">Управление на всички поръчки</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Търсене..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Filter className="w-4 h-4" />
                                Филтри
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-6 font-medium text-gray-900 w-8"></th>
                            <th className="text-left py-3 px-6 font-medium text-gray-900">Номер поръчка</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-900">Клиент</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-900">Продукти</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-900">Обща сума</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-900">Дата</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredOrders.map((order) => (
                            <React.Fragment key={order.orderId}>
                                <tr
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => toggleRowExpansion(order.orderId)}
                                >
                                    <td className="py-4 px-6">
                                        {expandedRows.has(order.orderId) ? (
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-medium text-gray-900">{order.orderId}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div>
                                            <div className="font-medium text-gray-900">{order.customerName}</div>
                                            {order.additionalInfo && (
                                                <div className="text-sm text-gray-500 mt-1">{order.additionalInfo}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm text-gray-600">
                                            {order.products.length} продукт{order.products.length !== 1 ? 'а' : ''}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <CalendarDays className="w-4 h-4 mr-2" />
                                            {formatDate(order.orderDate)}
                                        </div>
                                    </td>
                                </tr>
                                {expandedRows.has(order.orderId) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-0">
                                            <div className="bg-gray-50 rounded-lg mx-4 mb-4">
                                                <div className="p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">Детайли на поръчката</h4>
                                                    <div className="space-y-3">
                                                        {order.products.map((product) => (
                                                            <div
                                                                key={product.id}
                                                                className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                                    <div className="text-sm text-gray-600 mt-1">
                                                                        Цвят: {product.color} • Размер: {product.size}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-medium text-gray-900">
                                                                        {formatCurrency(product.price)} × {product.quantity}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        = {formatCurrency(product.subtotal)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Зареждане...</p>
                    </div>
                )}

                {!loading && loadError && (
                    <div className="text-center py-12">
                        <p className="text-red-500">{loadError}</p>
                    </div>
                )}

                {!loading && !loadError && filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Няма намерени поръчки</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersTable;
