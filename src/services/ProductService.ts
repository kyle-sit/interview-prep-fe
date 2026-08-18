/**
 * Data access for the products API.
 *
 * Owns the URL, the HTTP status check, and the response envelope so callers
 * only ever deal with an array of products.
 */

const BASE_URL = "https://dummyjson.com";

/** DummyJSON wraps the array alongside its pagination fields. */
type ProductsResponse = {
    products: any[];
};

export class ProductService {
    static async getProducts(): Promise<any[]> {
        const res = await fetch(`${BASE_URL}/products?limit=10&skip=0`);

        // fetch only rejects on network failure — an HTTP error still resolves,
        // so the status needs an explicit check before parsing the body.
        if (!res.ok) {
            throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }

        const data: ProductsResponse = await res.json();
        return data.products;
    }
}
