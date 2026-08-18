import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ProductsContextType = {
    products: any[];
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch("https://dummyjson.com/products?limit=10&skip=0");
            const data = await res.json();
            setProducts(data.products);
        }

        fetchData();
    }, []);

    const value = useMemo(() => ({ products }), [products]);

    return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
    return useContext(ProductsContext);
}
