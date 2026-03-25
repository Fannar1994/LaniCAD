import React, { useState } from "react";
import styled from "styled-components";
import { FENCE_DIMENSION_MAPPING, FENCE_PRICING, MIN_RENTAL_DAYS } from "./configuration";
import { getRentalPricing, calculateDaysBetween, formatIcelandicDate, formatIcelandicNumber, getTodayDate } from "./utils-simple";
import type { FenceType, FenceRentalConfig } from "./interface";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2em;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2em;
`;

const Title = styled.h2`
  margin: 0 0 1.5em;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5em;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5em;
  color: #333;
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
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75em;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75em;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 1em 2em;
  border-radius: 4px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 1em;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled.div`
  margin-top: 2em;
  padding: 1.5em;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5em 0;
  border-bottom: 1px solid #dee2e6;
  
  &:last-child {
    border-bottom: none;
    font-weight: bold;
    font-size: 1.2em;
    margin-top: 0.5em;
    padding-top: 1em;
    border-top: 2px solid #007bff;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1em;
  border-radius: 4px;
  margin-top: 1em;
`;

export const FenceRentalStandalone: React.FC = () => {
  const [config, setConfig] = useState<FenceRentalConfig>({
    fenceType: "worksite",
    totalMeters: 0,
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  });

  const [result, setResult] = useState<{ totalCost: number; dailyRate: number; days: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (type: FenceType) => {
    setConfig({ ...config, fenceType: type, height: undefined, thickness: undefined, stoneType: undefined });
    setResult(null);
    setError(null);
  };

  const handleCalculate = () => {
    setError(null);

    // Validation
    if (config.totalMeters <= 0) {
      setError("Please enter a valid number of meters");
      return;
    }

    const days = calculateDaysBetween(config.startDate, config.endDate);
    if (days < MIN_RENTAL_DAYS) {
      setError(`Minimum rental period is ${MIN_RENTAL_DAYS} days`);
      return;
    }

    // Get SKUs based on fence type
    const skus: string[] = [];

    if (config.fenceType === "worksite" && config.height && config.thickness) {
      const key = `${config.height}_${config.thickness}` as keyof typeof FENCE_DIMENSION_MAPPING;
      const fenceSku = FENCE_DIMENSION_MAPPING[key];
      if (fenceSku) skus.push(fenceSku);

      if (config.stoneType) {
        skus.push(FENCE_DIMENSION_MAPPING[config.stoneType as keyof typeof FENCE_DIMENSION_MAPPING]);
      }
    } else if (config.fenceType === "crowd") {
      skus.push(FENCE_DIMENSION_MAPPING.crowd);
    } else if (config.fenceType === "traffic") {
      skus.push(FENCE_DIMENSION_MAPPING.traffic);
    }

    if (skus.length === 0) {
      setError("Please select all required options");
      return;
    }

    // Calculate units and pricing
    const pricing = getRentalPricing(skus, days);

    setResult({
      totalCost: pricing.totalCost,
      dailyRate: pricing.dailyRate,
      days,
    });
  };

  return (
    <Container>
      <Card>
        <Title>Fence Rental Calculator</Title>

        <FormGroup>
          <Label>Fence Type</Label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                name="fenceType"
                checked={config.fenceType === "worksite"}
                onChange={() => handleTypeChange("worksite")}
              />
              Worksite Fence
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                name="fenceType"
                checked={config.fenceType === "crowd"}
                onChange={() => handleTypeChange("crowd")}
              />
              Crowd Control
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                name="fenceType"
                checked={config.fenceType === "traffic"}
                onChange={() => handleTypeChange("traffic")}
              />
              Traffic Barrier
            </RadioLabel>
          </RadioGroup>
        </FormGroup>

        {config.fenceType === "worksite" && (
          <>
            <FormGroup>
              <Label>Height</Label>
              <Select value={config.height || ""} onChange={(e) => setConfig({ ...config, height: e.target.value as any })}>
                <option value="">Select height</option>
                <option value="1.2">1.2m</option>
                <option value="2.0">2.0m</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Thickness</Label>
              <Select value={config.thickness || ""} onChange={(e) => setConfig({ ...config, thickness: e.target.value as any })}>
                <option value="">Select thickness</option>
                <option value="1.1">1.1mm</option>
                <option value="1.7">1.7mm</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Stone Type (Optional)</Label>
              <Select value={config.stoneType || ""} onChange={(e) => setConfig({ ...config, stoneType: e.target.value || undefined })}>
                <option value="">None</option>
                <option value="stone_15kg">15kg Stone</option>
                <option value="stone_25kg">25kg Stone</option>
              </Select>
            </FormGroup>
          </>
        )}

        <FormGroup>
          <Label>Total Meters</Label>
          <Input
            type="number"
            min="0"
            value={config.totalMeters || ""}
            onChange={(e) => setConfig({ ...config, totalMeters: parseFloat(e.target.value) || 0 })}
            placeholder="Enter total meters"
          />
        </FormGroup>

        <FormGroup>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={config.startDate}
            onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>End Date</Label>
          <Input
            type="date"
            value={config.endDate}
            onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
          />
        </FormGroup>

        <Button onClick={handleCalculate}>Calculate Price</Button>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {result && (
          <ResultContainer>
            <ResultRow>
              <span>Rental Period:</span>
              <span>{result.days} days</span>
            </ResultRow>
            <ResultRow>
              <span>Daily Rate:</span>
              <span>{formatIcelandicNumber(result.dailyRate)}</span>
            </ResultRow>
            <ResultRow>
              <span>Total Cost:</span>
              <span>{formatIcelandicNumber(result.totalCost)}</span>
            </ResultRow>
          </ResultContainer>
        )}
      </Card>
    </Container>
  );
};
