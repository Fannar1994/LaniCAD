/* eslint-disable max-len */
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { QuantityInput } from "@byko/component-quantity-input";
import { Checkbox } from "@byko/component-selectors";
import { getPrice } from "@byko/lib-api-price";
import { useSetRecoilState } from "@byko/lib-recoil";

import { totalPriceState } from "./store";
import {
  CheckAndImageWrapper,
  PriceWrapper,
  ProductImage,
  ProductLineContainer,
  ProductTextBlock,
  Wrapper,
} from "./styles";
import { placeholderImageHandler } from "./placeholder-image-handler";

import type { ProductLineProps } from "./interface";
import type { totalPrice } from "./store";

export const ProductLine = ({
  product,
  variantSku,
  variantPrice,
  quantity,
  handleAddToSelectionList,
  handleRemoveFromSelectionList,
}: ProductLineProps): JSX.Element | null => {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const variant = product.variants.find((item) => item.sku === variantSku);
  const [checked, setChecked] = useState(true);
  const setTotalPrice = useSetRecoilState(totalPriceState);
  useEffect(() => {
    if (variant?.id) {
      if (checked) {
        handleAddToSelectionList({ variantId: variant?.id, quantity: localQuantity, variantSku: variant?.sku ?? "" });
      } else {
        handleRemoveFromSelectionList(variant?.id || product.id);
      }
    }
  }, [
    checked,
    handleAddToSelectionList,
    handleRemoveFromSelectionList,
    localQuantity,
    product,
    product.id,
    variant,
    variant?.id,
  ]);

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  const displayImage = useMemo((): string => {
    if (variant?.firstImage?.image?.productList) {
      return variant?.firstImage?.image?.productList;
    } else if (product.firstImage?.image?.productList) {
      return product.firstImage?.image?.productList;
    } else {
      return "https://www.datocms-assets.com/65892/1664464657-placeholder-do-not-remove.jpg";
    }
  }, [variant?.firstImage?.image?.productList, product.firstImage?.image?.productList]);

  const handleCheckChange = useCallback(() => {
    setChecked((prevState) => !prevState);
  }, []);

  const unitLabel = useMemo(() => {
    if (variant?.meta.unit) {
      return variant?.meta.unit;
    }

    return "stk";
  }, [variant?.meta.unit]);

  const activeVariant = useMemo(() => {
    return variant;
  }, [variant]);

  const price = useMemo(() => {
    if (variantPrice && variantPrice.discounted && variantPrice.price) {
      return {
        batchPrice: {
          gross: getPrice(variantPrice?.price?.gross * localQuantity ?? 0),
          net: getPrice(variantPrice?.price?.net * localQuantity ?? 0),
          vat: getPrice(variantPrice?.price?.vat * localQuantity ?? 0),
        },
        batchDiscounted: {
          gross: getPrice(variantPrice?.discounted?.gross * localQuantity ?? 0),
          vat: getPrice(variantPrice?.discounted?.vat * localQuantity ?? 0),
          net: getPrice(variantPrice?.discounted?.net * localQuantity ?? 0),
        },
        discounted: {
          gross: getPrice(variantPrice?.discounted?.gross ?? 0),
          vat: getPrice(variantPrice?.discounted?.vat ?? 0),
          net: getPrice(variantPrice?.discounted?.net ?? 0),
        },
        price: {
          gross: getPrice(variantPrice?.price?.gross ?? 0),
          vat: getPrice(variantPrice?.price?.vat ?? 0),
          net: getPrice(variantPrice?.price?.net ?? 0),
        },
      };
    } else if (variantPrice && variantPrice.price) {
      return {
        discounted: null,
        batchDiscounted: null,
        batchPrice: {
          gross: getPrice(variantPrice?.price?.gross * localQuantity ?? 0),
          net: getPrice(variantPrice?.price?.net * localQuantity ?? 0),
          vat: getPrice(variantPrice?.price?.vat * localQuantity ?? 0),
        },
        price: {
          gross: getPrice(variantPrice?.price?.gross ?? 0),
          vat: getPrice(variantPrice?.price?.vat ?? 0),
          net: getPrice(variantPrice?.price?.net ?? 0),
        },
      };
    } else {
      return null;
    }
  }, [variantPrice, localQuantity]);

  useEffect(() => {
    setTotalPrice((prices): totalPrice[] => {
      if (prices.find((x) => x.id === variantSku) !== undefined) {
        const arr = [...prices];
        const newPrice: totalPrice = {
          id: variantSku ?? "",
          price: price?.batchPrice.gross?.original ?? 0,
          vat: price?.batchPrice.vat?.original ?? 0,
          discountedVat: price?.batchDiscounted?.vat?.original ?? 0,
          discount: price?.batchDiscounted?.net?.original ?? 0,
          discountTotal: price?.batchDiscounted?.gross?.original
            ? price?.batchDiscounted?.gross?.original
            : (price?.batchPrice.gross?.original ?? 0),
        };
        const foundIndex = prices.findIndex((x) => x.id === newPrice.id);
        if (!checked) {
          if (foundIndex > -1) {
            arr.splice(foundIndex, 1);
          }
          return arr;
        }

        arr[foundIndex] = newPrice;
        return [...arr];
      } else {
        return [
          ...prices,
          {
            id: variantSku ?? "",
            price: price?.batchPrice.gross?.original ?? 0,
            vat: price?.batchPrice.vat?.original ?? 0,
            discountedVat: price?.batchDiscounted?.vat?.original ?? 0,
            discount: price?.batchDiscounted?.net?.original ?? 0,
            discountTotal: price?.batchDiscounted?.gross?.original
              ? price?.batchDiscounted?.gross?.original
              : (price?.batchPrice.gross?.original ?? 0),
          },
        ];
      }
    });

    return () => {
      setTotalPrice((prices) => {
        const arr = [...prices];
        const foundIndex = prices.findIndex((x) => x.id === variantSku);
        if (foundIndex > -1) {
          arr.splice(foundIndex, 1);
        }
        return arr;
      });
    };
  }, [price, setTotalPrice, variantSku, checked]);

  if (variantSku === "" || isNaN(quantity)) return null;

  return (
    <ProductLineContainer>
      <CheckAndImageWrapper>
        <Checkbox checked={checked} onChange={handleCheckChange} />
        <ProductImage src={displayImage} onError={placeholderImageHandler} />
      </CheckAndImageWrapper>
      <ProductTextBlock flexible fullWidth>
        <p className="calculator-list-label">VN: {activeVariant?.sku}</p>
        <Link href={`/vara/${product.slug}`}>
          {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
          }
          <p className="calculator-list-value">{variant?.name}</p>
        </Link>
      </ProductTextBlock>
      <Wrapper>
        {price?.discounted && (
          <ProductTextBlock>
            <p className="calculator-list-label">Einingaverð</p>
            <p className="calculator-list-value">{price.discounted.gross?.humanReadable}</p>
          </ProductTextBlock>
        )}
        {price?.discounted == null && (
          <ProductTextBlock>
            <p className="calculator-list-label">Einingaverð</p>
            <p className="calculator-list-value">{price?.price.gross?.humanReadable}</p>
          </ProductTextBlock>
        )}
        <QuantityInput
          $stretch={true}
          quantity={localQuantity}
          quantityUnit={unitLabel ?? ""}
          setQuantity={setLocalQuantity}
        />
      </Wrapper>
      <PriceWrapper>
        {price?.batchDiscounted && (
          <>
            <ProductTextBlock>
              <p className="calculator-list-label">Verð</p>
              <p className="calculator-list-value strikethrough">{price.batchPrice.gross?.humanReadable}</p>
            </ProductTextBlock>
            <ProductTextBlock>
              <p className="calculator-list-label">Mitt Verð</p>
              <p className="calculator-list-value">{price.batchDiscounted?.gross?.humanReadable}</p>
            </ProductTextBlock>
          </>
        )}
        {price?.batchDiscounted === null && (
          <>
            {/* Note(Andri): this exists to create better alignment for price breakdowns where only part of the products have discounts */}
            <ProductTextBlock>
              <div className="calculator-list-label" />
              <div className="calculator-list-value strikethrough" />
            </ProductTextBlock>
            <ProductTextBlock>
              <p className="calculator-list-label">Verð</p>
              <p className="calculator-list-value">{price?.batchPrice?.gross?.humanReadable}</p>
            </ProductTextBlock>
          </>
        )}
      </PriceWrapper>
    </ProductLineContainer>
  );
};
