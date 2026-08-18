import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ProductService } from "../services/ProductService";

type ProductsContextType = {
    products: any[];
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        async function loadProducts() {
            setProducts(await ProductService.getProducts());
        }

        loadProducts();
    }, []);

    const value = useMemo(() => ({ products }), [products]);

    return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
    return useContext(ProductsContext);
}
