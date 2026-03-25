/* eslint-disable max-len */
import React, { useState, useCallback } from "react";
import { Button } from "@byko/component-buttons";
import { Card } from "@byko/component-cards";
import { Input } from "@byko/component-inputs";
import { PSmall, H3 } from "@byko/component-typography";
import type { ScaffoldType, ScaffoldRentalConfig, ScaffoldMaterialItem } from "./interface";
import {
  NARROW_SCAFFOLD_PRICING,
  WIDE_SCAFFOLD_PRICING,
  QUICKY_PRICING,
  SUPPORT_LEGS_PRICING,
  SCAFFOLD_MATERIALS,
  QUICKY_MATERIALS,
  MATERIAL_NAMES,
} from "./configuration";
import { calculateScaffoldCost, calculateDaysBetween, formatIcelandicDate, formatIcelandicNumber, getTodayDate } from "./utils";
import styled from "styled-components";

const FormGrid = styled.div`
  display: grid;
  gap: 1.5em;
`;

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

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5em;
  display: block;
`;

const ResultContainer = styled.div`
  margin-top: 2em;
  padding: 1.5em;
  background: #f8f9fa;
  border-radius: 8px;
`;

const MaterialTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  
  th, td {
    border: 1px solid #e0e0e0;
    padding: 0.8em;
    text-align: left;
  }
  
  th {
    background: #f8f9fa;
    font-weight: bold;
  }
  
  tr:nth-child(even) {
    background: #f9f9f9;
  }
`;

const WarningText = styled.p`
  color: #d9534f;
  font-weight: bold;
`;

const InfoText = styled.p`
  color: #17a2b8;
  font-size: 0.9em;
`;

