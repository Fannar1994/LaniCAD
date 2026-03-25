/**
 * Undirsláttur (Mótabitar HT-20) Calculator - Main Component
 * 
 * A rental calculator for HT-20 formwork beams.
 * Calculates quantity, validates span limits, and computes rental costs.
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

import { useCalculateBeams } from "./undirslattur-calculator";
import { undirslatturThicknessOptions, beamSpacingOptions, motabitar } from "./undirslattur-configuration";

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
import type { UndirslatturConfiguration } from "./undirslattur-interface";

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

const SelectedBeamInfo = styled.div`
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

  .beam-detail {
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

const SpanInfo = styled.div`
  background: ${theme.palette.gray[5]};
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: ${theme.palette.gray[80]};

  .span-row {
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

export const Undirslattur = (): JSX.Element => {
  const [showResults, setShowResults] = useState(false);

  // Form state
  const [config, setConfig] = useState<UndirslatturConfiguration>({
    area_m2: 0,
    thickness_cm: 20,
    spacing_m: 0.5,
    rentalDays: 7,
    selectedBeamId: null,
  });

  // Calculate beams and get valid options
  const { result, validBeams } = useCalculateBeams(config);

  // Dropdown options for valid beams
  const beamOptions = useMemo(() => {
    return validBeams.map((beam) => ({
      id: beam.id,
      label: `${beam.name} (${beam.length_m} m)`,
    }));
  }, [validBeams]);

  // Currently selected beam option for dropdown
  const selectedBeamOption = useMemo(() => {
    if (!config.selectedBeamId) return null;
    return beamOptions.find((opt) => opt.id === config.selectedBeamId) ?? null;
  }, [config.selectedBeamId, beamOptions]);

  // Handlers
  const handleAreaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    const numValue = parseFloat(value) || 0;
    setConfig((prev) => ({ ...prev, area_m2: numValue, selectedBeamId: null }));
    setShowResults(false);
  }, []);

  const handleThicknessChange = useCallback(
    (value: { selectedItem?: { id: number; value: number } | null } | null) => {
      const thickness = value?.selectedItem?.value ?? 20;
      setConfig((prev) => ({ ...prev, thickness_cm: thickness, selectedBeamId: null }));
      setShowResults(false);
    },
    []
  );

  const handleSpacingChange = useCallback(
    (value: { selectedItem?: { id: number; value: number } | null } | null) => {
      const spacing = value?.selectedItem?.value ?? 0.5;
      setConfig((prev) => ({ ...prev, spacing_m: spacing, selectedBeamId: null }));
      setShowResults(false);
    },
    []
  );

  const handleDaysChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setConfig((prev) => ({ ...prev, rentalDays: Math.max(1, value) }));
  }, []);

  const handleBeamChange = useCallback(
    (value: { selectedItem?: { id: string } | null } | null) => {
      const beamId = value?.selectedItem?.id ?? null;
      setConfig((prev) => ({ ...prev, selectedBeamId: beamId }));
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
      const element = document.querySelector("#undirslattur-nidurstodur");
      if (element) {
        const offset = 100;
        const position = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: position - offset, behavior: "smooth" });
      }
    }, 100);
  }, [config.area_m2]);

  // Get selected options for dropdowns
  const selectedThickness = undirslatturThicknessOptions.find((opt) => opt.value === config.thickness_cm);
  const selectedSpacing = beamSpacingOptions.find((opt) => opt.value === config.spacing_m);

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
                      items={undirslatturThicknessOptions}
                      itemToString={handleItemToString}
                      placeholder={selectedThickness?.label ?? "Veldu þykkt"}
                      selectedItem={selectedThickness}
                      textColor={theme.palette.blue.dark}
                    />
                  </InputBlock>
                </SelectionContainer>
              </SectionBlock>

              {/* Beam spacing */}
              <SectionBlock>
                <h6>Bil milli mótabita</h6>
                <SelectionContainer>
                  <InputBlock>
                    <Label>Veldu bil (m)</Label>
                    <Select
                      align="left"
                      fit={true}
                      handleSelectedItemChange={handleSpacingChange}
                      hideDefaultPlaceholder={true}
                      hideValue={true}
                      items={beamSpacingOptions}
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

              {/* Beam selection - filtered by span limit */}
              <SectionBlock>
                <h6>Valinn mótabiti</h6>
                <SelectionContainer>
                  <InputBlock>
                    <Label>
                      {validBeams.length > 0
                        ? `${validBeams.length} mótabitar leyfðir (hámark ${result?.maxAllowedSpan_m ?? "-"} m)`
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
        <ResultsSection id="undirslattur-nidurstodur" $show={showResults && result !== null}>
          {result && (
            <ResultsCard>
              <ResultsTitle>Niðurstöður</ResultsTitle>

              {/* Span info */}
              <SpanInfo>
                <div className="span-row">
                  <span>Hámarks spönn:</span>
                  <span>{result.maxAllowedSpan_m !== null ? `${result.maxAllowedSpan_m} m` : "Ekki skilgreint"}</span>
                </div>
                <div className="span-row">
                  <span>Samtals lengd þörf:</span>
                  <span>{result.totalLength_m.toFixed(1)} m</span>
                </div>
              </SpanInfo>

              {/* Main results */}
              <ResultsGrid>
                <ResultItem>
                  <div className="label">Fjöldi mótabita</div>
                  <div className="value">
                    {result.beamCount}
                    <span className="unit">stk</span>
                  </div>
                </ResultItem>

                <ResultItem>
                  <div className="label">Samtals lengd</div>
                  <div className="value">
                    {result.totalLength_m.toFixed(1)}
                    <span className="unit">m</span>
                  </div>
                </ResultItem>

                {result.isValid && result.selectedBeam && (
                  <>
                    <ResultItem>
                      <div className="label">Heildarþyngd</div>
                      <div className="value">
                        {formatNumber(Math.round(result.totalWeight_kg))}
                        <span className="unit">kg</span>
                      </div>
                    </ResultItem>

                    <ResultItem>
                      <div className="label">Dagverð (per bita)</div>
                      <div className="value">
                        {result.selectedBeam.dayRate}
                        <span className="unit">kr</span>
                      </div>
                    </ResultItem>

                    <ResultItem>
                      <div className="label">Vikulegt verð (per bita)</div>
                      <div className="value">
                        {result.selectedBeam.weekRate.toFixed(2)}
                        <span className="unit">kr</span>
                      </div>
                    </ResultItem>
                  </>
                )}
              </ResultsGrid>

              {/* Selected beam details */}
              {result.isValid && result.selectedBeam && (
                <>
                  <SelectedBeamInfo>
                    <h4>Valinn mótabiti</h4>
                    <div className="beam-detail">
                      <span className="label">Nafn:</span>
                      <span className="value">{result.selectedBeam.name}</span>
                    </div>
                    <div className="beam-detail">
                      <span className="label">Vörunúmer:</span>
                      <span className="value">{result.selectedBeam.articleNumber}</span>
                    </div>
                    <div className="beam-detail">
                      <span className="label">Leigukóði:</span>
                      <span className="value">{result.selectedBeam.id}</span>
                    </div>
                    <div className="beam-detail">
                      <span className="label">Lengd:</span>
                      <span className="value">{result.selectedBeam.length_m} m</span>
                    </div>
                    <div className="beam-detail">
                      <span className="label">Þyngd per bita:</span>
                      <span className="value">{result.selectedBeam.weight_kg} kg</span>
                    </div>
                  </SelectedBeamInfo>

                  {/* Total price */}
                  <TotalPrice>
                    <div>
                      <div className="label">Heildarverð leigu</div>
                      <div className="breakdown">{result.costBreakdown}</div>
                    </div>
                    <div className="price">{formatNumber(Math.round(result.totalCost))} kr</div>
                  </TotalPrice>
                </>
              )}

              {/* Warning if no valid beam selected */}
              {!result.isValid && validBeams.length > 0 && (
                <WarningMessage>
                  Vinsamlegast veldu mótabita til að sjá verð
                </WarningMessage>
              )}

              {!result.isValid && validBeams.length === 0 && (
                <WarningMessage>
                  Engin mótabitalengd er leyfileg fyrir þessar forsendur.
                  Minnkaðu bil eða þykkt steypu.
                </WarningMessage>
              )}
            </ResultsCard>
          )}
        </ResultsSection>
      </ContentContainer>
    </PageContainer>
  );
};
