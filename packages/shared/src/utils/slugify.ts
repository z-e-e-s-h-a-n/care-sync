export const slugify = (str: string, slug?: string) => {
  const base = slug && slug.trim().length > 0 ? slug : str;

  return base
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};
