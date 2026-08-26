import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'KHealth — спортна екипировка за клубове и отбори',
    description:
        'Български бранд за спортно облекло със собствено производство. Персонализирана екипировка за клубове по художествена гимнастика, балет, фигурно пързаляне и др.',
};

const CONTACT_EMAIL = 'khealth.official@gmail.com';
const CONTACT_PHONE = '0876 006 118';
const SHOP_URL = 'https://khealth.eu/';

const PILLARS = [
    {
        title: 'Собствено производство',
        body: 'Дрехите ни се произвеждат в собствена база в България — това ни позволява много висок контрол на качеството на всяка бройка.',
    },
    {
        title: 'Дизайн без компромис',
        body: 'Красив дизайн и пълна функционалност едновременно — с подчертано внимание към материите, кройката и всеки детайл.',
    },
    {
        title: 'Персонализация за клубове',
        body: 'Клубни цветове, лого, имена и номера. Всеки отбор получава собствена онлайн форма, през която състезателите поръчват удобно.',
    },
];

const SPORTS = [
    'Художествена гимнастика',
    'Фигурно пързаляне',
    'Балет',
    'Волейбол',
    'Баскетбол',
    'Бягане',
    'Фитнес',
];

const MISSION_PARTS = [
    { n: '01', title: 'Хранене', body: 'Правилното хранене е основата на всяко спортно развитие.' },
    { n: '02', title: 'Тренировка', body: 'Постоянството в залата и на терена изгражда резултатите.' },
    { n: '03', title: 'Възстановяване', body: 'Почивката е също толкова важна, колкото натоварването.' },
    { n: '04', title: 'Екипировка', body: 'Подходящото облекло дава свобода на движението и увереност.' },
];

const STEPS = [
    { n: '1', title: 'Свързвате се с нас', body: 'Разказвате ни за клуба — брой състезатели, дисциплина, клубни цветове и лого.' },
    { n: '2', title: 'Получавате форма за поръчки', body: 'Подготвяме персонализирана онлайн форма с вашите продукти, размери и цени.' },
    { n: '3', title: 'Отборът поръчва онлайн', body: 'Всеки състезател или родител избира размер и персонализация от телефона си.' },
    { n: '4', title: 'Произвеждаме и доставяме', body: 'Изработваме екипировката в нашата база и я доставяме на клуба.' },
];

