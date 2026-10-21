/** Converts lean Mongo documents (ObjectId, Date) into plain JSON for components. */
export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
