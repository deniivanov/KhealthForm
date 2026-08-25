/** Shared filter builder for admin order views. */

export interface OrderFilters {
    status?: string;
    sku?: string;
    size?: string;
    teamId?: string;
    formId?: string;
}

export function buildOrderFilter(filters: OrderFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.teamId) query.teamId = filters.teamId;
    if (filters.formId) query.formId = filters.formId;

    const lineMatch: Record<string, unknown> = {};
    if (filters.sku) lineMatch.productSku = filters.sku;
    if (filters.size) lineMatch.sizeLabel = filters.size;
    if (Object.keys(lineMatch).length > 0) query.lines = { $elemMatch: lineMatch };

    return query;
}
