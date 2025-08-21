'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search, Filter, CalendarDays } from 'lucide-react';

const AdminOrdersTable = () => {
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const orders = [
        {
            "orderId": "ORD-20250807-5521",
            "customerName": "Selena Kancheva",
            "additionalInfo": "По-дълъг ръкав",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "S",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-07T14:34:37.953Z"
        },
        {
            "orderId": "ORD-20250811-8903",
            "customerName": "Жасмина Желева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "S",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "S",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T12:31:13.497Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-8547",
            "customerName": "Сиана Колева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T12:32:16.930Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-4522",
            "customerName": "Мария Бояджиева",
            "additionalInfo": "\nАко има възможност крачолите ,да са с 1 -2см по-къси",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T12:37:19.505Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-1743",
            "customerName": "Маноела Иванова ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T12:37:31.398Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-4880",
            "customerName": "Simona Savova",
            "additionalInfo": "1 см по-дълги ръкави",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "164-170",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "164-170",
                    "quantity": 2,
                    "subtotal": 120
                }
            ],
            "total": 180,
            "orderDate": "2025-08-11T12:38:32.607Z"
        },
        {
            "orderId": "ORD-20250811-5080",
            "customerName": "Елия Карауланова",
            "additionalInfo": "Ръкавите да са с 2 см по-дълги",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T12:41:23.763Z"
        },
        {
            "orderId": "ORD-20250811-5765",
            "customerName": "Силвия Стоянова ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T14:22:29.095Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-9593",
            "customerName": "Никол Петрова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T15:11:18.494Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-4252",
            "customerName": "Ivayla Stoyanova",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T15:45:56.497Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-2611",
            "customerName": "Соня Цанкова ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "164-170",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "164-170",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T15:46:22.246Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-9792",
            "customerName": "Цветана Тотева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T19:39:10.157Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250811-1094",
            "customerName": "Цветина Тотева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-11T19:41:20.285Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-1372",
            "customerName": "Магдалена Пантова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T03:39:08.088Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-2827",
            "customerName": "Александра Колева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T06:26:25.257Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-2482",
            "customerName": "Анастасия Пройчева",
            "additionalInfo": "Крачолите да са 1 см по-къси.",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T08:28:49.741Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-7387",
            "customerName": "Елица Пройчева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T08:30:32.108Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-7530",
            "customerName": "Катерина Тарковска",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T09:07:42.720Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-1009",
            "customerName": "Виктория Нейчева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T09:22:07.701Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-7229",
            "customerName": "Гергана Тенева ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "164-170",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T11:06:13.971Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-5396",
            "customerName": "Дария Поликрайщова ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T14:12:19.524Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-6415",
            "customerName": "Радост Добрева ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T14:22:20.064Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-6661",
            "customerName": "Мария Ферманджиева ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T14:29:52.127Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-3925",
            "customerName": "Елица Цветкова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "164-170",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "164-170",
                    "quantity": 2,
                    "subtotal": 120
                }
            ],
            "total": 180,
            "orderDate": "2025-08-12T14:30:17.804Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-8203",
            "customerName": "Габриела Николаева ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T14:47:10.205Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-1035",
            "customerName": "Дарина Стоева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T14:51:25.242Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-1449",
            "customerName": "Кристина Петкова ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T15:43:03.593Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-1732",
            "customerName": "Лора Танева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T16:35:48.346Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-8055",
            "customerName": "Жаклин Искрева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T20:34:44.232Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250812-5934",
            "customerName": "Йоана Баева",
            "additionalInfo": "Ръкавите да са с по 2 см. по-къси",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-12T20:47:10.633Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-0902",
            "customerName": "Дария Янкова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T06:24:15.195Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-6299",
            "customerName": "Димана Гюргенова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T07:44:29.436Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-4049",
            "customerName": "Надие Хасан",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T08:20:05.029Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-9639",
            "customerName": "Карина Динева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "128-134",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T08:57:44.641Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-3870",
            "customerName": "Габриела Динева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T09:41:37.795Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-7079",
            "customerName": "Йоана Кацарова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "S",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "S",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T09:50:43.107Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-2489",
            "customerName": "Жулиета Желева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T10:00:22.824Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-3557",
            "customerName": "Кристина Димитрова ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "S",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T13:32:05.405Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-0344",
            "customerName": "Клара Узунова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T13:33:16.329Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-7137",
            "customerName": "Михаела Шопова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T14:26:26.583Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-3452",
            "customerName": "Иванина Стоянова ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T15:51:44.174Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-7128",
            "customerName": "Милена Цонева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T15:51:49.379Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-5847",
            "customerName": "Камелия Танева ",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T15:52:29.389Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-3361",
            "customerName": "Ралица Джамбова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "S",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T17:38:33.173Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250813-9898",
            "customerName": "Сияна Петкова ",
            "additionalInfo": "Ръкавите да са 2см. по-дълги",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-13T17:54:52.414Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250814-0965",
            "customerName": "Ивайла Стефанова",
            "additionalInfo": "1 см.по-дълги ръкави",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-14T04:00:31.004Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250814-8171",
            "customerName": "Жасмина Руева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-14T10:31:21.631Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250814-0141",
            "customerName": "Александра Гавраилова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "S",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-14T17:12:56.778Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250815-4275",
            "customerName": "Мила Господинова",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "116-122",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-15T13:07:26.997Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250815-3715",
            "customerName": "Галин Иванов",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "XS",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-15T13:11:38.462Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250815-2148",
            "customerName": "Теодора Влаева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "140-146",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-15T16:28:51.121Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250819-5977",
            "customerName": "Изабела Велева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-19T17:21:15.224Z"
        },
        /**
         * Paste one or more documents here
         */
        {
            "orderId": "ORD-20250819-9198",
            "customerName": "Тиана Велева",
            "additionalInfo": "",
            "products": [
                {
                    "id": 1,
                    "name": "Горнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                },
                {
                    "id": 2,
                    "name": "Долнище от комплект Gold",
                    "color": "Бял",
                    "price": 60,
                    "size": "152-158",
                    "quantity": 1,
                    "subtotal": 60
                }
            ],
            "total": 120,
            "orderDate": "2025-08-19T17:21:37.134Z"
        }
    ];

    const toggleRowExpansion = (orderId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedRows(newExpanded);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year}, ${hours}:${minutes}`;
    };

    const formatCurrency = (amount) => {
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
                                        <td colSpan="6" className="px-6 py-0">
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

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Няма намерени поръчки</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersTable;