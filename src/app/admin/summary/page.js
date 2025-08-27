'use client';
import React, { useState, useMemo } from 'react';

const ProductSizeSummary = () => {
    // REPLACE THIS ARRAY WITH YOUR COMPLETE ORDERS DATA
    const ordersData = [
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

    // Process ONLY the real orders data - NO SIMULATION
    const summaryData = useMemo(() => {
        const summary = {};

        ordersData.forEach(order => {
            order.products.forEach(product => {
                const productName = product.name;
                const size = product.size;

                // Initialize product if not exists
                if (!summary[productName]) {
                    summary[productName] = {};
                }

                // Initialize size if not exists
                if (!summary[productName][size]) {
                    summary[productName][size] = 0;
                }

                // Count each customer order as 1 unit per size (ignore quantity field)
                summary[productName][size] += product.quantity;
            });
        });

        return summary;
    }, [ordersData]);

    // Get all unique sizes from the ACTUAL data
    const allSizes = useMemo(() => {
        const sizes = new Set();
        ordersData.forEach(order => {
            order.products.forEach(product => {
                sizes.add(product.size);
            });
        });
        return Array.from(sizes).sort((a, b) => {
            // Custom sort to put XS, S first, then numeric ranges
            if (a === 'XS') return -1;
            if (b === 'XS') return 1;
            if (a === 'S') return -1;
            if (b === 'S') return 1;
            return a.localeCompare(b);
        });
    }, [ordersData]);

    // Get all unique products from the ACTUAL data
    const productNames = useMemo(() => {
        const products = new Set();
        ordersData.forEach(order => {
            order.products.forEach(product => {
                products.add(product.name);
            });
        });
        return Array.from(products);
    }, [ordersData]);

    // Calculate totals for each size (from REAL data only)
    const sizeTotals = useMemo(() => {
        const totals = {};
        allSizes.forEach(size => {
            totals[size] = productNames.reduce((sum, productName) => {
                return sum + (summaryData[productName]?.[size] || 0);
            }, 0);
        });
        return totals;
    }, [summaryData, allSizes, productNames]);

    // Calculate totals for each product (from REAL data only)
    const productTotals = useMemo(() => {
        const totals = {};
        productNames.forEach(product => {
            if (summaryData[product]) {
                totals[product] = Object.values(summaryData[product]).reduce((sum, qty) => sum + qty, 0);
            } else {
                totals[product] = 0;
            }
        });
        return totals;
    }, [summaryData, productNames]);

    const grandTotal = Object.values(productTotals).reduce((sum, total) => sum + total, 0);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            📊 Обобщение на продуктите по размери
                        </h1>
                        <p className="text-blue-100 mt-1">
                            Общо брой клиенти по продукт/размер: <span className="font-semibold">{grandTotal}</span>
                        </p>
                        <p className="text-blue-200 text-sm mt-1">
                            Обработени поръчки: <span className="font-semibold">{ordersData.length}</span>
                        </p>
                    </div>

                    <div className="p-6">
                        {/* Status indicator */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-800 mb-2">✅ Обработване на реални данни</h3>
                            {/*<p className="text-blue-700 text-sm">*/}
                            {/*    Текущо обработени {ordersData.length} поръчки. За пълни резултати, заменете ordersData масива с вашия пълен JSON.*/}
                            {/*</p>*/}
                            <div className="mt-2 text-sm text-blue-600">
                                <p><strong>Открити размери:</strong> {allSizes.join(', ')}</p>
                                <p><strong>Открити продукти:</strong> {productNames.length}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse bg-white">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                        Продукт
                                    </th>
                                    {allSizes.map(size => (
                                        <th key={size} className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 min-w-20">
                                            {size}
                                        </th>
                                    ))}
                                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-700 bg-blue-50">
                                        Общо
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {productNames.map((product, index) => (
                                    <tr key={product} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                                            {product}
                                        </td>
                                        {allSizes.map(size => {
                                            const qty = summaryData[product]?.[size] || 0;
                                            return (
                                                <td key={size} className="border border-gray-300 px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                qty > 0
                                    ? qty >= 5
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    : 'text-gray-400'
                            }`}>
                              {qty || '-'}
                            </span>
                                                </td>
                                            );
                                        })}
                                        <td className="border border-gray-300 px-4 py-3 text-center font-bold text-blue-700 bg-blue-50">
                                            {productTotals[product]}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr className="bg-gray-200 font-bold">
                                    <td className="border border-gray-300 px-4 py-3 text-gray-800">
                                        Общо по размери
                                    </td>
                                    {allSizes.map(size => (
                                        <td key={size} className="border border-gray-300 px-4 py-3 text-center text-gray-800">
                                            {sizeTotals[size]}
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 px-4 py-3 text-center text-blue-800 bg-blue-100">
                                        {grandTotal}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>

                        {grandTotal > 0 && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3">📈 Най-популярни размери</h3>
                                    <div className="space-y-2">
                                        {Object.entries(sizeTotals)
                                            .sort(([,a], [,b]) => b - a)
                                            .slice(0, 5)
                                            .map(([size, total]) => (
                                                <div key={size} className="flex justify-between items-center">
                                                    <span className="text-gray-700">{size}</span>
                                                    <span className="font-semibold text-blue-600">{total} клиента</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3">📦 Обобщение по продукти</h3>
                                    <div className="space-y-2">
                                        {Object.entries(productTotals).map(([product, total]) => (
                                            <div key={product} className="flex justify-between items-center">
                                                <span className="text-gray-700 text-sm">{product}</span>
                                                <span className="font-semibold text-green-600">{total} клиента</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                {/*        <div className="mt-6 text-sm text-gray-600">*/}
                {/*            <p>💡 <strong>Легенда:</strong></p>*/}
                {/*            <div className="flex flex-wrap gap-4 mt-2">*/}
                {/*<span className="inline-flex items-center">*/}
                {/*  <span className="w-4 h-4 bg-green-100 rounded mr-2"></span>*/}
                {/*  5+ поръчки (висок спрос)*/}
                {/*</span>*/}
                {/*                <span className="inline-flex items-center">*/}
                {/*  <span className="w-4 h-4 bg-yellow-100 rounded mr-2"></span>*/}
                {/*  1-4 поръчки (умерен спрос)*/}
                {/*</span>*/}
                {/*                <span className="inline-flex items-center">*/}
                {/*  <span className="w-4 h-4 bg-gray-100 rounded mr-2"></span>*/}
                {/*  0 поръчки*/}
                {/*</span>*/}
                {/*            </div>*/}
                {/*        </div>*/}

                        {/* Real data processing information */}
                        {/*<div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">*/}
                        {/*    <h3 className="font-semibold text-green-800 mb-3">✅ Обработване на реални данни</h3>*/}
                        {/*    <div className="text-sm text-green-700 space-y-1">*/}
                        {/*        <p><strong>Статус:</strong> Използват се само реални данни от JSON масива</p>*/}
                        {/*        <p><strong>Логика:</strong> Всяка поръчка = 1 клиент за този размер</p>*/}
                        {/*        <p><strong>Текущи данни:</strong> {ordersData.length} поръчки, {allSizes.length} размера, {productNames.length} продукта</p>*/}
                        {/*        <p><strong>За пълни резултати:</strong> Заменете ordersData с пълния JSON масив</p>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductSizeSummary;