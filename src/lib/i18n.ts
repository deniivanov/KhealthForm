/** Tiny dictionary-based i18n for the public form. Default: Bulgarian. */

export const LOCALES = ['bg', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'bg';

const bg = {
    // shop
    kicker: 'Поръчка на екипировка',
    tapHint: 'Изберете продукт, за да видите детайли и да го добавите към поръчката си. Плащането се събира от клуба.',
    closesShort: 'До',
    size: 'Размер',
    sizeChart: 'Таблица с размери',
    quantity: 'Брой',
    addToOrder: 'Добави към поръчката',
    added: 'добавено',
    adds: 'добавя',
    backToOrder: 'Обратно към поръчката',
    orderSummary: 'Вашата поръчка',
    total: 'Общо',
    remove: 'Премахни',
    emptyCart: 'Все още няма нищо — изберете продукт по-горе.',
    reviewOrder: 'Преглед на поръчката',
    // contact + submit
    contactDetails: 'Контакт',
    fullName: 'Име и фамилия',
    phone: 'Телефон',
    email: 'Имейл',
    notes: 'Бележка',
    notesPlaceholder: 'Нещо, което клубът трябва да знае',
    optional: 'по желание',
    submit: 'Изпрати поръчката',
    submitting: 'Изпращане…',
    referenceNote: 'Ще получите номер за справка след изпращане.',
    // success
    orderReceived: 'Поръчката е приета',
    thankYou: 'Благодарим ви',
    successBody: 'Поръчката е изпратена към клуба. Запазете номера по-долу — ще ви трябва при получаване и плащане.',
    reference: 'Номер за справка',
    confirmationNote: 'потвърждение по имейл, ако сте посочили',
    newOrder: 'Нова поръчка',
    // closed
    formClosedTitle: 'Поръчките са затворени.',
    closedOn: 'Формата спря да приема поръчки на',
    missedDeadline: 'Свържете се с вашия треньор, ако сте изпуснали срока.',
    formClosedBody: 'В момента тази форма е затворена. Свържете се с вашия треньор за повече информация.',
    formNotOpenYet: 'Формата ще отвори скоро. Опитайте отново по-късно.',
    questions: 'Въпроси',
    deadline: 'Краен срок',
    // errors
    errRequired: 'Задължително поле',
    errName: 'Моля, въведете име',
    errPhone: 'Моля, въведете телефон',
    errEmail: 'Моля, въведете валиден имейл',
    errCartEmpty: 'Поръчката е празна — добавете поне един продукт.',
    errGeneric: 'Възникна грешка. Моля, опитайте отново.',
    errTooMany: 'Твърде много заявки. Опитайте отново след минута.',
    // misc
    cm: 'см',
    close: 'Затвори',
    measurementLabels: {
        chestWidth: 'Гръдна обиколка',
        length: 'Дължина',
        sleeveLength: 'Ръкав',
        shoulderWidth: 'Рамо',
        waist: 'Талия',
        hip: 'Ханш',
        inseam: 'Вътрешен крачол',
    } as Record<string, string>,
};

const en: typeof bg = {
    kicker: 'Team kit order',
    tapHint: 'Tap a piece to see details and add it to your order. Payment is collected by the club.',
    closesShort: 'Closes',
    size: 'Size',
    sizeChart: 'Size chart',
    quantity: 'Quantity',
    addToOrder: 'Add to order',
    added: 'added',
    adds: 'adds',
    backToOrder: 'Back to order',
    orderSummary: 'Your order',
    total: 'Total',
    remove: 'Remove',
    emptyCart: 'Nothing yet — tap a product above to add it.',
    reviewOrder: 'Review order',
    contactDetails: 'Contact',
    fullName: 'Full name',
    phone: 'Phone',
    email: 'Email',
    notes: 'Notes',
    notesPlaceholder: 'Anything the club should know',
    optional: 'optional',
    submit: 'Submit order',
    submitting: 'Submitting…',
    referenceNote: 'You will receive a reference number after submitting.',
    orderReceived: 'Order received',
    thankYou: 'Thank you',
    successBody: "Your order was submitted to the club. Keep the reference below — you'll need it for pickup and payment.",
    reference: 'Reference',
    confirmationNote: 'confirmation sent if you gave an email',
    newOrder: 'Place another order',
    formClosedTitle: 'Orders are closed.',
    closedOn: 'This form stopped accepting orders on',
    missedDeadline: 'Contact your coach if you missed the deadline.',
    formClosedBody: 'This form is currently closed. Contact your coach for more information.',
    formNotOpenYet: 'This form opens soon. Please try again later.',
    questions: 'Questions',
    deadline: 'Deadline',
    errRequired: 'Required field',
    errName: 'Please enter your name',
    errPhone: 'Please enter your phone number',
    errEmail: 'Please enter a valid email',
    errCartEmpty: 'Your order is empty — add at least one item.',
    errGeneric: 'Something went wrong. Please try again.',
    errTooMany: 'Too many requests. Try again in a minute.',
    cm: 'cm',
    close: 'Close',
    measurementLabels: {
        chestWidth: 'Chest width',
        length: 'Length',
        sleeveLength: 'Sleeve length',
        shoulderWidth: 'Shoulder width',
        waist: 'Waist',
        hip: 'Hip',
        inseam: 'Inseam',
    } as Record<string, string>,
};

export const DICTIONARIES: Record<Locale, typeof bg> = { bg, en };

export type Dictionary = typeof bg;

export function getDictionary(locale: string | undefined): { locale: Locale; dict: Dictionary } {
    const l: Locale = locale === 'en' ? 'en' : 'bg';
    return { locale: l, dict: DICTIONARIES[l] };
}
