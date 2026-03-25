/**
 * Loftastoðir (Shoring Props) Calculator - Main Component
 * 
 * A rental calculator for concrete slab formwork support props.
 * Calculates quantity, validates load capacity, and computes rental costs.
 */

import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { PageContainer } from "@byko/component-page-container";
import { Card } from "@byko/component-cards";
import { Button } from "@byko/component-buttons";
import { Input } from "@byko/component-inputs";
import { Select } from "@byko/component-select";
import { LongArrowSideIcons } from "@byko/lib-icons";
import { theme } from "@byko/lib-styles";

import { useCalculateProps } from "./calculator";
import { thicknessOptions, spacingOptions, loftastodir } from "./configuration";

import {
  ButtonActionContainer,
  CardInner,
  ContentContainer,
  InputBlock,
  Label,
  SectionBlock,
  SelectionContainer,
} from "../styles";

import type { ChangeEvent } from "react";
import type { Configuration } from "./interface";

// Styled components for results display
const ResultsSection = styled.div<{ $show?: boolean }>`
  display: ${(props) => (props.$show ? "block" : "none")};
  margin-top: 40px;
`;

const ResultsCard = styled.div`
  background: linear-gradient(135deg, #f8fdfe 0%, #f0f9fa 100%);
  border: 2px solid ${theme.palette.blue.main};
  border-radius: 12px;
  padding: 32px;
`;

const ResultsTitle = styled.h3`
  margin: 0 0 24px 0;
  color: ${theme.palette.blue.dark};
  font-size: 24px;
  font-weight: 600;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ResultItem = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${theme.palette.gray[10]};

  .label {
    font-size: 14px;
    color: ${theme.palette.gray[60]};
    margin-bottom: 8px;
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: ${theme.palette.blue.dark};
  }

  .unit {
    font-size: 14px;
    color: ${theme.palette.gray[40]};
    margin-left: 4px;
  }
`;

const SelectedPropInfo = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${theme.palette.gray[10]};
  margin-top: 20px;

  h4 {
    margin: 0 0 16px 0;
    color: ${theme.palette.blue.dark};
    font-size: 18px;
  }

  .prop-detail {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid ${theme.palette.gray[5]};

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: ${theme.palette.gray[60]};
    }

    .value {
      font-weight: 600;
      color: ${theme.palette.blue.dark};
    }
  }
`;

const LoadInfo = styled.div`
  background: ${theme.palette.gray[5]};
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: ${theme.palette.gray[80]};

  .load-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const WarningMessage = styled.div`
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  color: #856404;
  font-weight: 600;
  text-align: center;
`;

const TotalPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-top: 20px;
  background: linear-gradient(135deg, ${theme.palette.blue.lightest} 0%, #d1ecf1 100%);
  border-radius: 8px;
  border-top: 3px solid ${theme.palette.blue.main};

  .label {
    font-size: 18px;
    font-weight: 600;
    color: ${theme.palette.blue.dark};
  }

  .price {
    font-size: 32px;
    font-weight: 700;
    color: ${theme.palette.blue.main};
  }

  .breakdown {
    font-size: 14px;
    color: ${theme.palette.gray[60]};
    margin-top: 4px;
  }
`;

// Helper for dropdown item to string
const handleItemToString = (item: { label: string } | null): string => {
  return item?.label ?? "";
};

// Number formatter for Icelandic locale
const formatNumber = (num: number): string => {
  return num.toLocaleString("is-IS");
};

export const Loftastodir = (): JSX.Element => {
  const [showResults, setShowResults] = useState(false);

  // Form state
  const [config, setConfig] = useState<Configuration>({
    area_m2: 0,
    thickness_cm: 20,
    spacing_m: 1.2,
    rentalDays: 7,
    selectedPropId: null,
  });

  // Calculate props and get valid options
  const { result, validProps } = useCalculateProps(config);

  // Dropdown options for valid props
  const propOptions = useMemo(() => {
    return validProps.map((prop) => ({
      id: prop.id,
      label: `${prop.name} (${prop.maxLoad_kN} kN)`,
    }));
  }, [validProps]);

  // Currently selected prop option for dropdown
  const selectedPropOption = useMemo(() => {
    if (!config.selectedPropId) return null;
    return propOptions.find((opt) => opt.id === config.selectedPropId) ?? null;
  }, [config.selectedPropId, propOptions]);

  // Handlers
  const handleAreaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    const numValue = parseFloat(value) || 0;
    setConfig((prev) => ({ ...prev, area_m2: numValue, selectedPropId: null }));
    setShowResults(false);
  }, []);

  const handleThicknessChange = useCallback(
    (value: { selectedItem?: { id: number; value: number } | null } | null) => {
      const thickness = value?.selectedItem?.value ?? 20;
      setConfig((prev) => ({ ...prev, thickness_cm: thickness, selectedPropId: null }));
      setShowResults(false);
    },
    []
  );

  const handleSpacingChange = useCallback(
    (value: { selectedItem?: { id: number; value: number } | null } | null) => {
      const spacing = value?.selectedItem?.value ?? 1.2;
      setConfig((prev) => ({ ...prev, spacing_m: spacing, selectedPropId: null }));
      setShowResults(false);
    },
    []
  );

  const handleDaysChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setConfig((prev) => ({ ...prev, rentalDays: Math.max(1, value) }));
  }, []);

  const handlePropChange = useCallback(
    (value: { selectedItem?: { id: string } | null } | null) => {
      const propId = value?.selectedItem?.id ?? null;
      setConfig((prev) => ({ ...prev, selectedPropId: propId }));
    },
    []
  );

  const handleCalculate = useCallback(() => {
    if (config.area_m2 <= 0) {
      alert("Vinsamlegast sláðu inn flatarmál");
      return;
    }
    setShowResults(true);

    setTimeout(() => {
      const element = document.querySelector("#nidurstodur");
      if (element) {
        const offset = 100;
        const position = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: position - offset, behavior: "smooth" });
      }
    }, 100);
  }, [config.area_m2]);

  // Get selected options for dropdowns
  const selectedThickness = thicknessOptions.find((opt) => opt.value === config.thickness_cm);
  const selectedSpacing = spacingOptions.find((opt) => opt.value === config.spacing_m);

  return (
    <PageContainer flexDirection="column" offsetNav={false}>
      <ContentContainer>
        <Card>
          <>
            <CardInner>
              {/* Area input */}
              <SectionBlock>
                <h6>Flatarmál</h6>
                <SelectionContainer>
                  <InputBlock>
                    <Label>Flatarmál plötu (m²)</Label>
                    <Input
                      $stretch={true}
                      type="number"
                      min="0"
                      step="0.1"
                      value={config.area_m2 || ""}
                      onChange={handleAreaChange}
                      placeholder="t.d. 50"
                    />
                  </InputBlock>
                </SelectionContainer>
              </SectionBlock>

              {/* Concrete thickness */}
              <SectionBlock>
                <h6>Þykkt steypu</h6>
                <SelectionContainer>
                  <InputBlock>
                    <Label>Veldu þykkt (cm)</Label>
                    <Select
                      align="left"
                      fit={true}
                      handleSelectedItemChange={handleThicknessChange}
                      hideDefaultPlaceholder={true}
                      hideValue={true}
                      items={thicknessOptions}
                      itemToString={handleItemToString}
                      placeholder={selectedThickness?.label ?? "Veldu þykkt"}
                      selectedItem={selectedThickness}
                      textColor={theme.palette.blue.dark}
                    />
                  </InputBlock>
                </SelectionContainer>
              </SectionBlock>

              {/* Prop spacing */}
              <SectionBlock>
                <h6>Stoðabil</h6>
                <SelectionContainer>
                  <InputBlock>
                    <Label>Bil milli stoða (m)</Label>
                    <Select
                      align="left"
                      fit={true}
                      handleSelectedItemChange={handleSpacingChange}
                      hideDefaultPlaceholder={true}
                      hideValue={true}
                      items={spacingOptions}
                      itemToString={handleItemToString}
                      placeholder={selectedSpacing?.label ?? "Veldu bil"}
                      selectedItem={selectedSpacing}
                      textColor={theme.palette.blue.dark}
                    />
                  </InputBlock>
                </SelectionContainer>
              </SectionBlock>

              {/* Rental duration */}
              <SectionBlock>
                <h6>Leigutími</h6>
                <SelectionContainer>
                  <InputBlock>
                    <Label>Fjöldi daga</Label>
                    <Input
                      $stretch={true}
                      type="number"
                      min="1"
                      value={config.rentalDays}
                      onChange={handleDaysChange}
                    />
                  </InputBlock>
                </SelectionContainer>
              </SectionBlock>

              {/* Prop selection - filtered by load capacity */}
              <SectionBlock>
                <h6>Valin loftastoð</h6>
                <SelectionContainer>
                  <InputBlock>
                    <Label>
                      {validProps.length > 0
                        ? `${validProps.length} loftastoðir standast burð`
                        : "Engin loftastoð stenst burð"}
                    </Label>
                    {validProps.length > 0 ? (
                      <Select
                        align="left"
                        fit={true}
                        handleSelectedItemChange={handlePropChange}
                        hideDefaultPlaceholder={true}
                        hideValue={true}
                        items={propOptions}
                        itemToString={handleItemToString}
                        placeholder={selectedPropOption?.label ?? "Veldu loftastoð"}
                        selectedItem={selectedPropOption}
                        textColor={theme.palette.blue.dark}
                      />
                    ) : (
                      <WarningMessage>
                        Engin loftastoð stenst burð fyrir þessar forsendur
                      </WarningMessage>
                    )}
                  </InputBlock>
                </SelectionContainer>
              </SectionBlock>
            </CardInner>

            <ButtonActionContainer>
              <Button
                $buttonColor="blueButton"
                icon={LongArrowSideIcons}
                label="Reikna"
                onClick={handleCalculate}
              />
            </ButtonActionContainer>
          </>
        </Card>

        {/* Results section */}
        <ResultsSection id="nidurstodur" $show={showResults && result !== null}>
          {result && (
            <ResultsCard>
              <ResultsTitle>Niðurstöður</ResultsTitle>

              {/* Load calculations info */}
              <LoadInfo>
                <div className="load-row">
                  <span>Álag á m²:</span>
                  <span>{result.loadPerM2_kN.toFixed(2)} kN/m²</span>
                </div>
                <div className="load-row">
                  <span>Álag á stoð:</span>
                  <span>{result.loadPerProp_kN.toFixed(2)} kN</span>
                </div>
                <div className="load-row">
                  <span>Álag með öryggisstuðli (×1,5):</span>
                  <span><strong>{result.loadWithSafety_kN.toFixed(2)} kN</strong></span>
                </div>
              </LoadInfo>

              {/* Main results */}
              <ResultsGrid>
                <ResultItem>
                  <div className="label">Fjöldi loftastoða</div>
                  <div className="value">
                    {result.propCount}
                    <span className="unit">stk</span>
                  </div>
                </ResultItem>

                {result.isValid && result.selectedProp && (
                  <>
                    <ResultItem>
                      <div className="label">Heildarþyngd</div>
                      <div className="value">
                        {formatNumber(Math.round(result.totalWeight_kg))}
                        <span className="unit">kg</span>
                      </div>
                    </ResultItem>

                    <ResultItem>
                      <div className="label">Dagverð (per stoð)</div>
                      <div className="value">
                        {result.selectedProp.dayRate}
                        <span className="unit">kr</span>
                      </div>
                    </ResultItem>

                    <ResultItem>
                      <div className="label">Vikulegt verð (per stoð)</div>
                      <div className="value">
                        {result.selectedProp.weekRate}
                        <span className="unit">kr</span>
                      </div>
                    </ResultItem>
                  </>
                )}
              </ResultsGrid>

              {/* Selected prop details */}
              {result.isValid && result.selectedProp && (
                <>
                  <SelectedPropInfo>
                    <h4>Valin loftastoð</h4>
                    <div className="prop-detail">
                      <span className="label">Nafn:</span>
                      <span className="value">{result.selectedProp.name}</span>
                    </div>
                    <div className="prop-detail">
                      <span className="label">Vörunúmer:</span>
                      <span className="value">{result.selectedProp.articleNumber}</span>
                    </div>
                    <div className="prop-detail">
                      <span className="label">Leigukóði:</span>
                      <span className="value">{result.selectedProp.id}</span>
                    </div>
                    <div className="prop-detail">
                      <span className="label">Hæðarbil:</span>
                      <span className="value">
                        {result.selectedProp.minHeight_m}–{result.selectedProp.maxHeight_m} m
                      </span>
                    </div>
                    <div className="prop-detail">
                      <span className="label">Hámarksburður:</span>
                      <span className="value">{result.selectedProp.maxLoad_kN} kN</span>
                    </div>
                    <div className="prop-detail">
                      <span className="label">Þyngd per stoð:</span>
                      <span className="value">{result.selectedProp.weight_kg} kg</span>
                    </div>
                  </SelectedPropInfo>

                  {/* Total price */}
                  <TotalPrice>
                    <div>
                      <div className="label">Heildarverð leigu</div>
                      <div className="breakdown">{result.costBreakdown}</div>
                    </div>
                    <div className="price">{formatNumber(result.totalCost)} kr</div>
                  </TotalPrice>
                </>
              )}

              {/* Warning if no valid prop selected */}
              {!result.isValid && validProps.length > 0 && (
                <WarningMessage>
                  Vinsamlegast veldu loftastoð til að sjá verð
                </WarningMessage>
              )}

              {!result.isValid && validProps.length === 0 && (
                <WarningMessage>
                  Engin loftastoð stenst burð fyrir þessar forsendur.
                  Minnkaðu stoðabil eða þykkt steypu.
                </WarningMessage>
              )}
            </ResultsCard>
          )}
        </ResultsSection>
      </ContentContainer>
    </PageContainer>
  );
};
