/* eslint-disable max-len */
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@byko/component-buttons";
import { Card } from "@byko/component-cards";
import { Input } from "@byko/component-inputs";
import { PSmall, H3 } from "@byko/component-typography";
import type { FenceType, FenceRentalConfig, RentalResultDisplay } from "../interface";
import { FENCE_DIMENSION_MAPPING, FENCE_PRICING, MIN_RENTAL_DAYS } from "../configuration";
import {
  getRentalPricing,
  calculateDaysBetween,
  formatIcelandicDate,
  formatIcelandicNumber,
  getTodayDate,
} from "../utils";
import {
  CardInner,
  InputBlock,
  InputBlockInner,
  Label,
  ButtonActionContainer,
  PriceRow,
  PriceTitle,
  PriceAmount,
} from "../../styles";
import styled from "styled-components";

const RadioGroup = styled.div`
  display: flex;
  gap: 1.5em;
  flex-wrap: wrap;
  margin: 1em 0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5em;
  cursor: pointer;
  font-weight: bold;
`;

const ResultContainer = styled.div`
  margin-top: 2em;
  padding: 1.5em;
  background: #f8f9fa;
  border-radius: 8px;
`;

const WarningText = styled.p`
  color: #d9534f;
  font-weight: bold;
  margin: 0.5em 0;
`;

const InfoText = styled.p`
  color: #17a2b8;
  font-size: 0.9em;
  margin: 0.5em 0;
`;

const SuccessText = styled.p`
  color: #28a745;
  margin: 0.5em 0;
`;

