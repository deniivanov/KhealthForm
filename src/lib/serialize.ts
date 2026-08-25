/**
 * Convert Mongoose lean() documents (ObjectIds, Dates, Maps) into plain
 * JSON-safe objects for client components. ObjectId/Date have toJSON, so a
 * JSON round-trip is the simplest faithful serializer.
 */
export function toPlain<T = unknown>(doc: unknown): T {
    return JSON.parse(JSON.stringify(doc)) as T;
}
