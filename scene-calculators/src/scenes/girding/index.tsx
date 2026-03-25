/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react-perf/jsx-no-new-function-as-prop */
/* eslint-disable react/jsx-no-bind */
import { Button } from "@byko/component-buttons";
import { Card } from "@byko/component-cards";
import { Input } from "@byko/component-inputs";
import { LargeMainLoader } from "@byko/component-loaders";
import { PageContainer } from "@byko/component-page-container";
import { Select } from "@byko/component-select";
import { useProductPrices } from "@byko/lib-api-products";
import { restApi } from "@byko/lib-api-rest";
import { LongArrowSideIcons } from "@byko/lib-icons";
import { useRecoilValue } from "@byko/lib-recoil";
import { theme } from "@byko/lib-styles";
import { formatPriceNumber } from "@byko/lib-utils";
import type { ChangeEvent } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";
import type { GirdingVariation } from "../interface";
import type { ProductListItem, ProductSelection } from "../shared";
import { ProductLine } from "../shared";
import { totalPriceState } from "../shared/store";
import {
  BreakdownContainer,
  ButtonActionContainer,
  CardInner,
  ContentContainer,
  InputBlock,
  InputBlockInner,
  Label,
  PriceAmount,
  PriceRow,
  PriceTitle,
  PriceTotals,
  ProductLines,
  SectionBlock,
  SelectionContainer,
  SelectionImage,
  SelectionItem,
  SelectionLabel,
} from "../styles";
import { configuration } from "./configuration";
import type { ProductType, ProductTypePurpose } from "./products";
import { PRODUCTS, RAW_PRODUCT_IDS } from "./products";

interface Configuration {
  selectedVariationId: number;
  selectedCladdingId: number;
  selectedMaterialId: number;
  selectedStakes: string;
  selectedWidth: string;
  selectedHeight: string;
}

interface SortingOption {
  label: string;
  value: string;
  active?: boolean;
  id: number;
}

