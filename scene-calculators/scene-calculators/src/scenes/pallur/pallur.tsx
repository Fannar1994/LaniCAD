import React, { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";

import { PageContainer } from "@byko/component-page-container";
import { Card } from "@byko/component-cards";
import { Select } from "@byko/component-select";
import { Button } from "@byko/component-buttons";
import { Input } from "@byko/component-inputs";
import { Checkbox } from "@byko/component-selectors";
import { useCart } from "@byko/hooks-cart";
import { restApi } from "@byko/lib-api-rest";
import { useProductPrices } from "@byko/lib-api-products";
import { LongArrowSideIcons } from "@byko/lib-icons";
import { theme } from "@byko/lib-styles";

import { configuration, productIdList } from "./configuration";
import { useCalculateProductList } from "./calculator";
import { SelectionBlock } from "./selection-block";

import {
  ButtonActionContainer,
  CardInner,
  ContentContainer,
  InputBlock,
  Label,
  SectionBlock,
  SelectionContainer,
} from "../styles";
import { ProductListBlock, handleItemToStringCb } from "../shared";

import type { ChangeEvent } from "react";
import type { Configuration } from "./interface";
import type { ProductSelection } from "../shared";
import type { SortingOption } from "../interface";

export const Pallur = (): JSX.Element => {
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([]);
  const { setCartQuantity, isLoading } = useCart();
  const { data: products, isLoading: isLoadingProducts } = useQuery(
    productIdList,
    async () => {
      const response = await restApi.productsList({
        // The swagger type definition is wrong, it should be a komma delimiter string
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: productIdList.join(","),
      });

      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const [showResults, setShowResults] = useState(false);

  const [config, setConfig] = useState<Configuration>({
    selectedVariationId: 0,
    selectedMaterialId: 0,
    selectedCylinderSizeId: 0,
    selectedWidth: "4",
    selectedLength: "1.8",
    showExtraValues: false,
  });

  const activeVariation = useMemo(() => {
    return configuration.variation.items.find((variation) => variation.id === config.selectedVariationId);
  }, [config.selectedVariationId]);

  const selectedMaterial = useMemo(() => {
    return configuration.materials.materials.items.find((item) => item.id === config.selectedMaterialId);
  }, [config.selectedMaterialId]);

  const activeCylinderSize = useMemo(() => {
    return configuration.sizes.cylinderSize.items.find((item) => item.id === config.selectedCylinderSizeId);
  }, [config.selectedCylinderSizeId]);

  const { purchaseList } = useCalculateProductList({
    config,
    products,
    selectedMaterial,
    activeVariation,
    activeCylinderSize,
  });

  const { prices: fixedPrices, loadingPrices: loadingProductPrices } = useProductPrices([
    "00302906",
    "248067",
    "248063",
    "302906",
    "169380",
    "169382",
    "199076",
    "169949",
    "169933",
    "169434",
    "204647",
    "339339",
    "248053",
    "248055",
    "201110",
    "248018",
    "218657",
    "248033",
    "299285",
    "299287",
    "339243",
    "339245",
    "339247",
    "248024",
    "248026",
    "342791",
    "312762",
    "343597",
    "364742",
    "194278",
    "255213",
    "194165",
    "353734",
  ]);

  const setVariationSelection = useCallback((id: number) => {
    setConfig((prevState) => ({
      ...prevState,
      selectedVariationId: id,
    }));
  }, []);

  const handleItemToString = useCallback(handleItemToStringCb, []);

  const handleWoodMaterialChange = useCallback((value: { selectedItem?: SortingOption | null } | null) => {
    setConfig((prevState) => ({
      ...prevState,
      selectedMaterialId: value?.selectedItem?.id ?? 0,
    }));
  }, []);

  const handleCylinderSizeChange = useCallback((value: { selectedItem?: SortingOption | null } | null) => {
    setConfig((prevState) => ({
      ...prevState,
      selectedCylinderSizeId: value?.selectedItem?.id ?? 0,
    }));
  }, []);

  const handleChangeWidth = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // use regext to test the value for numbers, decimals or empty string

    const regex = /^(\d+\,?\d*|\,\d+)?$/;
    if (regex.test(value)) {
      setConfig((prevState) => ({
        ...prevState,
        selectedWidth: value.replace(",", "."),
      }));
    }
  }, []);

  const handleChangeLength = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // use regext to test the value for numbers, decimals or empty string
    const regex = /^(\d+\,?\d*|\,\d+)?$/;
    if (regex.test(value)) {
      setConfig((prevState) => ({
        ...prevState,
        selectedLength: value.replace(",", "."),
      }));
    }
  }, []);

  const toggleShowExtraValues = useCallback(() => {
    setConfig((prevState) => ({
      ...prevState,
      showExtraValues: !prevState.showExtraValues,
    }));
  }, []);

  const SQMValue = (
    Math.round((parseFloat(config.selectedWidth) * parseFloat(config.selectedLength) + Number.EPSILON) * 100) / 100
  ).toString();

  const handleShowResults = useCallback(() => {
    setShowResults(true);

    setTimeout(() => {
      const elementToScrollTo = document.querySelector("#nidurstodur");

      if (elementToScrollTo) {
        const offset = 100;
        const elementPosition = elementToScrollTo.getBoundingClientRect().top + window.pageYOffset;
        const targetPosition = elementPosition - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  }, []);

  const handleAddToSelectionList = useCallback(({ quantity, variantId, variantSku }: ProductSelection) => {
    setSelectedProducts((prevSelectedProducts) => {
      const existingProduct = prevSelectedProducts.find((product) => product.variantId === variantId);

      if (existingProduct) {
        return prevSelectedProducts.map((product) => {
          if (product.variantId === variantId) {
            return {
              ...product,
              quantity,
              variantSku,
            };
          }

          return product;
        });
      }

      return [...prevSelectedProducts, { variantId, quantity, variantSku }];
    });
  }, []);

  const handleRemoveFromSelectionList = useCallback((variantId: number) => {
    setSelectedProducts((prevSelectedProducts) => {
      return prevSelectedProducts.filter((product) => product.variantId !== variantId);
    });
  }, []);

  const handleAddSelectionToCart = useCallback(() => {
    selectedProducts.forEach(({ quantity, variantId }) => {
      setCartQuantity({ quantity, variantId });
    });
  }, [selectedProducts, setCartQuantity]);

  return (
    <>
      <PageContainer flexDirection="column" offsetNav={false}>
        <ContentContainer>
          <Card>
            <>
              <CardInner>
                <SectionBlock>
                  <h6>{configuration.variation.label}</h6>
                  <SelectionContainer>
                    {configuration.variation.items.map((variation) => (
                      <SelectionBlock
                        key={variation.id}
                        selectedVariationId={config.selectedVariationId}
                        setVariationSelection={setVariationSelection}
                        variation={variation}
                      />
                    ))}
                  </SelectionContainer>
                </SectionBlock>
                <SectionBlock>
                  <h6>{configuration.materials.label}</h6>
                  <SelectionContainer>
                    <InputBlock>
                      <Label>{configuration.materials.materials.label}</Label>
                      <Select
                        align="left"
                        fit={true}
                        handleSelectedItemChange={handleWoodMaterialChange}
                        hideDefaultPlaceholder={true}
                        hideValue={true}
                        items={configuration.materials.materials.items}
                        itemToString={handleItemToString}
                        placeholder={
                          configuration.materials.materials.items[config.selectedMaterialId]?.label ?? "Veldu efni"
                        }
                        selectedItem={configuration.materials.materials.items[config.selectedMaterialId]}
                        textColor={theme.palette.blue.dark}
                      />
                    </InputBlock>
                  </SelectionContainer>
                </SectionBlock>
                <SectionBlock>
                  <h6>{configuration.sizes.label}</h6>

                  <SelectionContainer>
                    <Checkbox
                      checked={config.showExtraValues}
                      label={configuration.sizes.showExtraValues.label}
                      onChange={toggleShowExtraValues}
                    />
                  </SelectionContainer>
                  <SelectionContainer>
                    <InputBlock>
                      <Label>{configuration.sizes.length.label}</Label>
                      <Input
                        $stretch={true}
                        value={config.selectedLength.replace(".", ",")}
                        onChange={handleChangeLength}
                      />
                    </InputBlock>
                    <InputBlock>
                      <Label>{configuration.sizes.width.label}</Label>
                      <Input
                        $stretch={true}
                        value={config.selectedWidth.replace(".", ",")}
                        onChange={handleChangeWidth}
                      />
                    </InputBlock>
                    <InputBlock>
                      <Label>Fermetrar: (fm&sup2;)</Label>
                      <Input
                        $stretch={true}
                        disabled={true}
                        value={SQMValue === "NaN" ? "" : SQMValue.replace(".", ",")}
                        onChange={handleChangeWidth}
                      />
                    </InputBlock>
                    {config.showExtraValues && (
                      <InputBlock>
                        <Label>{configuration.sizes.cylinderSize.label}</Label>
                        <Select
                          align="left"
                          fit={true}
                          handleSelectedItemChange={handleCylinderSizeChange}
                          hideDefaultPlaceholder={true}
                          hideValue={true}
                          items={configuration.sizes.cylinderSize.items}
                          itemToString={handleItemToString}
                          placeholder={
                            configuration.sizes.cylinderSize.items[config.selectedCylinderSizeId]?.label ??
                            "Veldu stærð"
                          }
                          selectedItem={configuration.sizes.cylinderSize.items[config.selectedCylinderSizeId]}
                          textColor={theme.palette.blue.dark}
                        />
                      </InputBlock>
                    )}
                  </SelectionContainer>
                </SectionBlock>
              </CardInner>
              <ButtonActionContainer>
                {
                  <Button
                    $buttonColor="blueButton"
                    icon={LongArrowSideIcons}
                    label="Reikna dæmið"
                    onClick={handleShowResults}
                  />
                }
              </ButtonActionContainer>
            </>
          </Card>

          {purchaseList && showResults && (
            <ProductListBlock
              key={activeVariation?.id}
              handleAddSelectionToCart={handleAddSelectionToCart}
              handleAddToSelectionList={handleAddToSelectionList}
              handleRemoveFromSelectionList={handleRemoveFromSelectionList}
              loading={isLoadingProducts || loadingProductPrices}
              loadingCart={isLoading}
              // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
              prices={fixedPrices ?? {}}
              products={purchaseList}
              selectedProducts={selectedProducts}
            />
          )}
        </ContentContainer>
      </PageContainer>
    </>
  );
};
