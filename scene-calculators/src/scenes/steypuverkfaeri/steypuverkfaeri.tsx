/**
 * Steypuverkfæri (Concrete Formwork Tools) Calculator - Main Component
 * 
 * A rental calculator combining:
 * - Loftastoðir (Shoring Props) - vertical supports for concrete slabs
 * - Undirsláttur (HT-20 Beams) - horizontal formwork beams
 * 
 * Pattern follows hjolapallar and idnadar-girdingar calculators.
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

import { useCalculateProps, useCalculateBeams } from "./calculator";
import {
  thicknessOptions,
  spacingOptions,
  undirslatturThicknessOptions,
  beamSpacingOptions,
  CALCULATOR_TYPES,
} from "./configuration";

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
import type {
  CalculatorType,
  LoftastodirConfiguration,
  UndirslatturConfiguration,
} from "./interface";

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const RadioOption = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px solid ${(props) => (props.$selected ? "#17a2b8" : "#e0e0e0")};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$selected ? "#f0f9fa" : "#fff")};
  font-weight: ${(props) => (props.$selected ? "600" : "normal")};
  box-shadow: ${(props) => (props.$selected ? "0 4px 16px rgba(23, 162, 184, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.05)")};

  &:hover {
    border-color: #17a2b8;
    background: ${(props) => (props.$selected ? "#f0f9fa" : "#f8f9fa")};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(23, 162, 184, 0.15);
  }

  input[type="radio"] {
    cursor: pointer;
    width: 20px;
    height: 20px;
    accent-color: #17a2b8;
  }
`;

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

const SelectedItemInfo = styled.div`
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

  .detail-row {
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

  .info-row {
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const handleItemToString = (item: { label: string } | null): string => {
  return item?.label ?? "";
};

const formatNumber = (num: number): string => {
  return num.toLocaleString("is-IS");
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Steypuverkfaeri = (): JSX.Element => {
  const [showResults, setShowResults] = useState(false);
  const [calculatorType, setCalculatorType] = useState<CalculatorType>("loftastodir");

  // Dates
  const today = new Date();
  const tenDaysLater = new Date(today);
  tenDaysLater.setDate(today.getDate() + 10);

  // Loftastodir form state
  const [loftastodirConfig, setLoftastodirConfig] = useState<LoftastodirConfiguration>({
    area_m2: 0,
    thickness_cm: 20,
    spacing_m: 1.2,
    startDate: today.toISOString().split('T')[0],
    endDate: tenDaysLater.toISOString().split('T')[0],
    selectedPropId: null,
  });

  // Undirslattur form state
  const [undirslatturConfig, setUndirslatturConfig] = useState<UndirslatturConfiguration>({
    area_m2: 0,
    thickness_cm: 20,
    spacing_m: 0.5,
    startDate: today.toISOString().split('T')[0],
    endDate: tenDaysLater.toISOString().split('T')[0],
    selectedBeamId: null,
  });

  // Calculate results
  const { result: loftastodirResult, validProps } = useCalculateProps(loftastodirConfig);
  const { result: undirslatturResult, validBeams } = useCalculateBeams(undirslatturConfig);

  // =============================================================================
  // LOFTASTODIR DROPDOWN OPTIONS
  // =============================================================================

  const propOptions = useMemo(() => {
    return validProps.map((prop) => ({
      id: prop.id,
      label: `${prop.name} (${prop.maxLoad_kN} kN)`,
    }));
  }, [validProps]);

  const selectedPropOption = useMemo(() => {
    if (!loftastodirConfig.selectedPropId) return null;
    return propOptions.find((opt) => opt.id === loftastodirConfig.selectedPropId) ?? null;
  }, [loftastodirConfig.selectedPropId, propOptions]);

  // =============================================================================
  // UNDIRSLATTUR DROPDOWN OPTIONS
  // =============================================================================

  const beamOptions = useMemo(() => {
    return validBeams.map((beam) => ({
      id: beam.id,
      label: `${beam.name} (${beam.length_m} m)`,
    }));
  }, [validBeams]);

  const selectedBeamOption = useMemo(() => {
    if (!undirslatturConfig.selectedBeamId) return null;
    return beamOptions.find((opt) => opt.id === undirslatturConfig.selectedBeamId) ?? null;
  }, [undirslatturConfig.selectedBeamId, beamOptions]);

  // =============================================================================
  // EVENT HANDLERS - CALCULATOR TYPE
  // =============================================================================

  const handleCalculatorTypeChange = useCallback((type: CalculatorType) => {
    setCalculatorType(type);
    setShowResults(false);
  }, []);

  // =============================================================================
  // EVENT HANDLERS - LOFTASTODIR
  // =============================================================================

  const handleLoftastodirAreaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    const numValue = parseFloat(value) || 0;
    setLoftastodirConfig((prev) => ({ ...prev, area_m2: numValue, selectedPropId: null }));
    setShowResults(false);
  }, []);

  const handleLoftastodirThicknessChange = useCallback(
    (value: { selectedItem?: { id: number; value: number } | null } | null) => {
      const thickness = value?.selectedItem?.value ?? 20;
      setLoftastodirConfig((prev) => ({ ...prev, thickness_cm: thickness, selectedPropId: null }));
      setShowResults(false);
    },
    []
  );

  const handleLoftastodirSpacingChange = useCallback(
    (value: { selectedItem?: { id: number; value: number } | null } | null) => {
      const spacing = value?.selectedItem?.value ?? 1.2;
      setLoftastodirConfig((prev) => ({ ...prev, spacing_m: spacing, selectedPropId: null }));
      setShowResults(false);
    },
    []
  );

  const handleLoftastodirStartDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLoftastodirConfig((prev) => ({ ...prev, startDate: e.target.value }));
  }, []);

  const handleLoftastodirEndDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLoftastodirConfig((prev) => ({ ...prev, endDate: e.target.value }));
  }, []);

  const handlePropChange = useCallback(
    (value: { selectedItem?: { id: string } | null } | null) => {
      const propId = value?.selectedItem?.id ?? null;
      setLoftastodirConfig((prev) => ({ ...prev, selectedPropId: propId }));
    },
    []
  );

  // =============================================================================
  // EVENT HANDLERS - UNDIRSLATTUR
  // =============================================================================

  const handleUndirslatturAreaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    const numValue = parseFloat(value) || 0;
    setUndirslatturConfig((prev) => ({ ...prev, area_m2: numValue, selectedBeamId: null }));
    setShowResults(false);
  }, []);

  const handleUndirslatturThicknessChange = useCallback(
    (value: { selectedItem?: { id: number; value: number } | null } | null) => {
      const thickness = value?.selectedItem?.value ?? 20;
      setUndirslatturConfig((prev) => ({ ...prev, thickness_cm: thickness, selectedBeamId: null }));
      setShowResults(false);
    },
    []
  );

  const handleUndirslatturSpacingChange = useCallback(
    (value: { selectedItem?: { id: number; value: number } | null } | null) => {
      const spacing = value?.selectedItem?.value ?? 0.5;
      setUndirslatturConfig((prev) => ({ ...prev, spacing_m: spacing, selectedBeamId: null }));
      setShowResults(false);
    },
    []
  );

  const handleUndirslatturStartDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUndirslatturConfig((prev) => ({ ...prev, startDate: e.target.value }));
  }, []);

  const handleUndirslatturEndDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUndirslatturConfig((prev) => ({ ...prev, endDate: e.target.value }));
  }, []);

  const handleBeamChange = useCallback(
    (value: { selectedItem?: { id: string } | null } | null) => {
      const beamId = value?.selectedItem?.id ?? null;
      setUndirslatturConfig((prev) => ({ ...prev, selectedBeamId: beamId }));
    },
    []
  );

  // =============================================================================
  // CALCULATE BUTTON HANDLER
  // =============================================================================

  const handleCalculate = useCallback(() => {
    if (calculatorType === "loftastodir" && loftastodirConfig.area_m2 <= 0) {
      alert("Vinsamlegast sláðu inn flatarmál");
      return;
    }
    if (calculatorType === "undirslattur" && undirslatturConfig.area_m2 <= 0) {
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
  }, [calculatorType, loftastodirConfig.area_m2, undirslatturConfig.area_m2]);

  // =============================================================================
  // SELECTED OPTIONS
  // =============================================================================

  const selectedLoftastodirThickness = thicknessOptions.find((opt) => opt.value === loftastodirConfig.thickness_cm);
  const selectedLoftastodirSpacing = spacingOptions.find((opt) => opt.value === loftastodirConfig.spacing_m);
  const selectedUndirslatturThickness = undirslatturThicknessOptions.find((opt) => opt.value === undirslatturConfig.thickness_cm);
  const selectedUndirslatturSpacing = beamSpacingOptions.find((opt) => opt.value === undirslatturConfig.spacing_m);

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <PageContainer flexDirection="column" offsetNav={false}>
      <ContentContainer>
        <Card>
          <>
            <CardInner>
              {/* Calculator Type Selection */}
              <SectionBlock>
                <h6>Veldu tegund reiknivélar</h6>
                <SelectionContainer>
                  {CALCULATOR_TYPES.map((type) => (
                    <RadioOption
                      key={type.id}
                      $selected={calculatorType === type.id}
                    >
                      <input
                        type="radio"
                        name="calculator_type"
                        value={type.id}
                        checked={calculatorType === type.id}
                        onChange={() => handleCalculatorTypeChange(type.id)}
                      />
                      <div>
                        <div><strong>{type.name}</strong></div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>
                          {type.description}
                        </div>
                      </div>
                    </RadioOption>
                  ))}
                </SelectionContainer>
              </SectionBlock>

              {/* =================================================================== */}
              {/* LOFTASTODIR FORM */}
              {/* =================================================================== */}
              {calculatorType === "loftastodir" && (
                <>
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
                          value={loftastodirConfig.area_m2 || ""}
                          onChange={handleLoftastodirAreaChange}
                          placeholder="t.d. 50"
                        />
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>

                  <SectionBlock>
                    <h6>Þykkt steypu</h6>
                    <SelectionContainer>
                      <InputBlock>
                        <Label>Veldu þykkt (cm)</Label>
                        <Select
                          align="left"
                          fit={true}
                          handleSelectedItemChange={handleLoftastodirThicknessChange}
                          hideDefaultPlaceholder={true}
                          hideValue={true}
                          items={thicknessOptions}
                          itemToString={handleItemToString}
                          placeholder={selectedLoftastodirThickness?.label ?? "Veldu þykkt"}
                          selectedItem={selectedLoftastodirThickness}
                          textColor={theme.palette.blue.dark}
                        />
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>

                  <SectionBlock>
                    <h6>Stoðabil</h6>
                    <SelectionContainer>
                      <InputBlock>
                        <Label>Bil milli stoða (m)</Label>
                        <Select
                          align="left"
                          fit={true}
                          handleSelectedItemChange={handleLoftastodirSpacingChange}
                          hideDefaultPlaceholder={true}
                          hideValue={true}
                          items={spacingOptions}
                          itemToString={handleItemToString}
                          placeholder={selectedLoftastodirSpacing?.label ?? "Veldu bil"}
                          selectedItem={selectedLoftastodirSpacing}
                          textColor={theme.palette.blue.dark}
                        />
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>

                  <SectionBlock>
                    <h6>Leigutímabil</h6>
                    <SelectionContainer>
                      <InputBlock>
                        <Label>Upphafsdagur</Label>
                        <Input
                          $stretch={true}
                          type="date"
                          value={loftastodirConfig.startDate}
                          onChange={handleLoftastodirStartDateChange}
                        />
                      </InputBlock>
                      <InputBlock>
                        <Label>Skiladagur</Label>
                        <Input
                          $stretch={true}
                          type="date"
                          value={loftastodirConfig.endDate}
                          onChange={handleLoftastodirEndDateChange}
                        />
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>

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
                </>
              )}

              {/* =================================================================== */}
              {/* UNDIRSLATTUR FORM */}
              {/* =================================================================== */}
              {calculatorType === "undirslattur" && (
                <>
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
                          value={undirslatturConfig.area_m2 || ""}
                          onChange={handleUndirslatturAreaChange}
                          placeholder="t.d. 50"
                        />
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>

                  <SectionBlock>
                    <h6>Þykkt steypu</h6>
                    <SelectionContainer>
                      <InputBlock>
                        <Label>Veldu þykkt (cm)</Label>
                        <Select
                          align="left"
                          fit={true}
                          handleSelectedItemChange={handleUndirslatturThicknessChange}
                          hideDefaultPlaceholder={true}
                          hideValue={true}
                          items={undirslatturThicknessOptions}
                          itemToString={handleItemToString}
                          placeholder={selectedUndirslatturThickness?.label ?? "Veldu þykkt"}
                          selectedItem={selectedUndirslatturThickness}
                          textColor={theme.palette.blue.dark}
                        />
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>

                  <SectionBlock>
                    <h6>Bil milli mótabita</h6>
                    <SelectionContainer>
                      <InputBlock>
                        <Label>Veldu bil (m)</Label>
                        <Select
                          align="left"
                          fit={true}
                          handleSelectedItemChange={handleUndirslatturSpacingChange}
                          hideDefaultPlaceholder={true}
                          hideValue={true}
                          items={beamSpacingOptions}
                          itemToString={handleItemToString}
                          placeholder={selectedUndirslatturSpacing?.label ?? "Veldu bil"}
                          selectedItem={selectedUndirslatturSpacing}
                          textColor={theme.palette.blue.dark}
                        />
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>

                  <SectionBlock>
                    <h6>Leigutímabil</h6>
                    <SelectionContainer>
                      <InputBlock>
                        <Label>Upphafsdagur</Label>
                        <Input
                          $stretch={true}
                          type="date"
                          value={undirslatturConfig.startDate}
                          onChange={handleUndirslatturStartDateChange}
                        />
                      </InputBlock>
                      <InputBlock>
                        <Label>Skiladagur</Label>
                        <Input
                          $stretch={true}
                          type="date"
                          value={undirslatturConfig.endDate}
                          onChange={handleUndirslatturEndDateChange}
                        />
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>

                  <SectionBlock>
                    <h6>Valinn mótabiti</h6>
                    <SelectionContainer>
                      <InputBlock>
                        <Label>
                          {validBeams.length > 0
                            ? `${validBeams.length} mótabitar leyfðir (hámark ${undirslatturResult?.maxAllowedSpan_m ?? "-"} m)`
                            : "Engir mótabitar leyfðir"}
                        </Label>
                        {validBeams.length > 0 ? (
                          <Select
                            align="left"
                            fit={true}
                            handleSelectedItemChange={handleBeamChange}
                            hideDefaultPlaceholder={true}
                            hideValue={true}
                            items={beamOptions}
                            itemToString={handleItemToString}
                            placeholder={selectedBeamOption?.label ?? "Veldu mótabita"}
                            selectedItem={selectedBeamOption}
                            textColor={theme.palette.blue.dark}
                          />
                        ) : (
                          <WarningMessage>
                            Engin mótabitalengd er leyfileg fyrir þessar forsendur
                          </WarningMessage>
                        )}
                      </InputBlock>
                    </SelectionContainer>
                  </SectionBlock>
                </>
              )}
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

        {/* =================================================================== */}
        {/* LOFTASTODIR RESULTS */}
        {/* =================================================================== */}
        {calculatorType === "loftastodir" && (
          <ResultsSection id="nidurstodur" $show={showResults && loftastodirResult !== null}>
            {loftastodirResult && (
              <ResultsCard>
                <ResultsTitle>Niðurstöður - Loftastoðir</ResultsTitle>

                <LoadInfo>
                  <div className="info-row">
                    <span>Álag á m²:</span>
                    <span>{loftastodirResult.loadPerM2_kN.toFixed(2)} kN/m²</span>
                  </div>
                  <div className="info-row">
                    <span>Álag á stoð:</span>
                    <span>{loftastodirResult.loadPerProp_kN.toFixed(2)} kN</span>
                  </div>
                  <div className="info-row">
                    <span>Álag með öryggisstuðli (×1,5):</span>
                    <span><strong>{loftastodirResult.loadWithSafety_kN.toFixed(2)} kN</strong></span>
                  </div>
                </LoadInfo>

                <ResultsGrid>
                  <ResultItem>
                    <div className="label">Fjöldi loftastoða</div>
                    <div className="value">
                      {loftastodirResult.propCount}
                      <span className="unit">stk</span>
                    </div>
                  </ResultItem>

                  {loftastodirResult.isValid && loftastodirResult.selectedProp && (
                    <>
                      <ResultItem>
                        <div className="label">Heildarþyngd</div>
                        <div className="value">
                          {formatNumber(Math.round(loftastodirResult.totalWeight_kg))}
                          <span className="unit">kg</span>
                        </div>
                      </ResultItem>

                      <ResultItem>
                        <div className="label">Dagverð (per stoð)</div>
                        <div className="value">
                          {loftastodirResult.selectedProp.dayRate}
                          <span className="unit">kr</span>
                        </div>
                      </ResultItem>

                      <ResultItem>
                        <div className="label">Vikulegt verð (per stoð)</div>
                        <div className="value">
                          {loftastodirResult.selectedProp.weekRate}
                          <span className="unit">kr</span>
                        </div>
                      </ResultItem>
                    </>
                  )}
                </ResultsGrid>

                {loftastodirResult.isValid && loftastodirResult.selectedProp && (
                  <>
                    <SelectedItemInfo>
                      <h4>Valin loftastoð</h4>
                      <div className="detail-row">
                        <span className="label">Nafn:</span>
                        <span className="value">{loftastodirResult.selectedProp.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Vörunúmer:</span>
                        <span className="value">{loftastodirResult.selectedProp.articleNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Leigukóði:</span>
                        <span className="value">{loftastodirResult.selectedProp.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Hæðarbil:</span>
                        <span className="value">
                          {loftastodirResult.selectedProp.minHeight_m}–{loftastodirResult.selectedProp.maxHeight_m} m
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Hámarksburður:</span>
                        <span className="value">{loftastodirResult.selectedProp.maxLoad_kN} kN</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Þyngd per stoð:</span>
                        <span className="value">{loftastodirResult.selectedProp.weight_kg} kg</span>
                      </div>
                    </SelectedItemInfo>

                    <TotalPrice>
                      <div>
                        <div className="label">Heildarverð leigu</div>
                        <div className="breakdown">{loftastodirResult.costBreakdown}</div>
                      </div>
                      <div className="price">{formatNumber(loftastodirResult.totalCost)} kr</div>
                    </TotalPrice>
                  </>
                )}

                {!loftastodirResult.isValid && validProps.length > 0 && (
                  <WarningMessage>
                    Vinsamlegast veldu loftastoð til að sjá verð
                  </WarningMessage>
                )}

                {!loftastodirResult.isValid && validProps.length === 0 && (
                  <WarningMessage>
                    Engin loftastoð stenst burð fyrir þessar forsendur.
                    Minnkaðu stoðabil eða þykkt steypu.
                  </WarningMessage>
                )}
              </ResultsCard>
            )}
          </ResultsSection>
        )}

        {/* =================================================================== */}
        {/* UNDIRSLATTUR RESULTS */}
        {/* =================================================================== */}
        {calculatorType === "undirslattur" && (
          <ResultsSection id="nidurstodur" $show={showResults && undirslatturResult !== null}>
            {undirslatturResult && (
              <ResultsCard>
                <ResultsTitle>Niðurstöður - Undirsláttur (HT-20)</ResultsTitle>

                <LoadInfo>
                  <div className="info-row">
                    <span>Hámarks spönn:</span>
                    <span>{undirslatturResult.maxAllowedSpan_m !== null ? `${undirslatturResult.maxAllowedSpan_m} m` : "Ekki skilgreint"}</span>
                  </div>
                  <div className="info-row">
                    <span>Samtals lengd þörf:</span>
                    <span>{undirslatturResult.totalLength_m.toFixed(1)} m</span>
                  </div>
                </LoadInfo>

                <ResultsGrid>
                  <ResultItem>
                    <div className="label">Fjöldi mótabita</div>
                    <div className="value">
                      {undirslatturResult.beamCount}
                      <span className="unit">stk</span>
                    </div>
                  </ResultItem>

                  <ResultItem>
                    <div className="label">Samtals lengd</div>
                    <div className="value">
                      {undirslatturResult.totalLength_m.toFixed(1)}
                      <span className="unit">m</span>
                    </div>
                  </ResultItem>

                  {undirslatturResult.isValid && undirslatturResult.selectedBeam && (
                    <>
                      <ResultItem>
                        <div className="label">Heildarþyngd</div>
                        <div className="value">
                          {formatNumber(Math.round(undirslatturResult.totalWeight_kg))}
                          <span className="unit">kg</span>
                        </div>
                      </ResultItem>

                      <ResultItem>
                        <div className="label">Dagverð (per bita)</div>
                        <div className="value">
                          {undirslatturResult.selectedBeam.dayRate}
                          <span className="unit">kr</span>
                        </div>
                      </ResultItem>

                      <ResultItem>
                        <div className="label">Vikulegt verð (per bita)</div>
                        <div className="value">
                          {undirslatturResult.selectedBeam.weekRate.toFixed(2)}
                          <span className="unit">kr</span>
                        </div>
                      </ResultItem>
                    </>
                  )}
                </ResultsGrid>

                {undirslatturResult.isValid && undirslatturResult.selectedBeam && (
                  <>
                    <SelectedItemInfo>
                      <h4>Valinn mótabiti</h4>
                      <div className="detail-row">
                        <span className="label">Nafn:</span>
                        <span className="value">{undirslatturResult.selectedBeam.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Vörunúmer:</span>
                        <span className="value">{undirslatturResult.selectedBeam.articleNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Leigukóði:</span>
                        <span className="value">{undirslatturResult.selectedBeam.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Lengd:</span>
                        <span className="value">{undirslatturResult.selectedBeam.length_m} m</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Þyngd per bita:</span>
                        <span className="value">{undirslatturResult.selectedBeam.weight_kg} kg</span>
                      </div>
                    </SelectedItemInfo>

                    <TotalPrice>
                      <div>
                        <div className="label">Heildarverð leigu</div>
                        <div className="breakdown">{undirslatturResult.costBreakdown}</div>
                      </div>
                      <div className="price">{formatNumber(Math.round(undirslatturResult.totalCost))} kr</div>
                    </TotalPrice>
                  </>
                )}

                {!undirslatturResult.isValid && validBeams.length > 0 && (
                  <WarningMessage>
                    Vinsamlegast veldu mótabita til að sjá verð
                  </WarningMessage>
                )}

                {!undirslatturResult.isValid && validBeams.length === 0 && (
                  <WarningMessage>
                    Engin mótabitalengd er leyfileg fyrir þessar forsendur.
                    Minnkaðu bil eða þykkt steypu.
                  </WarningMessage>
                )}
              </ResultsCard>
            )}
          </ResultsSection>
        )}
      </ContentContainer>
    </PageContainer>
  );
};
