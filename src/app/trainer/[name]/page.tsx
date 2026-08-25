import ProductOrderForm from "../../../components/ProductOrderForm";

// Normalize: "eva" -> "Eva", "john-doe" -> "John Doe", "ivan_ivanov" -> "Ivan Ivanov"
function normalizeName(raw: string): string {
    try {
        const decoded = decodeURIComponent(raw || "");
        return decoded
            .replace(/[-_]+/g, " ")
            .trim()
            .toLowerCase()
            .replace(/\b\p{L}/gu, (c) => c.toUpperCase()); // Unicode-safe capitalize
    } catch {
        return raw || "";
    }
}

export default async function TrainerNamePage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    return <ProductOrderForm initialName={normalizeName(name)} lockName={true} />;
}
