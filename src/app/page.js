import ProductOrderFormNoName from "@/components/ProductOrderFormNoName";
// Normalize: "eva" -> "Eva", "john-doe" -> "John Doe", "ivan_ivanov" -> "Ivan Ivanov"
function normalizeName(raw) {
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

export default function TrainerNamePage({ params }) {
    const name = normalizeName(params?.name);
    return <ProductOrderFormNoName />;
}
