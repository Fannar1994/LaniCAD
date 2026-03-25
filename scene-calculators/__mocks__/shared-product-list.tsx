// Mock for shared components that the calculators import

import React from "react";

export const ProductListBlock = ({ products }: any) => {
  return (
    <div style={{ marginTop: "2rem", padding: "1rem", background: "#f0f0f0", borderRadius: "4px" }}>
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        <strong>Cart Integration:</strong> This component will be fully functional when integrated 
        into the BYKO system. Products ready to add to cart: {products?.productList?.length || 0}
      </p>
    </div>
  );
};
