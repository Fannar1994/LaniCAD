import type { VariantList } from "@byko/lib-api-rest";
interface VariantSize {
  variantSku: string;
  size: number;
}

export interface ProductIdentifier {
  vnr: string;
  id: number;
}

export const handleItemToStringCb = (option: { label?: string | null } | null): string => option?.label ?? "";

export const mapProductVariantsToVariants = (productVariants: VariantList[]): VariantSize[] => {
  const list: VariantSize[] = [];
  productVariants.forEach(({ sku, meta }) => {
    list.push({
      variantSku: sku ?? "",
      size: parseFloat(meta.size),
    });
  });
  return list;
};

export const findClosestSize = (
  selectedLength: number,
  variants: VariantSize[],
): {
  variant: VariantSize | null;
  cuts: number;
} => {
  const selectedLengthCm = selectedLength * 100;
  let closest: VariantSize | null = null;
  let cuts = 0;

  while (cuts < variants.length) {
    let minDiff = Infinity;

    for (const variant of variants) {
      const diff = variant.size - selectedLengthCm / (cuts + 1);

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        closest = variant;
      }
    }

    if (closest) {
      break;
    }

    cuts++;
  }

  return { variant: closest, cuts };
};
