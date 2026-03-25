import { useCallback, useMemo } from "react";

import { productsList } from "./configuration";
import { findClosestSize, mapProductVariantsToVariants } from "../shared";

import type { ProductIdentifier, ProductListItem } from "../shared";
import type { CalculatedProductListProps, ProductType } from "./interface";

export const useCalculateProductList = ({
  config,
  products,
  activeVariation,
  selectedMaterial,
  activeCylinderSize,
}: CalculatedProductListProps) => {
  const getProductHelper = useCallback(
    (productCollection: ProductIdentifier[], quantity: number, productType: ProductType) => {
      const selectedWidth = parseFloat(config.selectedWidth);
      const selectedLength = parseFloat(config.selectedLength);
      const list: ProductListItem[] = [];
      productCollection.map((item) => {
        const product = products?.results?.find((p) => p.id === item.id);

        if (!product) return;

        switch (productType) {
          case "burdur":
            const burdurSizeList = mapProductVariantsToVariants(product.variants);
            const burdurResults = findClosestSize(
              activeVariation?.value === "langsum" ? selectedLength : selectedWidth,
              burdurSizeList,
            );
            list.push({
              item: product,
              quantity: Math.ceil((quantity / (burdurResults.variant?.size ?? 1)) * 100),
              variantSku: burdurResults?.variant?.variantSku ?? "",
            });
            break;
          case "dregari":
            const dregariSizeList = mapProductVariantsToVariants(product.variants);
            const dregariResults = findClosestSize(
              activeVariation?.value === "langsum" ? selectedWidth : selectedLength,
              dregariSizeList,
            );
            list.push({
              item: product,
              quantity: Math.ceil((quantity / (dregariResults.variant?.size ?? 1)) * 100),
              variantSku: dregariResults?.variant?.variantSku ?? "",
            });
            break;
          case "klaedning":
            if (selectedMaterial?.materialType === "plastic") {
              list.push({
                item: product,
                quantity,
                variantSku: product.variants[0]?.sku ?? "0",
              });
            } else {
              const klaedningSizeList = mapProductVariantsToVariants(product.variants);
              const klaedningResults = findClosestSize(selectedWidth, klaedningSizeList);
              list.push({
                item: product,
                quantity: Math.ceil((quantity / (klaedningResults.variant?.size ?? 1)) * 100),
                variantSku: klaedningResults?.variant?.variantSku ?? "",
              });
            }
            break;
          case "skrufur":
            list.push({
              item: product,
              quantity,
              variantSku: "30114550::4,5x50:",
            });
            break;
          case "kambSkrufa":
            list.push({
              item: product,
              quantity,
              variantSku: "33799540::5x40:",
            });
            break;
          case "bordabolti":
            list.push({
              item: product,
              quantity,
              variantSku: "31121080::10x80:",
            });
            break;
          case "ferkantSkinna":
            list.push({
              item: product,
              quantity,
              variantSku: "31330011::10x30x30:",
            });
            break;
          case "roHeitgalv":
            list.push({
              item: product,
              quantity,
              variantSku: "30300510::10 mm:",
            });
            break;
          default:
            list.push({
              item: product,
              quantity,
              variantSku: product.variants[0]?.sku ?? "0",
            });
            break;
        }
      });

      if (list) {
        return list;
      }

      return [];
    },
    [activeVariation?.value, config.selectedLength, config.selectedWidth, products?.results, selectedMaterial],
  );

  const purchaseList = useMemo(() => {
    const selectedWidth = parseFloat(config.selectedWidth);
    const selectedLength = parseFloat(config.selectedLength);
    const squareMeters = selectedWidth * selectedLength;

    const mainAxis = activeVariation?.value === "langsum" ? selectedLength : selectedWidth;
    const counterAxis = activeVariation?.value === "langsum" ? selectedWidth : selectedLength;

    // Calculate Burður
    let variationOfSize = 1.8;
    const burdurLMQuantity = Math.max(Math.ceil((counterAxis / variationOfSize + 1) * mainAxis), 1);
    const burdur = getProductHelper(productsList["burdur"] ?? [], burdurLMQuantity, "burdur");

    // Calculate Dregari
    let dregari;
    let dregariLMQuantity;

    variationOfSize = 0.5;
    if (selectedMaterial?.materialType === "plastic") {
      dregariLMQuantity = Math.max(Math.ceil((mainAxis / 0.4 + 1) * counterAxis), 1);
      dregari = getProductHelper(productsList["dregari"] ?? [], dregariLMQuantity, "dregari");
    } else if (selectedMaterial?.materialType === "wood") {
      dregariLMQuantity = Math.max(Math.ceil((mainAxis / 0.5 + 1) * counterAxis), 1);
      dregari = getProductHelper(productsList["dregari"] ?? [], dregariLMQuantity, "dregari");
    } else {
      dregariLMQuantity = Math.max(Math.ceil((mainAxis / 0.45 + 1) * counterAxis), 1);
      dregari = getProductHelper(productsList["dregari"] ?? [], dregariLMQuantity, "dregari");
    }

    // Calculate Material
    const selectedKlaedning = productsList["klaedning"]?.find((item) => item.id === selectedMaterial?.productId);
    let klaedning: ProductListItem[] = [];
    let klaedningLMQuantity;

    if (selectedMaterial?.materialType === "wood") {
      // eslint-disable-next-line max-len
      variationOfSize = selectedMaterial?.materialWidth ?? 0.095;
      klaedningLMQuantity = Math.max(Math.ceil(squareMeters / (variationOfSize + 0.005)));
    } else if (selectedMaterial?.materialType === "plastic") {
      klaedningLMQuantity = Math.max(Math.ceil((squareMeters * 6.89) / 3.6));
    } else {
      // Thermawood
      variationOfSize = selectedMaterial?.materialWidth ?? 0.14;
      klaedningLMQuantity = Math.max(Math.ceil(squareMeters / (variationOfSize + 0.005)));
    }

    if (selectedKlaedning) {
      klaedning = getProductHelper([selectedKlaedning] ?? [], klaedningLMQuantity, "klaedning");
    }

    // Calculate þakásanker left & right
    const sankerQuantity = Math.max(Math.ceil(burdurLMQuantity / 0.5 / 2), 1);
    const sankerRight = getProductHelper(productsList["sankerRight"] ?? [], sankerQuantity, "sankerRight");
    const sankerLeft = getProductHelper(productsList["sankerLeft"] ?? [], sankerQuantity, "sankerLeft");

    // Calculate Kambskrúfur
    const kambSkrufaQuantity = Math.max(Math.ceil((sankerQuantity * 2 * 8) / 250), 1);
    const kambSkrufa = getProductHelper(productsList["kambSkrufa"] ?? [], kambSkrufaQuantity, "kambSkrufa");

    // Combine what we have
    const productValues = [...burdur, ...dregari, ...klaedning, ...sankerRight, ...sankerLeft, ...kambSkrufa];

    if (selectedMaterial?.materialType === "wood") {
      // Calculate Skrufur
      const skrufurQuantity = Math.max(Math.ceil((klaedningLMQuantity * 4) / 200), 1);
      const skrufur = getProductHelper(productsList["skrufur"] ?? [], skrufurQuantity, "skrufur");

      // Combine what we have
      productValues.push(...skrufur);
    } else if (selectedMaterial?.materialType === "plastic") {
      const tClipsQuantity = Math.max(Math.ceil((klaedningLMQuantity * 9) / 100), 1);
      const tClips = getProductHelper(productsList["tClips"] ?? [], tClipsQuantity, "tClips");

      const endaClipsQuantity = Math.max(Math.ceil(((mainAxis / 0.4) * 2) / 20), 1);
      const endaClips = getProductHelper(productsList["endaClips"] ?? [], endaClipsQuantity, "endaClips");

      // Combine what we have
      productValues.push(...[...tClips, ...endaClips]);
    } else {
      // Thermawood
      const clipsMedSkrufumQuantity = Math.max(Math.ceil((klaedningLMQuantity * 2.5) / 100), 1);
      const clipsMedSkrufum = getProductHelper(
        productsList["clipsMedSkrufum"] ?? [],
        clipsMedSkrufumQuantity,
        "clipsMedSkrufum",
      );

      // Combine what we have
      productValues.push(...clipsMedSkrufum);
    }

    // Reikna með hólka og festingar, if checked
    if (config.showExtraValues) {
      const packages = parseFloat(activeCylinderSize?.value ?? "1");

      // Calculate Blikkhólkar
      const blikkholkarQuantity = Math.max(Math.ceil(burdurLMQuantity / 1.8 + 2), 1);
      const requestedId =
        activeCylinderSize?.label === "200mm"
          ? "0251655"
          : activeCylinderSize?.label === "250mm"
            ? "0251657"
            : "0251658";

      const selectedBlikkholkur = productsList["blikkholkar"]?.find((item) => item.vnr === requestedId);
      let blikkholkar: ProductListItem[] = [];
      if (selectedBlikkholkur) {
        blikkholkar = getProductHelper([selectedBlikkholkur], blikkholkarQuantity, "blikkholkar");
      }

      // Calculate Staurafestingar
      const staurafestingQuantity = Math.max(Math.ceil(blikkholkarQuantity), 1);
      const staurafesting = getProductHelper(
        productsList["staurafesting"] ?? [],
        staurafestingQuantity,
        "staurafesting",
      );

      const bordaboltiQuantity = Math.max(Math.ceil(blikkholkarQuantity), 1);
      const bordabolti = getProductHelper(productsList["bordabolti"] ?? [], bordaboltiQuantity, "bordabolti");

      const ferkantSkinnaQuantity = Math.max(Math.ceil(blikkholkarQuantity), 1);
      const ferkantSkinna = getProductHelper(
        productsList["ferkantSkinna"] ?? [],
        ferkantSkinnaQuantity,
        "ferkantSkinna",
      );

      const roHeitgalvQuantity = Math.max(Math.ceil(blikkholkarQuantity), 1);
      const roHeitgalv = getProductHelper(productsList["roHeitgalv"] ?? [], roHeitgalvQuantity, "roHeitgalv");

      // Calculate Staurasteypu
      const staurasteypaQuantity = Math.max(Math.ceil(blikkholkarQuantity * packages), 1);
      const staurasteypa = getProductHelper(productsList["staurasteypa"] ?? [], staurasteypaQuantity, "staurasteypa");

      // Combine what we have
      productValues.push(
        ...[...blikkholkar, ...staurafesting, ...bordabolti, ...ferkantSkinna, ...roHeitgalv, ...staurasteypa],
      );
    }

    return productValues;
  }, [
    activeCylinderSize?.label,
    activeCylinderSize?.value,
    activeVariation?.value,
    config.selectedLength,
    config.selectedWidth,
    config.showExtraValues,
    getProductHelper,
    selectedMaterial?.materialType,
    selectedMaterial?.materialWidth,
    selectedMaterial?.productId,
  ]);

  return {
    purchaseList,
  };
};
