// Single source of truth for products. The server prices orders from this
// data only — anything price-related sent by the browser is ignored.

export interface CatalogProduct {
    id: number;
    name: string;
    color: string;
    price: number;
    image: string;
    sizes: string[];
}

export type CatalogKey = 'trainer' | 'main';

export const CATALOGS: Record<CatalogKey, CatalogProduct[]> = {
    // Used by ProductOrderForm (/trainer/[name])
    trainer: [
        { id: 1, name: "Горнище от комплект Gold", color: "Бял", price: 60.00, image: "/gornishte.webp",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 2, name: "Долнище от комплект Gold", color: "Бял", price: 60.00, image: "/dolnishte.webp",
            sizes: ['116-122','128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 3, name: "Тениска Classic", color: "Черен", price: 35.00, image: "/tshirt-classic.webp",
            sizes: ['128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 4, name: "Суичър Essential", color: "Сив Меланж", price: 75.00, image: "/hoodie-essential.webp",
            sizes: ['140-146','152-158','164-170','XS','S','M','L'] },
        { id: 5, name: "Легинси Flex", color: "Черен", price: 49.00, image: "/leggings-flex.webp",
            sizes: ['128-134','140-146','152-158','164-170','XS','S','M'] },
        { id: 6, name: "Къси панталони Move", color: "Тъмносин", price: 39.00, image: "/shorts-move.webp",
            sizes: ['140-146','152-158','164-170','XS','S','M','L'] },
        { id: 7, name: "Яке Light", color: "Маслинено зелено", price: 89.00, image: "/jacket-light.webp",
            sizes: ['152-158','164-170','XS','S','M','L'] }
    ],

    // Used by ProductOrderFormNoName (/)
    main: [
        { id: 1, name: "Тениска Биляна Сублимация", color: "Черен", price: 60.00, image: "https://ik.imagekit.io/brandbeam/bilyana-1.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 2, name: "Тениска Биляна Сублимация", color: "Розов", price: 35.00, image: "https://ik.imagekit.io/brandbeam/bilyana-3.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 3, name: "Горнище Биляна Сублимация", color: "Бял", price: 60.00, image: "https://ik.imagekit.io/brandbeam/bilyana-2.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 4, name: "Тениска Сублимация Gradient", color: "Розово/Черно", price: 75.00, image: "https://ik.imagekit.io/brandbeam/bilyana-4.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 5, name: "Клин KHealth дълъг", color: "Черен", price: 49.00, image: "https://ik.imagekit.io/brandbeam/bilyana-5.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 6, name: "Блуза", color: "Черен", price: 39.00, image: "https://ik.imagekit.io/brandbeam/bilyana-11.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 7, name: "Клин KHealth къс", color: "Черно", price: 89.00, image: "https://ik.imagekit.io/brandbeam/bilyana-8.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 8, name: "Тениска Биляна Памук", color: "Цикламено", price: 89.00, image: "https://ik.imagekit.io/brandbeam/bilyana-7.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 9, name: "Суичър Кхеалтх", color: "Розов", price: 89.00, image: "https://ik.imagekit.io/brandbeam/bilyana-12.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] },
        { id: 10, name: "Долнище Khealth", color: "Черно", price: 89.00, image: "https://ik.imagekit.io/brandbeam/bilyana-9.jpg",
            sizes: ['104-110','116-122','128-134','140-146','152-158','164-170','XS','S','M','L'] }
    ]
};