export const Girding = (): JSX.Element => {
  const [showResults, setShowResults] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([]);

  const [config, setConfig] = useState<Configuration>({
    selectedVariationId: 0,
    selectedCladdingId: 0,
    selectedMaterialId: 0,
    selectedStakes: "1.8", // constant, do not change
    selectedWidth: "4",
    selectedHeight: "1.8",
  });

  const { prices: fixedPrices, loadingPrices } = useProductPrices(RAW_PRODUCT_IDS);

  const { data: products, isLoading: loadingProducts } = useQuery(
    RAW_PRODUCT_IDS,
    async () => {
      const response = await restApi.productsList({
        // The swagger type definition is wrong, it should be a komma delimiter string
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: RAW_PRODUCT_IDS.join(","),
      });

      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const loading = loadingPrices || loadingProducts;

  const purchaseList = useMemo(() => {
    if (products == null) {
      return [];
    }

    const variantProducts: ProductListItem[] = [];

    const selectedVariants: { sku: string; purpose: ProductTypePurpose; item: ProductType; quantity: number }[] = [];

    // Tegund girðingar:
    const tegund = configuration.variation.items.find((variation) => variation.id === config.selectedVariationId);

    const klæðning = PRODUCTS.viður.klæðning[config.selectedMaterialId];

    const bilMilliStaura = 1.8; // metrar
    const fjöldiBila = Math.ceil(parseFloat(config.selectedWidth) / bilMilliStaura);
    const fjöldiStaura = fjöldiBila + 1;
    const stöðluðLengdPlanka = 3.6; // metrar

    // Viður:
    const langbönd = PRODUCTS.viður.langbönd[0];
    const staurar = PRODUCTS.viður.staurar[0];
    const klæðningargrind = PRODUCTS.viður.klæðningargrind[0];
    const topplisti = PRODUCTS.viður.topplisti[0];

    // Skrúfur:
    const skrúfurKlæðning = PRODUCTS.skrúfur.klæðning[0];
    const skrúfurLangbönd = PRODUCTS.skrúfur.langbönd[0];
    const skrúfurKlæðningargrind = PRODUCTS.skrúfur.klæðningargrind[0];
    const skrúfurTopplisti = PRODUCTS.skrúfur.klæðning[0]; // Follows the selection of Klæðning
    const kambskrúfur = PRODUCTS.skrúfur.kambskrúfur[0];

    // Annað:
    const staurasteypa = PRODUCTS.annað.staurasteypa[0];
    const vinkill = PRODUCTS.annað.vinkill[0];
    const blikkhólkur = PRODUCTS.annað.blikkhólkur[0];

    if (
      klæðning == null ||
      langbönd == null ||
      staurar == null ||
      klæðningargrind == null ||
      topplisti == null ||
      skrúfurKlæðning == null ||
      skrúfurLangbönd == null ||
      skrúfurKlæðningargrind == null ||
      skrúfurTopplisti == null ||
      kambskrúfur == null ||
      staurasteypa == null ||
      vinkill == null ||
      blikkhólkur == null
    ) {
      return [];
    }

    let klæðningLengdarmetrar,
      klæðningStykki,
      klæðningargrindStykki,
      langböndStykki,
      staurarStykki,
      hólkarStykki,
      steypaStykki,
      vinklarStykki,
      topplistiStykki,
      skrúfurKlæðningargrindStykki,
      skrúfurLangböndStykki,
      skrúfurTopplistiStykki,
      skrúfurKlæðningStykki,
      kambskrúfurStykki;

    const tvöföldGirðing = config.selectedCladdingId === 1;
    switch (tegund?.value) {
      case "lodrett-milli-staura":
        klæðningLengdarmetrar = calculateKlæðningMilliStauraLengdarmetrar({
          lengd: parseFloat(config.selectedWidth),
          hæð: parseFloat(config.selectedHeight),
          tvöföld: tvöföldGirðing,
          efnisbreidd: klæðning.widthInMeters,
        });
        klæðningStykki = calculateKlæðningStykki({
          lengdarmetrar: klæðningLengdarmetrar,
          lengdPlanka: stöðluðLengdPlanka,
        });
        selectedVariants.push({
          sku: klæðning.variantId,
          purpose: "klæðning",
          item: klæðning,
          quantity: Math.ceil(klæðningStykki),
        });

        langböndStykki = calculateLangböndStykki({
          lengd: parseFloat(config.selectedWidth),
          hæð: parseFloat(config.selectedHeight),
          efnislengd: klæðning.lengthInMeters,
        });
        selectedVariants.push({
          sku: langbönd.variantId,
          purpose: "langbönd",
          item: langbönd,
          quantity: Math.ceil(langböndStykki),
        });

        skrúfurLangböndStykki = calculateSkrúfurLangböndStykki({
          lengd: parseFloat(config.selectedWidth),
          bil: bilMilliStaura,
          skrúfurPerPakka: skrúfurLangbönd.itemsPerPackage,
        });
        selectedVariants.push({
          sku: skrúfurLangbönd.variantId,
          purpose: "skrúfur langbönd",
          item: skrúfurLangbönd,
          quantity: Math.ceil(skrúfurLangböndStykki),
        });

        staurarStykki = calculateStaurarStykki({
          bil: fjöldiBila,
        });
        selectedVariants.push({
          sku: staurar.variantId,
          purpose: "staurar",
          item: staurar,
          quantity: Math.ceil(staurarStykki),
        });

        hólkarStykki = calculateHólkarStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: blikkhólkur.variantId,
          purpose: "blikkhólkar",
          item: blikkhólkur,
          quantity: Math.ceil(hólkarStykki),
        });

        steypaStykki = calculateSteypaStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: staurasteypa.variantId,
          purpose: "staurasteypa",
          item: staurasteypa,
          quantity: Math.ceil(steypaStykki),
        });

        vinklarStykki = calculateVinklarStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: vinkill.variantId,
          purpose: "vinklar",
          item: vinkill,
          quantity: Math.ceil(vinklarStykki),
        });

        topplistiStykki = calculateTopplistiStykki({
          lengd: parseFloat(config.selectedWidth),
          lengdPlanka: stöðluðLengdPlanka,
        });
        skrúfurTopplistiStykki = calculateSkrúfurTopplisti({
          lengd: parseFloat(config.selectedWidth),
          skrúfurPerPakka: skrúfurTopplisti.itemsPerPackage,
        });
        if (tvöföldGirðing) {
          selectedVariants.push({
            sku: topplisti.variantId,
            purpose: "topplisti",
            item: topplisti,
            quantity: Math.ceil(topplistiStykki),
          });
          selectedVariants.push({
            sku: skrúfurTopplisti.variantId,
            purpose: "skrúfur topplisti",
            item: skrúfurTopplisti,
            quantity: Math.ceil(skrúfurTopplistiStykki),
          });
        }

        skrúfurKlæðningStykki = calculateSkrúfurKlæðningStykki({
          lengdarmetrar: klæðningLengdarmetrar,
          bil: bilMilliStaura,
          skrúfurPerPakka: skrúfurKlæðning.itemsPerPackage,
        });
        selectedVariants.push({
          sku: skrúfurKlæðning.variantId,
          purpose: "skrúfur klæðning",
          item: skrúfurKlæðning,
          quantity: Math.ceil(skrúfurKlæðningStykki),
        });
        kambskrúfurStykki = calculateKambskrúfurStykki({
          vinklar: vinklarStykki,
          skrúfurPerPakka: kambskrúfur.itemsPerPackage,
        });
        selectedVariants.push({
          sku: kambskrúfur.variantId,
          purpose: "kambskrúfur",
          item: kambskrúfur,
          quantity: Math.ceil(kambskrúfurStykki),
        });
        break;
      case "larett-milli-staura":
        klæðningLengdarmetrar = calculateKlæðningMilliStauraLengdarmetrar({
          lengd: parseFloat(config.selectedWidth),
          hæð: parseFloat(config.selectedHeight),
          tvöföld: tvöföldGirðing,
          efnisbreidd: klæðning.widthInMeters,
        });
        klæðningStykki = calculateKlæðningStykki({
          lengdarmetrar: klæðningLengdarmetrar,
          lengdPlanka: stöðluðLengdPlanka,
        });
        selectedVariants.push({
          sku: klæðning.variantId,
          purpose: "klæðning",
          item: klæðning,
          quantity: Math.ceil(klæðningStykki),
        });

        klæðningargrindStykki = calculateKlæðningargrindStykki({
          bil: fjöldiBila,
        });
        selectedVariants.push({
          sku: klæðningargrind.variantId,
          purpose: "klæðningargrind",
          item: klæðningargrind,
          quantity: Math.ceil(klæðningargrindStykki),
        });

        staurarStykki = calculateStaurarStykki({
          bil: fjöldiBila,
        });
        selectedVariants.push({
          sku: staurar.variantId,
          purpose: "staurar",
          item: staurar,
          quantity: Math.ceil(staurarStykki),
        });

        hólkarStykki = calculateHólkarStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: blikkhólkur.variantId,
          purpose: "blikkhólkar",
          item: blikkhólkur,
          quantity: Math.ceil(hólkarStykki),
        });

        steypaStykki = calculateSteypaStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: staurasteypa.variantId,
          purpose: "staurasteypa",
          item: staurasteypa,
          quantity: Math.ceil(steypaStykki),
        });

        vinklarStykki = calculateVinklarStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: vinkill.variantId,
          purpose: "vinklar",
          item: vinkill,
          quantity: Math.ceil(vinklarStykki),
        });

        topplistiStykki = calculateTopplistiStykki({
          lengd: parseFloat(config.selectedWidth),
          lengdPlanka: stöðluðLengdPlanka,
        });
        skrúfurTopplistiStykki = calculateSkrúfurTopplisti({
          lengd: parseFloat(config.selectedWidth),
          skrúfurPerPakka: skrúfurTopplisti.itemsPerPackage,
        });
        if (tvöföldGirðing) {
          selectedVariants.push({
            sku: topplisti.variantId,
            purpose: "topplisti",
            item: topplisti,
            quantity: Math.ceil(topplistiStykki),
          });
          selectedVariants.push({
            sku: skrúfurTopplisti.variantId,
            purpose: "skrúfur topplisti",
            item: skrúfurTopplisti,
            quantity: Math.ceil(skrúfurTopplistiStykki),
          });
        }
        skrúfurKlæðningargrindStykki = calculateSkrúfurKlæðningargrindStykki({
          lengd: parseFloat(config.selectedWidth),
          bil: bilMilliStaura,
          skrúfurPerPakka: skrúfurKlæðningargrind.itemsPerPackage,
        });

        selectedVariants.push({
          sku: skrúfurKlæðningargrind.variantId,
          purpose: "skrúfur klæðningargrind",
          item: skrúfurKlæðningargrind,
          quantity: Math.ceil(skrúfurKlæðningargrindStykki),
        });

        skrúfurKlæðningStykki = calculateSkrúfurKlæðningStykki({
          lengdarmetrar: klæðningLengdarmetrar,
          bil: bilMilliStaura,
          skrúfurPerPakka: skrúfurKlæðning.itemsPerPackage,
        });
        selectedVariants.push({
          sku: skrúfurKlæðning.variantId,
          purpose: "skrúfur klæðning",
          item: skrúfurKlæðning,
          quantity: Math.ceil(skrúfurKlæðningStykki),
        });
        kambskrúfurStykki = calculateKambskrúfurStykki({
          vinklar: vinklarStykki,
          skrúfurPerPakka: kambskrúfur.itemsPerPackage,
        });
        selectedVariants.push({
          sku: kambskrúfur.variantId,
          purpose: "kambskrúfur",
          item: kambskrúfur,
          quantity: Math.ceil(kambskrúfurStykki),
        });
        break;
      case "larett-yfir-staura":
        klæðningLengdarmetrar = calculateKlæðningYfirStaurLengdarmetrar({
          lengd: parseFloat(config.selectedWidth),
          hæð: parseFloat(config.selectedHeight),
          tvöföld: tvöföldGirðing,
          efnisbreidd: klæðning.widthInMeters,
        });
        klæðningStykki = calculateKlæðningStykki({
          lengdarmetrar: klæðningLengdarmetrar,
          lengdPlanka: stöðluðLengdPlanka,
        });
        selectedVariants.push({
          sku: klæðning.variantId,
          purpose: "klæðning",
          item: klæðning,
          quantity: Math.ceil(klæðningStykki),
        });

        klæðningargrindStykki = calculateKlæðningargrindStykki({
          bil: fjöldiBila,
        });
        selectedVariants.push({
          sku: klæðningargrind.variantId,
          purpose: "klæðningargrind",
          item: klæðningargrind,
          quantity: Math.ceil(klæðningargrindStykki),
        });

        staurarStykki = calculateStaurarStykki({
          bil: fjöldiBila,
        });
        selectedVariants.push({
          sku: staurar.variantId,
          purpose: "staurar",
          item: staurar,
          quantity: Math.ceil(staurarStykki),
        });

        hólkarStykki = calculateHólkarStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: blikkhólkur.variantId,
          purpose: "blikkhólkar",
          item: blikkhólkur,
          quantity: Math.ceil(hólkarStykki),
        });

        steypaStykki = calculateSteypaStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: staurasteypa.variantId,
          purpose: "staurasteypa",
          item: staurasteypa,
          quantity: Math.ceil(steypaStykki),
        });

        vinklarStykki = calculateVinklarStykki({
          staurar: fjöldiStaura,
        });
        selectedVariants.push({
          sku: vinkill.variantId,
          purpose: "vinklar",
          item: vinkill,
          quantity: Math.ceil(vinklarStykki),
        });

        topplistiStykki = calculateTopplistiStykki({
          lengd: parseFloat(config.selectedWidth),
          lengdPlanka: stöðluðLengdPlanka,
        });
        skrúfurTopplistiStykki = calculateSkrúfurTopplisti({
          lengd: parseFloat(config.selectedWidth),
          skrúfurPerPakka: skrúfurTopplisti.itemsPerPackage,
        });
        if (tvöföldGirðing) {
          selectedVariants.push({
            sku: topplisti.variantId,
            purpose: "topplisti",
            item: topplisti,
            quantity: Math.ceil(topplistiStykki),
          });
          selectedVariants.push({
            sku: skrúfurTopplisti.variantId,
            purpose: "skrúfur topplisti",
            item: skrúfurTopplisti,
            quantity: Math.ceil(skrúfurTopplistiStykki),
          });
        }

        skrúfurKlæðningargrindStykki = calculateSkrúfurKlæðningargrindStykki({
          lengd: parseFloat(config.selectedWidth),
          bil: bilMilliStaura,
          skrúfurPerPakka: skrúfurKlæðningargrind.itemsPerPackage,
        });

        selectedVariants.push({
          sku: skrúfurKlæðningargrind.variantId,
          purpose: "skrúfur klæðningargrind",
          item: skrúfurKlæðningargrind,
          quantity: Math.ceil(skrúfurKlæðningargrindStykki),
        });

        skrúfurKlæðningStykki = calculateSkrúfurKlæðningStykki({
          lengdarmetrar: klæðningLengdarmetrar,
          bil: bilMilliStaura,
          skrúfurPerPakka: skrúfurKlæðning.itemsPerPackage,
        });
        selectedVariants.push({
          sku: skrúfurKlæðning.variantId,
          purpose: "skrúfur klæðning",
          item: skrúfurKlæðning,
          quantity: Math.ceil(skrúfurKlæðningStykki),
        });
        kambskrúfurStykki = calculateKambskrúfurStykki({
          vinklar: vinklarStykki,
          skrúfurPerPakka: kambskrúfur.itemsPerPackage,
        });
        selectedVariants.push({
          sku: kambskrúfur.variantId,
          purpose: "kambskrúfur",
          item: kambskrúfur,
          quantity: Math.ceil(kambskrúfurStykki),
        });
        break;
    }

    selectedVariants.forEach((variant, index) => {
      const item = products.results?.find((product) =>
        product.variants.some((productVariant) => productVariant.sku === variant.sku),
      );

      if (item != null) {
        variantProducts.push({
          key: index,
          item: item,
          quantity: variant.quantity,
          variantSku: variant.sku,
        });
      }
    });

    return variantProducts;
  }, [config, products]);

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

  // config handlers

  const handleItemToString = useCallback((option: { label?: string | null } | null): string => option?.label ?? "", []);

  const handleMaterialChange = useCallback((value: { selectedItem?: SortingOption | null } | null) => {
    setConfig((prevState) => ({
      ...prevState,
      selectedMaterialId: value?.selectedItem?.id ?? 0,
    }));
  }, []);

  const setVariationSelection = useCallback((id: number) => {
    setConfig((prevState) => ({
      ...prevState,
      selectedVariationId: id,
    }));
  }, []);

  const handleCladdingChange = useCallback((value: { selectedItem?: SortingOption | null } | null) => {
    setConfig((prevState) => ({
      ...prevState,
      selectedCladdingId: value?.selectedItem?.id ?? 0,
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

  const handleChangeHeight = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // use regext to test the value for numbers, decimals or empty string
    const regex = /^(\d+\,?\d*|\,\d+)?$/;
    if (regex.test(value)) {
      // if floating point value is above 1.8, set to to 1.8
      const numericValue = parseFloat(value.replace(",", "."));
      if (numericValue > 1.8) {
        value = "1,8";
      }
      setConfig((prevState) => ({
        ...prevState,
        selectedHeight: value.replace(",", "."),
      }));
    }
  }, []);

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
                        handleSelectedItemChange={handleMaterialChange}
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
                    <InputBlock>
                      <Label>{configuration.materials.claddings.label}</Label>
                      <Select
                        align="left"
                        fit={true}
                        handleSelectedItemChange={handleCladdingChange}
                        hideDefaultPlaceholder={true}
                        hideValue={true}
                        items={configuration.materials.claddings.items}
                        itemToString={handleItemToString}
                        placeholder={
                          configuration.materials.claddings.items[config.selectedCladdingId]?.label ?? "Veldu klæðningu"
                        }
                        selectedItem={configuration.materials.claddings.items[config.selectedCladdingId]}
                        textColor={theme.palette.blue.dark}
                      />
                    </InputBlock>
                  </SelectionContainer>
                </SectionBlock>
                <SectionBlock>
                  <h6>{configuration.sizes.label}</h6>
                  <SelectionContainer>
                    <InputBlock>
                      <InputBlockInner>
                        <Label>{configuration.sizes.height.label} </Label>
                        <p>(hámark 1,8 metrar)</p>
                      </InputBlockInner>
                      <Input
                        $stretch={true}
                        value={config.selectedHeight.replace(".", ",")}
                        onChange={handleChangeHeight}
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
                  </SelectionContainer>
                </SectionBlock>
                <p>* Útreikningar gera ráð fyrir 1,8 metra bili á milli staura</p>
              </CardInner>
              <ButtonActionContainer>
                <Button
                  $buttonColor="blueButton"
                  icon={LongArrowSideIcons}
                  label="Reikna dæmið"
                  onClick={handleShowResults}
                />
              </ButtonActionContainer>
            </>
          </Card>

          <div id="nidurstodur" />
          {loading && showResults && (
            <BreakdownContainer>
              <h6>Sæki gögn</h6>
              <LargeMainLoader />
            </BreakdownContainer>
          )}
          {!loading && showResults && (
            <Card>
              <CardInner>
                {products && (
                  <ProductLines>
                    {purchaseList.map((product) => (
                      <ProductLine
                        key={product.key}
                        handleAddToSelectionList={handleAddToSelectionList}
                        handleRemoveFromSelectionList={handleRemoveFromSelectionList}
                        product={product.item}
                        quantity={product.quantity}
                        variantPrice={fixedPrices?.[product.variantSku]}
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
              </CardInner>
            </Card>
          )}
        </ContentContainer>
      </PageContainer>
    </>
  );
};

// Klæðning - Milli Staura (lóðrétt og lárétt)
function calculateKlæðningMilliStauraLengdarmetrar({
  lengd,
  hæð,
  tvöföld,
  efnisbreidd,
}: {
  lengd: number;
  hæð: number;
  tvöföld: boolean;
  efnisbreidd: number;
}) {
  // (Lengd * Hæð * Klæðning) * (1 / (Efnisbreidd + loftunarbil)) * (1 + afsag)
  const extraCutOffs = 0.1; // Afsag
  const spacing = 0.015; // Loftunarbil
  const materialsToCoverOneSquareMeter = (1 / (efnisbreidd + spacing)) * (1 + extraCutOffs); // efni sem þarf til að klæða 1m2 af girðingu

  return Number((lengd * hæð * (tvöföld ? 2 : 1) * materialsToCoverOneSquareMeter).toFixed(2));
}

// Klæðning - Yfir Staur (lárétt)
function calculateKlæðningYfirStaurLengdarmetrar({
  lengd,
  hæð,
  tvöföld,
  efnisbreidd,
}: {
  lengd: number;
  hæð: number;
  tvöföld: boolean;
  efnisbreidd: number;
}) {
  // (hæð / (efnisbreidd + 10mm) * lengd * klæðning
  return (hæð / (efnisbreidd + 0.01)) * lengd * (tvöföld ? 2 : 1);
}

function calculateKlæðningStykki({ lengdarmetrar, lengdPlanka }: { lengdarmetrar: number; lengdPlanka: number }) {
  // lengdarmetrar / stöðluð lengd planka
  return lengdarmetrar / lengdPlanka;
}

// Langbönd
function calculateLangböndStykki({ lengd, hæð, efnislengd }: { lengd: number; hæð: number; efnislengd: number }) {
  // Formula: lengd girðingar * (2 eða 3, fer eftir hæð) / efnisbreidd
  if (hæð >= 1.5) {
    return (lengd * 3) / efnislengd;
  }
  return (lengd * 2) / efnislengd;
}

// Staurar
function calculateStaurarStykki({ bil }: { bil: number }) {
  // Bil + 1
  return bil + 1;
}

// Hólkar
function calculateHólkarStykki({ staurar }: { staurar: number }) {
  // 1 hólkur per staur
  return staurar;
}

// Steypa
function calculateSteypaStykki({ staurar }: { staurar: number }) {
  // 2 pakkar af staurasteypu per staur
  return staurar * 2;
}

// Vinklar
function calculateVinklarStykki({ staurar }: { staurar: number }) {
  // 6 vinklar per staur
  return staurar * 6;
}

// Klæðningargrind
function calculateKlæðningargrindStykki({ bil }: { bil: number }) {
  // bil / 2
  return bil / 2;
}

// Topplisti
function calculateTopplistiStykki({ lengd, lengdPlanka }: { lengd: number; lengdPlanka: number }) {
  // Lengd / stöðluð lengd planka
  return lengd / lengdPlanka;
}

// // Skrúfur - Langbönd
function calculateSkrúfurLangböndStykki({
  lengd,
  bil,
  skrúfurPerPakka,
}: {
  lengd: number;
  bil: number;
  skrúfurPerPakka: number;
}) {
  // (lengd girðingar / bil millli staura) * 8)
  return ((lengd / bil) * 8) / skrúfurPerPakka;
}

// Skrúfur - Topplisti
function calculateSkrúfurTopplisti({ lengd, skrúfurPerPakka }: { lengd: number; skrúfurPerPakka: number }) {
  // lengd girðingar / 0.5
  // / stk per pakka
  return lengd / 0.5 / skrúfurPerPakka;
}

// Skrúfur - Klæðning
function calculateSkrúfurKlæðningStykki({
  lengdarmetrar,
  bil,
  skrúfurPerPakka,
}: {
  lengdarmetrar: number;
  bil: number;
  skrúfurPerPakka: number;
}) {
  // (lengdarmetrar klæðningar / bil milli staura) * 6)
  // / stk per pakka
  return ((lengdarmetrar / bil) * 6) / skrúfurPerPakka;
}

// Skrúfur - Klæðningargrind
function calculateSkrúfurKlæðningargrindStykki({
  lengd,
  bil,
  skrúfurPerPakka,
}: {
  lengd: number;
  bil: number;
  skrúfurPerPakka: number;
}) {
  // (lengd girðingar / bil millli staura) * 8)
  // / stk per pakka
  return ((lengd / bil) * 8) / skrúfurPerPakka;
}

// Kambskrúfur
function calculateKambskrúfurStykki({ vinklar, skrúfurPerPakka }: { vinklar: number; skrúfurPerPakka: number }) {
  // 8 stk per vinkil
  // / stk per pakka
  return (vinklar * 8) / skrúfurPerPakka;
}

export interface SelectionBlockProps {
  variation: GirdingVariation;
  selectedVariationId: number;
  setVariationSelection: (id: number) => void;
}

function SelectionBlock({ variation, selectedVariationId, setVariationSelection }: SelectionBlockProps): JSX.Element {
  const handleSetFenceSelection = useCallback(() => {
    setVariationSelection(variation.id);
  }, [variation.id, setVariationSelection]);

  return (
    <SelectionItem
      key={variation.id}
      className={selectedVariationId === variation.id ? "active" : ""}
      onClick={handleSetFenceSelection}
    >
      <SelectionImage src={variation.image} />
      <SelectionLabel>{variation.label}</SelectionLabel>
    </SelectionItem>
  );
}
