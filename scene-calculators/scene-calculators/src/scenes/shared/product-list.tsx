/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useMemo } from "react";

import { Card } from "@byko/component-cards";
import { LargeMainLoader } from "@byko/component-loaders";
import { formatPriceNumber } from "@byko/lib-utils";
import { ProductLine } from "./product-line";
import { BreakdownContainer, CardInner, PriceAmount, PriceRow, PriceTitle, PriceTotals, ProductLines } from "../styles";
import { useRecoilValue } from "@byko/lib-recoil";
import { totalPriceState } from "./store";
import type { ProductListBlockProps } from "./interface";

export const ProductListBlock = ({
  products,
  loading,
  prices,
  handleAddToSelectionList,
  handleRemoveFromSelectionList,
  selectedProducts,
}: ProductListBlockProps): JSX.Element => {
  const totalPrice = useRecoilValue(totalPriceState);

  const totalPriceSum = useMemo(() => {
    return totalPrice
      .filter((item) => item.price)
      .reduce((acc, item) => {
        const existsInSelection = selectedProducts.find((product) => {
          return product.variantSku === item.id;
        });
        if (existsInSelection) {
          return acc + item.price;
        } else {
          return acc;
        }
      }, 0);
  }, [selectedProducts, totalPrice]);

  const totalVskSum = useMemo(() => {
    return totalPrice
      .filter((item) => item.vat)
      .reduce((acc, item) => {
        const existsInSelection = selectedProducts.find((product) => {
          return product.variantSku === item.id;
        });
        if (existsInSelection) {
          return acc + item.vat;
        } else {
          return acc;
        }
      }, 0);
  }, [selectedProducts, totalPrice]);

  const totalDiscountedVskSum = useMemo(() => {
    return totalPrice
      .filter((item) => item.discountedVat)
      .reduce((acc, item) => {
        const existsInSelection = selectedProducts.find((product) => {
          return product.variantSku === item.id;
        });
        if (existsInSelection) {
          return acc + item.discountedVat;
        } else {
          return acc;
        }
      }, 0);
  }, [selectedProducts, totalPrice]);

  const totalDiscountSum = useMemo(() => {
    return totalPrice
      .filter((item) => item.discount)
      .reduce((acc, item) => {
        const existsInSelection = selectedProducts.find((product) => {
          return product.variantSku === item.id;
        });
        if (existsInSelection) {
          return acc + item.price - item.discount - item.discountedVat;
        } else {
          return acc;
        }
      }, 0);
  }, [selectedProducts, totalPrice]);

  const totalDiscounTotaltSum = useMemo(() => {
    return totalPrice
      .filter((item) => item.discountTotal)
      .reduce((acc, item) => {
        const existsInSelection = selectedProducts.find((product) => {
          return product.variantSku === item.id;
        });
        if (existsInSelection) {
          return acc + item.discountTotal;
        } else {
          return acc;
        }
      }, 0);
  }, [selectedProducts, totalPrice]);

  return (
    <>
      <div id="nidurstodur" />
      {loading && (
        <BreakdownContainer>
          <h6>Sæki gögn</h6>
          <LargeMainLoader />
        </BreakdownContainer>
      )}
      {!loading && (
        <Card>
          <CardInner>
            {products && (
              <ProductLines>
                {products.map((product) => (
                  <ProductLine
                    key={product.key}
                    handleAddToSelectionList={handleAddToSelectionList}
                    handleRemoveFromSelectionList={handleRemoveFromSelectionList}
                    product={product.item}
                    quantity={product.quantity}
                    variantPrice={prices?.[product.variantSku]}
                    variantSku={product.variantSku}
                  />
                ))}
              </ProductLines>
            )}
            <PriceTotals>
              <PriceRow>
                <PriceTitle>AFSLÁTTUR</PriceTitle>
                <PriceAmount>{formatPriceNumber(totalDiscountSum)}</PriceAmount>
              </PriceRow>
              <PriceRow>
                <PriceTitle>VSK.</PriceTitle>
                <PriceAmount>
                  {formatPriceNumber(totalDiscountedVskSum === 0 ? totalVskSum : totalDiscountedVskSum)}
                </PriceAmount>
              </PriceRow>
              <PriceRow>
                <PriceTitle className="bold">SAMTALS</PriceTitle>
                <PriceAmount className="bold">
                  {formatPriceNumber(totalDiscounTotaltSum === 0 ? totalPriceSum : totalDiscounTotaltSum)}
                </PriceAmount>
              </PriceRow>
            </PriceTotals>
            {/*<ButtonActionContainer>
              <ButtonInner>
                <Button
                  $buttonColor="blueButton"
                  disabled={loadingCart}
                  icon={LongArrowSideIcons}
                  label="Setja valdar vörur í körfu"
                  $stretch={true}
                  onClick={handleAddSelectionToCart}
                />
              </ButtonInner>
                </ButtonActionContainer>*/}
          </CardInner>
        </Card>
      )}
    </>
  );
};