export default function HomePage() {
    return (
        <div className="modernist min-h-screen" style={{ background: 'var(--color-neutral-200)' }}>
            <div
                className="mx-auto w-full max-w-[1080px] min-h-screen shadow-[var(--shadow-md)]"
                style={{ background: 'var(--color-bg)' }}
            >
                {/* ── Header ── */}
                <header className="nav" style={{ padding: '14px 24px' }}>
                    <span className="flex items-center" style={{ marginRight: 'auto' }}>
                        <h3alth-logo mode="both" height="40" idle-every="6" />
                    </span>
                    <nav className="flex items-center gap-5">
                        <a href="#za-nas" className="hidden sm:inline" style={{ color: 'inherit', textDecoration: 'none', fontSize: 14 }}>За нас</a>
                        <a href="#kak-rabotim" className="hidden sm:inline" style={{ color: 'inherit', textDecoration: 'none', fontSize: 14 }}>За клубове</a>
                        <a href="#kontakti" className="hidden sm:inline" style={{ color: 'inherit', textDecoration: 'none', fontSize: 14 }}>Контакти</a>
                        <a href={SHOP_URL} target="_blank" rel="noopener" className="btn btn-secondary" style={{ fontSize: 13, padding: '6px 12px' }}>
                            Онлайн магазин
                        </a>
                    </nav>
                </header>

                {/* ── Hero ── */}
                <section style={{ padding: '64px 24px 56px', borderBottom: '2px solid var(--color-divider)' }}>
                    <h6>Спортна екипировка от България</h6>
                    <h2 style={{ maxWidth: 640, marginBottom: 16, fontSize: 'clamp(30px, 5.5vw, 44px)' }}>
                        Движение и стилна визия — перфектната комбинация.
                    </h2>
                    <p className="text-muted" style={{ maxWidth: 560, fontSize: 15, marginBottom: 28 }}>
                        В търсене на съвършеното облекло, което не прави компромис между красив
                        дизайн и пълна функционалност, създадохме KHealth — български бранд за
                        спортно облекло със собствена философия и внимание към всеки детайл.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-primary" style={{ minHeight: 46, paddingInline: 22 }}>
                            Свържете се с нас
                        </a>
                        <a href="#kak-rabotim" className="btn btn-secondary" style={{ minHeight: 46, paddingInline: 22 }}>
                            Екипировка за вашия клуб
                        </a>
                    </div>
                </section>

                {/* ── Pillars ── */}
                <section id="za-nas" style={{ padding: '48px 24px', borderBottom: '2px solid var(--color-divider)' }}>
                    <h6>Защо KHealth</h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginTop: 12 }}>
                        {PILLARS.map(p => (
                            <div key={p.title} style={{ borderTop: '2px solid var(--color-accent)', paddingTop: 14 }}>
                                <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, margin: '0 0 8px' }}>{p.title}</h5>
                                <p className="text-muted" style={{ fontSize: 13.5, margin: 0 }}>{p.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Sports ── */}
                <section style={{ padding: '40px 24px', borderBottom: '2px solid var(--color-divider)' }}>
                    <h6>Дисциплини, с които работим</h6>
                    <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
                        {SPORTS.map(s => (
                            <span key={s} className="tag tag-accent" style={{ fontSize: 13, padding: '7px 14px' }}>
                                {s}
                            </span>
                        ))}
                    </div>
                </section>

                {/* ── Mission: the four components of the K ── */}
                <section style={{ padding: '48px 24px', borderBottom: '2px solid var(--color-divider)' }}>
                    <h6>Нашата мисия</h6>
                    <p className="text-muted" style={{ maxWidth: 620, fontSize: 14, margin: '4px 0 24px' }}>
                        Името и логото на бранда символизират четирите важни компонента, които са
                        и нашата мисия:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {MISSION_PARTS.map(m => (
                            <div key={m.n}>
                                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 30, color: 'var(--color-accent-700)' }}>
                                    {m.n}
                                </span>
                                <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, margin: '6px 0 6px' }}>{m.title}</h5>
                                <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>{m.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── For clubs: how it works ── */}
                <section id="kak-rabotim" style={{ padding: '48px 24px', borderBottom: '2px solid var(--color-divider)' }}>
                    <h6>Екипировка за вашия клуб</h6>
                    <p className="text-muted" style={{ maxWidth: 620, fontSize: 14, margin: '4px 0 24px' }}>
                        Работим директно с клубове и треньори — от дизайна до доставката,
                        без да събирате поръчки на ръка.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STEPS.map(s => (
                            <div key={s.n} style={{ background: 'var(--color-surface)', padding: '18px 16px' }}>
                                <span
                                    className="inline-flex items-center justify-center"
                                    style={{ width: 34, height: 34, background: 'var(--color-accent)', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17 }}
                                >
                                    {s.n}
                                </span>
                                <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, margin: '12px 0 6px' }}>{s.title}</h5>
                                <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>{s.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Contact ── */}
                <section id="kontakti" style={{ padding: '48px 24px' }}>
                    <h6>Контакти</h6>
                    <h3 style={{ marginBottom: 16 }}>Да облечем вашия отбор.</h3>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-x-10 gap-y-3" style={{ marginBottom: 24 }}>
                        <div>
                            <span className="text-muted" style={{ display: 'block', fontSize: 12 }}>Имейл</span>
                            <a href={`mailto:${CONTACT_EMAIL}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent-700)' }}>
                                {CONTACT_EMAIL}
                            </a>
                        </div>
                        <div>
                            <span className="text-muted" style={{ display: 'block', fontSize: 12 }}>Телефон</span>
                            <a href={`tel:+359${CONTACT_PHONE.replace(/\s/g, '').replace(/^0/, '')}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent-700)' }}>
                                {CONTACT_PHONE}
                            </a>
                        </div>
                        <div>
                            <span className="text-muted" style={{ display: 'block', fontSize: 12 }}>Онлайн магазин</span>
                            <a href={SHOP_URL} target="_blank" rel="noopener" style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-accent-700)' }}>
                                khealth.eu
                            </a>
                        </div>
                    </div>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-primary" style={{ minHeight: 46, paddingInline: 22 }}>
                        Запитване за клубна екипировка
                    </a>
                </section>

                {/* ── Footer ── */}
                <footer
                    className="flex flex-wrap items-center justify-between gap-3"
                    style={{ padding: '18px 24px', borderTop: '2px solid var(--color-divider)' }}
                >
                    <span className="text-muted" style={{ fontSize: 12 }}>
                        © {new Date().getFullYear()} KHealth · Български бранд за спортно облекло
                    </span>
                    <Link href="/login" className="text-muted" style={{ fontSize: 12, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                        Вход за администратори
                    </Link>
                </footer>
            </div>
        </div>
    );
}
