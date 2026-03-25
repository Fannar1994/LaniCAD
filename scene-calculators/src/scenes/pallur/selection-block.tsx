import React, { useCallback } from "react";

import { SelectionImage, SelectionItem, SelectionLabel } from "../styles";

import type { PallarVariation } from "../interface";

export const SelectionBlock = ({
  variation,
  selectedVariationId,
  setVariationSelection,
}: {
  variation: PallarVariation;
  selectedVariationId: number;
  setVariationSelection: (id: number) => void;
}): JSX.Element => {
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
};
