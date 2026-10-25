export const tintClass = (category: string) => `tint-${category.toLowerCase()}`;
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const categoryHref = (slug: string) => `/category/${encodeURIComponent(slug)}`;