export const FenceRental = (): JSX.Element => {
  const [config, setConfig] = useState<FenceRentalConfig>({
    fenceType: "worksite",
    height: "2.0",
    thickness: "1.1",
    stoneType: "01-BAT-GI01-054",
    totalMeters: 0,
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  });

  const [result, setResult] = useState<RentalResultDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Inriver config on mount
  React.useEffect(() => {
    loadInriverConfig();
  }, []);

  const handleFenceTypeChange = useCallback((type: FenceType) => {
    setConfig((prev) => ({ ...prev, fenceType: type }));
    setResult(null);
  }, []);

  const handleInputChange = useCallback((field: keyof FenceRentalConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  }, []);

  const calculateRental = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!config.totalMeters || config.totalMeters <= 0) {
        throw new Error("Heildarmetrar eru ógildir eða ekki fylltir inn.");
      }

      if (!config.startDate || !config.endDate) {
        throw new Error("Vinsamlegast veldu gilt tímabil.");
      }

      const startDate = new Date(config.startDate);
      const endDate = new Date(config.endDate);

      if (endDate < startDate) {
        throw new Error("Lokadagur getur ekki verið á undan upphafsdegi.");
      }

      const days = calculateDaysBetween(config.startDate, config.endDate);

      // Determine items to price based on fence type
      let itemsToPrice: string[] = [];
      let unitLength: number;

      if (config.fenceType === "crowd") {
        unitLength = 2.5;
        itemsToPrice = ["01-BAT-GI01-050"];
      } else if (config.fenceType === "traffic") {
        unitLength = 1.5;
        itemsToPrice = ["01-BAT-VE01-260", "01-BAT-VE01-265"];
      } else {
        // Worksite fence
        unitLength = 3.5;
        if (!config.height || !config.thickness) {
          throw new Error("Vinsamlegast veldu hæð og þykkt.");
        }

        const fenceKey = `${unitLength}_${config.height}_${config.thickness}`;
        const fenceSku = FENCE_DIMENSION_MAPPING[fenceKey];

        if (!fenceSku) {
          throw new Error("Valin samsetning á girðingu er ekki í boði.");
        }

        itemsToPrice = [fenceSku, "01-BAT-GI01-097", config.stoneType || "01-BAT-GI01-054"];
      }

      // Get pricing from Inriver or fallback
      const pricingResult = await getRentalPricing(itemsToPrice, days);
      let dailyRatePerUnit = pricingResult.rate;

      // Traffic barriers are priced per pair
      if (config.fenceType === "traffic") {
        dailyRatePerUnit /= 2;
      }

      const numUnits = Math.ceil(config.totalMeters / unitLength);
      const totalCost = dailyRatePerUnit * numUnits * days;

      setResult({
        totalCost,
        dailyRate: dailyRatePerUnit,
        days,
        source: pricingResult.source,
        warning: days < MIN_RENTAL_DAYS ? `Lágmarksleigtími er ${MIN_RENTAL_DAYS} dagar` : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Villa við útreikning");
    } finally {
      setLoading(false);
    }
  }, [config]);

  const showWorksiteOptions = useMemo(() => config.fenceType === "worksite", [config.fenceType]);

  return (
    <Card>
      <CardInner>
        <H3>Girðingar reiknivél</H3>
        <PSmall>
          Viltu aðeins meira næði? Veldu tegund af girðingu og fylltu inn valmöguleika til að sjá leiguverð.
        </PSmall>

        {/* Fence Type Selection */}
        <InputBlock>
          <Label>Tegund girðingar</Label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                checked={config.fenceType === "worksite"}
                onChange={() => handleFenceTypeChange("worksite")}
              />
              Vinnustaðagirðingar
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                checked={config.fenceType === "crowd"}
                onChange={() => handleFenceTypeChange("crowd")}
              />
              Biðraðagirðingar
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                checked={config.fenceType === "traffic"}
                onChange={() => handleFenceTypeChange("traffic")}
              />
              Vegatálmi
            </RadioLabel>
          </RadioGroup>
        </InputBlock>

        {/* Worksite Fence Options */}
        {showWorksiteOptions && (
          <>
            <InputBlock>
              <Label>Hæð í metrum</Label>
              <RadioGroup>
                <RadioLabel>
                  <input
                    type="radio"
                    checked={config.height === "2.0"}
                    onChange={() => handleInputChange("height", "2.0")}
                  />
                  2,0 m
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    checked={config.height === "1.2"}
                    onChange={() => handleInputChange("height", "1.2")}
                  />
                  1,2 m
                </RadioLabel>
              </RadioGroup>
            </InputBlock>

            <InputBlock>
              <Label>Steinar</Label>
              <RadioGroup>
                <RadioLabel>
                  <input
                    type="radio"
                    checked={config.stoneType === "01-BAT-GI01-054"}
                    onChange={() => handleInputChange("stoneType", "01-BAT-GI01-054")}
                  />
                  Steyptir steinar
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    checked={config.stoneType === "01-BAT-GI01-0541"}
                    onChange={() => handleInputChange("stoneType", "01-BAT-GI01-0541")}
                  />
                  PVC steinar
                </RadioLabel>
              </RadioGroup>
            </InputBlock>

            <InputBlock>
              <Label>Þykkt á túbu (mm)</Label>
              <RadioGroup>
                <RadioLabel>
                  <input
                    type="radio"
                    checked={config.thickness === "1.1"}
                    onChange={() => handleInputChange("thickness", "1.1")}
                  />
                  1,1 mm
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    checked={config.thickness === "1.7"}
                    onChange={() => handleInputChange("thickness", "1.7")}
                  />
                  1,7 mm
                </RadioLabel>
              </RadioGroup>
            </InputBlock>
          </>
        )}

        {/* Total Meters */}
        <InputBlockInner>
          <Label>Samtals metrar</Label>
          <Input
            type="number"
            value={config.totalMeters || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("totalMeters", parseFloat(e.target.value) || 0)
            }
            min={0}
            step="any"
          />
        </InputBlockInner>

        {/* Date Range */}
        <InputBlockInner>
          <Label>Upphafsdagur</Label>
          <Input
            type="date"
            value={config.startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("startDate", e.target.value)
            }
          />
        </InputBlockInner>

        <InputBlockInner>
          <Label>Áætlaður skiladagur</Label>
          <Input
            type="date"
            value={config.endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("endDate", e.target.value)
            }
          />
        </InputBlockInner>

        <ButtonActionContainer>
          <Button onClick={calculateRental} disabled={loading}>
            {loading ? "Reiknar..." : "Reiknaðu leiguverð"}
          </Button>
        </ButtonActionContainer>

        {/* Results */}
        {error && (
          <ResultContainer>
            <WarningText>Villa: {error}</WarningText>
          </ResultContainer>
        )}

        {result && (
          <ResultContainer>
            <PriceRow>
              <PriceTitle>Áætlað verð fyrir {config.totalMeters}m í {result.days} daga:</PriceTitle>
              <PriceAmount>{formatIcelandicNumber(result.totalCost)} kr.</PriceAmount>
            </PriceRow>

            {result.dailyRate && (
              <InfoText>
                Dagleg einingu-taxa: {formatIcelandicNumber(result.dailyRate)} kr.
              </InfoText>
            )}

            <InfoText>
              Leigutími: {result.days} dagar ({formatIcelandicDate(config.startDate)} -{" "}
              {formatIcelandicDate(config.endDate)})
            </InfoText>

            {result.source === "api" ? (
              <SuccessText>✓ Verð er live úr verðgrunni (Inriver PIM)</SuccessText>
            ) : (
              <InfoText style={{ color: "#ff8800" }}>
                ⚠ Verð er áætlað - hafðu samband fyrir nákvæmt tilboð
              </InfoText>
            )}

            {result.warning && <WarningText>⚠ {result.warning}</WarningText>}
          </ResultContainer>
        )}
      </CardInner>
    </Card>
  );
};
