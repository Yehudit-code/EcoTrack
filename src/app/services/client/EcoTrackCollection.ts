export async function fetchProducts() {
  const response = await fetch('/api/collections');
  if (!response.ok) throw new Error("Failed to fetch products");
  const data = await response.json();
  return data;
}