export const ScaffoldRental = (): JSX.Element => {
  const [config, setConfig] = useState<ScaffoldRentalConfig>({
    scaffoldType: "narrow",
    height: "2.5",
    supportLegs: false,
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  });

  const [result, setResult] = useState<{
    rentalCost: number;
    supportLegsCost: number;
    deposit: number;
    days: number;
    materials: ScaffoldMaterialItem[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = useCallback((type: ScaffoldType) => {
    setConfig((prev) => ({ 
      ...prev, 
      scaffoldType: type,
      height: type === "quicky" ? undefined : "2.5"
    }));
    setResult(null);
  }, []);

  const calculateRental = useCallback(() => {
    setError(null);

    try {
      if (!config.startDate || !config.endDate) {
        throw new Error("Vinsamlegast veldu gilt tímabil.");
      }

      const startDate = new Date(config.startDate);
      const endDate = new Date(config.endDate);

      if (endDate < startDate) {
        throw new Error("Lokadagur getur ekki verið á undan upphafsdegi.");
      }

      const days = calculateDaysBetween(config.startDate, config.endDate);

      let rentalCost = 0;
      let deposit = 0;
      let materials: ScaffoldMaterialItem[] = [];

      // Calculate based on scaffold type
      if (config.scaffoldType === "quicky") {
        rentalCost = calculateScaffoldCost(QUICKY_PRICING, days);
        deposit = QUICKY_PRICING.deposit;
        materials = QUICKY_MATERIALS;
      } else {
        if (!config.height) {
          throw new Error("Vinsamlegast veldu vinnuhæð.");
        }

        const pricingTable = config.scaffoldType === "narrow" 
          ? NARROW_SCAFFOLD_PRICING 
          : WIDE_SCAFFOLD_PRICING;

        const heightPricing = pricingTable[config.height];
        if (!heightPricing) {
          throw new Error("Valin hæð er ekki í boði.");
        }

        rentalCost = calculateScaffoldCost(heightPricing, days);
        deposit = heightPricing.deposit;

        // Build materials list
        Object.entries(SCAFFOLD_MATERIALS).forEach(([sku, quantities]) => {
          const qty = quantities[config.height!];
          if (qty && qty > 0) {
            materials.push({
              itemno: sku,
              name: MATERIAL_NAMES[sku] || sku,
              qty,
            });
          }
        });
      }

      // Calculate support legs if selected
      let supportLegsCost = 0;
      if (config.supportLegs && config.scaffoldType !== "quicky") {
        supportLegsCost = calculateScaffoldCost(SUPPORT_LEGS_PRICING, days) * 2; // 2 legs
        materials.push({
          itemno: "01-PAL-HP01-115",
          name: "Stuðningsfætur Stillanlegar",
          qty: 2,
        });
      }

      setResult({
        rentalCost,
        supportLegsCost,
        deposit,
        days,
        materials,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Villa við útreikning");
    }
  }, [config]);

  const showHeightOptions = config.scaffoldType !== "quicky";

  return (
    <Card>
      <div style={{ padding: "1.5em" }}>
        <H3>Hjólapallar reiknivél</H3>
        <PSmall>
          Dreymir þig um að byggja sólpall? Veldu tegund af hjólapalli og fylltu inn valmöguleika til að sjá leiguverð.
        </PSmall>

        <FormGrid>
          {/* Scaffold Type */}
          <div>
            <Label>Veldu tegund hjólapalls</Label>
            <RadioGroup>
              <RadioLabel>
                <input
                  type="radio"
                  checked={config.scaffoldType === "narrow"}
                  onChange={() => handleTypeChange("narrow")}
                />
                Hjólapallur mjór (0,75m)
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  checked={config.scaffoldType === "wide"}
                  onChange={() => handleTypeChange("wide")}
                />
                Hjólapallur breiður (1,35m)
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  checked={config.scaffoldType === "quicky"}
                  onChange={() => handleTypeChange("quicky")}
                />
                Quicky pallur (2,0/4,0 mtr.)
              </RadioLabel>
            </RadioGroup>
          </div>

          {/* Height Options */}
          {showHeightOptions && (
            <div>
              <Label>Veldu vinnuhæð</Label>
              <RadioGroup style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {["2.5", "3.5", "4.5", "5.5", "6.5", "7.5", "8.5", "9.5", "10.5"].map((h) => {
                  const workingHeight = parseFloat(h) + 2;
                  return (
                    <RadioLabel key={h}>
                      <input
                        type="radio"
                        checked={config.height === h}
                        onChange={() => setConfig((prev) => ({ ...prev, height: h }))}
                      />
                      {h}/{workingHeight} m
                    </RadioLabel>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* Support Legs */}
          {showHeightOptions && (
            <div>
              <RadioLabel>
                <input
                  type="checkbox"
                  checked={config.supportLegs}
                  onChange={(e) => setConfig((prev) => ({ ...prev, supportLegs: e.target.checked }))}
                />
                Stuðningsfætur (sérstakt leigugjald)
              </RadioLabel>
            </div>
          )}

          {/* Dates */}
          <div>
            <Label>Upphafsdagur</Label>
            <Input
              type="date"
              value={config.startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfig((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div>
            <Label>Áætlaður skiladagur</Label>
            <Input
              type="date"
              value={config.endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfig((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>

          <Button onClick={calculateRental}>Reiknaðu leiguverð</Button>
        </FormGrid>

        {/* Error */}
        {error && (
          <ResultContainer>
            <WarningText>Villa: {error}</WarningText>
          </ResultContainer>
        )}

        {/* Results */}
        {result && (
          <ResultContainer>
            <h4>Leiguverð fyrir hjólapall í {result.days} daga:</h4>
            <p style={{ fontSize: "1.5em", fontWeight: "bold", margin: "0.5em 0" }}>
              {formatIcelandicNumber(result.rentalCost + result.supportLegsCost)} kr.
            </p>

            {result.supportLegsCost > 0 && (
              <InfoText>(stuðningsfætur: {formatIcelandicNumber(result.supportLegsCost)} kr.)</InfoText>
            )}

            <InfoText>
              Leigutími: {result.days} dagar ({formatIcelandicDate(config.startDate)} - {formatIcelandicDate(config.endDate)})
            </InfoText>

            <InfoText style={{ color: "#17a2b8" }}>
              Trygging: {formatIcelandicNumber(result.deposit)} kr. (endurgreitt við skil)
            </InfoText>

            <InfoText style={{ color: "#ff8800", fontWeight: "bold" }}>
              ⚠ Verð er áætlað - hafðu samband við leiga@byko.is fyrir tilboð
            </InfoText>

            {/* Materials Table */}
            <h4 style={{ marginTop: "1.5em" }}>Efnislisti:</h4>
            <MaterialTable>
              <thead>
                <tr>
                  <th>Leigunúmer</th>
                  <th>Lýsing</th>
                  <th>Magn</th>
                </tr>
              </thead>
              <tbody>
                {result.materials.map((item) => (
                  <tr key={item.itemno}>
                    <td>{item.itemno}</td>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </MaterialTable>
          </ResultContainer>
        )}
      </div>
    </Card>
  );
};
