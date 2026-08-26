/**
 * Seed script: creates an admin user, sample products with size charts,
 * one team and one open form so the app is clickable immediately.
 *
 * Usage: npm run seed
 *
 * Idempotent: entities are upserted by their natural keys (email, sku, slug),
 * so re-running updates the samples instead of duplicating them.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../src/lib/db';
import User from '../src/models/User';
import Product, { type ProductData } from '../src/models/Product';
import Team from '../src/models/Team';
import Form from '../src/models/Form';

function loadEnv() {
    try {
        process.loadEnvFile('.env.local');
    } catch {
        // fine — env may come from the shell
    }
}

async function seedAdmin() {
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    // Reuse the existing env password hash if present so credentials stay the
    // same when auth switches to the User collection. The env value escapes
    // "$" as "\$" for Next's dotenv-expand; Node's loadEnvFile keeps the
    // backslashes, so strip them here.
    let passwordHash = process.env.ADMIN_PASSWORD_HASH?.replace(/\\\$/g, '$');
    let generatedPassword: string | null = null;

    const existing = await User.findOne({ email });
    if (!passwordHash && !existing) {
        generatedPassword = `admin-${Math.random().toString(36).slice(2, 10)}`;
        passwordHash = bcrypt.hashSync(generatedPassword, 12);
    }

    if (existing) {
        // Never overwrite an existing password — it may have been changed
        // from the admin settings page and the env hash would be stale.
        console.log(`✔ admin user exists: ${email} (password untouched)`);
        return;
    }

    await User.create({ email, passwordHash, role: 'admin', name: 'Admin' });
    console.log(`✔ admin user created: ${email}`);
    if (generatedPassword) {
        console.log(`  ⚠ generated password (change it): ${generatedPassword}`);
    }
}

const SAMPLE_PRODUCTS: Omit<ProductData, 'createdAt' | 'updatedAt'>[] = [
    {
        sku: 'TS-CLASSIC',
        name: 'Тениска Classic',
        description: 'Памучна тениска с печат на клубното лого.',
        category: 't-shirt',
        images: ['https://ik.imagekit.io/brandbeam/bilyana-1.jpg'],
        basePriceCents: 1800, // €18.00
        dimensions: ['chestWidth', 'length', 'sleeveLength'],
        sizes: [
            { label: '116', measurements: { chestWidth: 36, length: 46, sleeveLength: 13 } },
            { label: '128', measurements: { chestWidth: 39, length: 50, sleeveLength: 14 } },
            { label: '140', measurements: { chestWidth: 42, length: 54, sleeveLength: 15 } },
            { label: '152', measurements: { chestWidth: 44, length: 58, sleeveLength: 16 } },
            { label: 'XS', measurements: { chestWidth: 47, length: 64, sleeveLength: 19 } },
            { label: 'S', measurements: { chestWidth: 50, length: 68, sleeveLength: 20 } },
            { label: 'M', measurements: { chestWidth: 53, length: 70, sleeveLength: 21 } },
            { label: 'L', measurements: { chestWidth: 56, length: 72, sleeveLength: 22 } },
            { label: 'XL', measurements: { chestWidth: 59, length: 74, sleeveLength: 23 } },
            { label: '3XL', measurements: { chestWidth: 65, length: 78, sleeveLength: 25 }, priceAdjustmentCents: 200 },
        ],
        isActive: true,
    },
    {
        sku: 'HD-ESSENTIAL',
        name: 'Суичър Essential',
        description: 'Суичър с качулка, бродирано лого.',
        category: 'hoodie',
        images: ['https://ik.imagekit.io/brandbeam/bilyana-12.jpg'],
        basePriceCents: 3900, // €39.00
        dimensions: ['chestWidth', 'length', 'sleeveLength'],
        sizes: [
            { label: '128', measurements: { chestWidth: 42, length: 52, sleeveLength: 48 } },
            { label: '140', measurements: { chestWidth: 45, length: 56, sleeveLength: 53 } },
            { label: '152', measurements: { chestWidth: 48, length: 60, sleeveLength: 58 } },
            { label: 'S', measurements: { chestWidth: 54, length: 68, sleeveLength: 62 } },
            { label: 'M', measurements: { chestWidth: 57, length: 70, sleeveLength: 63 } },
            { label: 'L', measurements: { chestWidth: 60, length: 72, sleeveLength: 64 } },
            { label: 'XL', measurements: { chestWidth: 63, length: 74, sleeveLength: 65 } },
        ],
        isActive: true,
    },
    {
        sku: 'PN-TRACK',
        name: 'Долнище Track',
        description: 'Спортно долнище с ластик и връзки.',
        category: 'pants',
        images: ['https://ik.imagekit.io/brandbeam/bilyana-9.jpg'],
        basePriceCents: 3200, // €32.00
        dimensions: ['waist', 'inseam', 'length'],
        sizes: [
            { label: '128', measurements: { waist: 27, inseam: 55, length: 78 } },
            { label: '140', measurements: { waist: 29, inseam: 61, length: 86 } },
            { label: '152', measurements: { waist: 31, inseam: 67, length: 94 } },
            { label: 'S', measurements: { waist: 36, inseam: 76, length: 102 } },
            { label: 'M', measurements: { waist: 38, inseam: 78, length: 105 } },
            { label: 'L', measurements: { waist: 40, inseam: 80, length: 108 } },
        ],
        isActive: true,
    },
    {
        sku: 'SH-MOVE',
        name: 'Къси панталони Move',
        description: 'Леки шорти за тренировка.',
        category: 'shorts',
        images: ['https://ik.imagekit.io/brandbeam/bilyana-8.jpg'],
        basePriceCents: 2200, // €22.00
        dimensions: ['waist', 'length'],
        sizes: [
            { label: '128', measurements: { waist: 27, length: 32 } },
            { label: '140', measurements: { waist: 29, length: 36 } },
            { label: '152', measurements: { waist: 31, length: 40 } },
            { label: 'S', measurements: { waist: 36, length: 44 } },
            { label: 'M', measurements: { waist: 38, length: 46 } },
            { label: 'L', measurements: { waist: 40, length: 48 } },
        ],
        isActive: true,
    },
];

async function seedProducts() {
    for (const product of SAMPLE_PRODUCTS) {
        await Product.updateOne({ sku: product.sku }, { $set: product }, { upsert: true });
    }
    console.log(`✔ ${SAMPLE_PRODUCTS.length} products upserted`);
}

async function seedTeamAndForm() {
    const teamSlug = 'fc-example';
    await Team.updateOne(
        { slug: teamSlug },
        {
            $set: {
                name: 'FC Example',
                slug: teamSlug,
                contactName: 'Иван Треньоров',
                email: 'coach@example.com',
                phone: '+359888123456',
                notes: 'Демонстрационен отбор от seed скрипта.',
                logoUrl: 'https://ik.imagekit.io/brandbeam/bilyana-1.jpg',
                brandColors: { primary: '#1d4ed8', secondary: '#facc15' },
            },
        },
        { upsert: true }
    );
    const team = await Team.findOne({ slug: teamSlug });
    if (!team) throw new Error('team upsert failed');
    console.log(`✔ team upserted: ${team.name}`);

    const existingForm = await Form.findOne({ teamId: team._id, title: 'FC Example — Есен 2026' });
    if (existingForm) {
        console.log(`✔ form exists: /f/${teamSlug}/${existingForm.slug}`);
        return;
    }

    const products = await Product.find({ sku: { $in: SAMPLE_PRODUCTS.map(p => p.sku) } });
    const form = await Form.create({
        teamId: team._id,
        title: 'FC Example — Есен 2026',
        slug: 'esen-2026-demo01',
        status: 'open',
        message: 'Поръчки до 15 септември. Получаване на тренировка от треньора.',
        requiredMemberFields: { email: false, phone: true },
        items: products.map(p => ({
            productId: p._id,
            sku: p.sku,
            name: p.name,
            images: p.images,
            priceCents: p.basePriceCents,
            dimensions: p.dimensions,
            sizes: p.sizes,
            personalization:
                p.category === 't-shirt' || p.category === 'hoodie'
                    ? [
                          { key: 'playerName', label: 'Име на гърба', type: 'text' as const, required: false },
                          { key: 'playerNumber', label: 'Номер', type: 'number' as const, required: false },
                      ]
                    : [],
        })),
    });
    console.log(`✔ form created: /f/${teamSlug}/${form.slug}`);
}

async function main() {
    loadEnv();
    await connectDB();
    await seedAdmin();
    await seedProducts();
    await seedTeamAndForm();
    await mongoose.disconnect();
    console.log('Done.');
}

main().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
