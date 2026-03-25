/**
 * Iðnaðargirðingar (Industrial Fence) Calculator
 * 
 * A rental calculator for construction site fencing.
 * Handles fence panels, stones, clamps, and accessories.
 */

import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { PageContainer } from "@byko/component-page-container";
import { Card } from "@byko/component-cards";
import { Button } from "@byko/component-buttons";
import { Input } from "@byko/component-inputs";
import { LongArrowSideIcons } from "@byko/lib-icons";
import { theme } from "@byko/lib-styles";

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

// Products with sales prices and rental codes
const PRODUCTS: Record<string, {
  saleNo: string;
  rentalNo: string;
  description: string;
  rates: number[];
  salePrice: number;
}> = {
  // Main fence panels
  'fence-3500x2000x1.1': {
    saleNo: '0295300',
    rentalNo: '01-BAT-GI01-015',
    description: 'Girðingar 3500x2000x1,1mm',
    rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13],
    salePrice: 19995
  },
  'fence-3500x2000x1.7': {
    saleNo: '0295317',
    rentalNo: '01-BAT-GI01-053',
    description: 'Girðingar 3500x2000x1,7mm',
    rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13],
    salePrice: 24995
  },
  'fence-3500x1200x1.1': {
    saleNo: '0295290',
    rentalNo: '01-BAT-GI01-052',
    description: 'Girðingar 3500x1200x1,1mm',
    rates: [80, 40, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    salePrice: 12995
  },
  'queue-barrier': {
    saleNo: '0295292',
    rentalNo: '01-BAT-GI01-050',
    description: 'Biðraðagirðingar 2500x1100mm',
    rates: [130, 65, 33, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    salePrice: 24995
  },
  'plastic-fence': {
    saleNo: '0295243',
    rentalNo: '01-BAT-GI01-043',
    description: 'Girðing plast 2100x1100mm',
    rates: [80, 40, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    salePrice: 26995
  },
  // Stones
  'stone-concrete': {
    saleNo: '0295320',
    rentalNo: '01-BAT-GI01-054',
    description: 'Steinar f/girðingar',
    rates: [20, 10, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    salePrice: 2495
  },
  'stone-pvc': {
    saleNo: '0295325',
    rentalNo: '01-BAT-GI01-0541',
    description: 'PVC Steinar f/girðingar',
    rates: [50, 25, 13, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    salePrice: 3995
  },
  // Clamps
  'clamps': {
    saleNo: '97100097',
    rentalNo: '01-BAT-GI01-097',
    description: 'Klemmur f/girðingar',
    rates: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    salePrice: 995
  },
  // Accessories
  'walking-gate': {
    saleNo: '97100096',
    rentalNo: '01-BAT-GI01-096',
    description: 'Gönguhlið 120cm',
    rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13],
    salePrice: 20312
  },
  'wheels': {
    saleNo: '97100099',
    rentalNo: '01-BAT-GI01-099',
    description: 'Hjól f/girðingar',
    rates: [110, 55, 28, 14, 14, 14, 14, 14, 14, 14, 14, 14],
    salePrice: 18395
  },
  'warning-sign': {
    saleNo: '0295245',
    rentalNo: '01-BAT-GI01-045',
    description: 'Gátaskjöldur 1300x310mm',
    rates: [40, 20, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    salePrice: 9995
  }
};

// Styled components
const RadioGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const RadioLabel = styled.label<{ $selected?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  padding: 12px 20px;
  border: 2px solid ${props => props.$selected ? theme.palette.blue.main : theme.palette.gray[10]};
  border-radius: 8px;
  background: ${props => props.$selected ? theme.palette.blue.lightest : '#fff'};
  transition: all 0.2s ease;
  user-select: none;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  font-weight: ${props => props.$selected ? 500 : 400};

  &:hover {
    border-color: ${props => props.$disabled ? theme.palette.gray[10] : theme.palette.blue.main};
    background: ${props => props.$disabled ? theme.palette.gray[5] : (props.$selected ? theme.palette.blue.lightest : '#f8fbfc')};
  }
`;

const RadioInput = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${theme.palette.blue.main};

  &:disabled {
    cursor: not-allowed;
  }
`;

const FenceTypeImage = styled.img`
  width: 60px;
  height: 40px;
  object-fit: contain;
  margin-right: 8px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CheckboxLabel = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px 16px;
  border: 2px solid ${props => props.$selected ? theme.palette.blue.main : theme.palette.gray[10]};
  border-radius: 8px;
  background: ${props => props.$selected ? theme.palette.blue.lightest : '#fff'};
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: ${theme.palette.blue.main};
    background: ${props => props.$selected ? theme.palette.blue.lightest : '#f8fbfc'};
  }
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.palette.blue.main};
`;

const NumberInput = styled.input`
  width: 80px;
  padding: 6px 10px;
  border: 2px solid ${theme.palette.gray[10]};
  border-radius: 6px;
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${theme.palette.blue.main};
  }
`;

const ResultsSection = styled.div<{ $show?: boolean }>`
  display: ${props => props.$show ? 'block' : 'none'};
  margin-top: 40px;
  background: linear-gradient(135deg, #f8fdfe 0%, #f0f9fa 100%);
  border: 2px solid ${theme.palette.blue.main};
  border-radius: 12px;
  padding: 32px;

  h3 {
    margin-top: 0;
    margin-bottom: 24px;
    color: ${theme.palette.blue.dark};
    font-size: 24px;
    font-weight: 600;
  }
`;

const PricingInfo = styled.div`
  background: ${theme.palette.gray[5]};
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
  font-size: 14px;
  color: ${theme.palette.gray[80]};
  line-height: 1.5;
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  border: 1px solid ${theme.palette.gray[10]};

  th {
    background: ${theme.palette.blue.main};
    color: white;
    padding: 14px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;

    &.hidden {
      display: none;
    }
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid ${theme.palette.gray[5]};
    color: ${theme.palette.gray[80]};
    background: white;
    font-size: 14px;

    &.hidden {
      display: none;
    }
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:nth-child(even) td {
    background-color: ${theme.palette.gray[5]};
  }

  tbody tr:hover td {
    background-color: ${theme.palette.blue.lightest};
  }
`;

const TotalPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-top: 16px;
  background: linear-gradient(135deg, ${theme.palette.blue.lightest} 0%, #d1ecf1 100%);
  border-radius: 8px;
  border-top: 3px solid ${theme.palette.blue.main};

  span:first-child {
    font-size: 18px;
    font-weight: 600;
    color: ${theme.palette.blue.dark};
  }

  span:last-child {
    font-size: 32px;
    font-weight: 700;
    color: ${theme.palette.blue.main};
  }
`;

// Number formatter for Icelandic locale
const formatNumber = (num: number): string => {
  return num.toLocaleString("is-IS");
};

const calculateRentalCost = (days: number, baseRate: number, qty: number): number => {
  let totalCost = 0;
  let remainingDays = days;

  // Period 1: Days 1-30 at 100%
  const period1Days = Math.min(remainingDays, 30);
  totalCost += period1Days * baseRate * qty;
  remainingDays -= period1Days;

  // Period 2: Days 31-60 at 50%
  if (remainingDays > 0) {
    const period2Days = Math.min(remainingDays, 30);
    totalCost += period2Days * (baseRate * 0.5) * qty;
    remainingDays -= period2Days;
  }

  // Period 3: Days 61-90 at 25%
  if (remainingDays > 0) {
    const period3Days = Math.min(remainingDays, 30);
    totalCost += period3Days * (baseRate * 0.25) * qty;
    remainingDays -= period3Days;
  }

  // Period 4: Days 91+ at 12.5%
  if (remainingDays > 0) {
    totalCost += remainingDays * (baseRate * 0.125) * qty;
  }

  return totalCost;
};

const getBaseRate = (rates: number[]): number => {
  return rates[0];
};

// Types
type FenceTypeValue = 'standard' | 'queue' | 'plastic' | 'warning-sign';
type StoneTypeValue = 'concrete' | 'pvc';

interface ResultItem {
  saleNo: string;
  rentalNo: string;
  description: string;
  qty: number;
  baseRate: number;
  totalCost: number;
  salePrice: number;
}

export const Fence = (): JSX.Element => {
  const [showResults, setShowResults] = useState(false);

  // Form state
  const [fenceType, setFenceType] = useState<FenceTypeValue>('standard');
  const [heightMeters, setHeightMeters] = useState<string>('2.0');
  const [thicknessMm, setThicknessMm] = useState<string>('1.1');
  const [stoneType, setStoneType] = useState<StoneTypeValue>('concrete');
  const [totalMeters, setTotalMeters] = useState<string>('');
  const [warningSignQty, setWarningSignQty] = useState<number>(0);
  
  // Dates
  const today = new Date();
  const tenDaysLater = new Date(today);
  tenDaysLater.setDate(today.getDate() + 10);
  
  const [startDate, setStartDate] = useState<string>(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(tenDaysLater.toISOString().split('T')[0]);

  // Accessories
  const [walkingGateQty, setWalkingGateQty] = useState<number>(0);
  const [wheelsQty, setWheelsQty] = useState<number>(0);

  // Calculate rental days
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 10;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(10, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  // Auto-adjust thickness when height changes to 1.2m
  React.useEffect(() => {
    if (heightMeters === '1.2' && thicknessMm === '1.7') {
      setThicknessMm('1.1');
    }
  }, [heightMeters, thicknessMm]);

  // Calculate results
  const calculateResults = useCallback(() => {
    const meters = parseFloat(totalMeters) || 0;
    if (meters <= 0 && fenceType !== 'warning-sign') {
      alert('Vinsamlegast sláðu inn metratölu');
      return;
    }
    if (fenceType === 'warning-sign' && warningSignQty <= 0) {
      alert('Vinsamlegast sláðu inn magn');
      return;
    }
    setShowResults(true);
  }, [totalMeters, fenceType, warningSignQty]);

  // Computed results
  const results = useMemo(() => {
    if (!showResults) return null;

    const meters = parseFloat(totalMeters) || 0;
    const days = rentalDays;

    // Determine fence length based on type
    let fenceLength: number;
    let useQuantityInput = false;
    
    if (fenceType === 'standard') {
      fenceLength = 3.5;
    } else if (fenceType === 'queue') {
      fenceLength = 2.5;
    } else if (fenceType === 'warning-sign') {
      fenceLength = 1;
      useQuantityInput = true;
    } else {
      fenceLength = 2.1; // plastic
    }

    // Calculate fence count
    const fenceCount = useQuantityInput ? warningSignQty : Math.ceil(meters / fenceLength);

    // Stones calculation
    let stoneCount: number;
    if (fenceType === 'queue') {
      stoneCount = 0;
    } else if (fenceType === 'warning-sign') {
      stoneCount = fenceCount; // 1 PVC stone per Gátaskjöldur
    } else {
      stoneCount = fenceCount + 1;
    }

    // Clamps: fenceCount - 1 for standard fences only
    const clampCount = fenceType === 'standard' ? Math.max(0, fenceCount - 1) : 0;

    if (fenceCount <= 0) return null;

    // Get product keys
    let fenceProductKey: string;
    if (fenceType === 'standard') {
      if (heightMeters === '2.0' && thicknessMm === '1.1') {
        fenceProductKey = 'fence-3500x2000x1.1';
      } else if (heightMeters === '2.0' && thicknessMm === '1.7') {
        fenceProductKey = 'fence-3500x2000x1.7';
      } else {
        fenceProductKey = 'fence-3500x1200x1.1';
      }
    } else if (fenceType === 'queue') {
      fenceProductKey = 'queue-barrier';
    } else if (fenceType === 'warning-sign') {
      fenceProductKey = 'warning-sign';
    } else {
      fenceProductKey = 'plastic-fence';
    }

    // Stone product key
    const stoneProductKey = (fenceType === 'warning-sign') ? 'stone-pvc' : (stoneType === 'pvc' ? 'stone-pvc' : 'stone-concrete');

    // Build results
    const items: ResultItem[] = [];
    let totalPrice = 0;
    let totalSalePrice = 0;

    // Main fence
    const fenceProduct = PRODUCTS[fenceProductKey];
    const fenceBaseRate = getBaseRate(fenceProduct.rates);
    const fenceCost = calculateRentalCost(days, fenceBaseRate, fenceCount);
    items.push({
      saleNo: fenceProduct.saleNo,
      rentalNo: fenceProduct.rentalNo,
      description: fenceProduct.description,
      qty: fenceCount,
      baseRate: fenceBaseRate,
      totalCost: fenceCost,
      salePrice: fenceProduct.salePrice
    });
    totalPrice += fenceCost;
    totalSalePrice += fenceProduct.salePrice * fenceCount;

    // Stones (not for queue barriers)
    if (stoneCount > 0) {
      const stoneProduct = PRODUCTS[stoneProductKey];
      const stoneBaseRate = getBaseRate(stoneProduct.rates);
      const stoneCost = calculateRentalCost(days, stoneBaseRate, stoneCount);
      items.push({
        saleNo: stoneProduct.saleNo,
        rentalNo: stoneProduct.rentalNo,
        description: stoneProduct.description,
        qty: stoneCount,
        baseRate: stoneBaseRate,
        totalCost: stoneCost,
        salePrice: stoneProduct.salePrice
      });
      totalPrice += stoneCost;
      totalSalePrice += stoneProduct.salePrice * stoneCount;
    }

    // Clamps (for standard fences only)
    if (clampCount > 0) {
      const clampProduct = PRODUCTS['clamps'];
      const clampBaseRate = getBaseRate(clampProduct.rates);
      const clampCost = calculateRentalCost(days, clampBaseRate, clampCount);
      items.push({
        saleNo: clampProduct.saleNo,
        rentalNo: clampProduct.rentalNo,
        description: clampProduct.description,
        qty: clampCount,
        baseRate: clampBaseRate,
        totalCost: clampCost,
        salePrice: clampProduct.salePrice
      });
      totalPrice += clampCost;
      totalSalePrice += clampProduct.salePrice * clampCount;
    }

    // Walking gate accessory
    if (walkingGateQty > 0 && fenceType !== 'queue') {
      const product = PRODUCTS['walking-gate'];
      const baseRate = getBaseRate(product.rates);
      const cost = calculateRentalCost(days, baseRate, walkingGateQty);
      items.push({
        saleNo: product.saleNo,
        rentalNo: product.rentalNo,
        description: product.description,
        qty: walkingGateQty,
        baseRate: baseRate,
        totalCost: cost,
        salePrice: product.salePrice
      });
      totalPrice += cost;
      totalSalePrice += product.salePrice * walkingGateQty;
    }

    // Wheels accessory (standard fences only)
    if (wheelsQty > 0 && fenceType === 'standard') {
      const product = PRODUCTS['wheels'];
      const baseRate = getBaseRate(product.rates);
      const cost = calculateRentalCost(days, baseRate, wheelsQty);
      items.push({
        saleNo: product.saleNo,
        rentalNo: product.rentalNo,
        description: product.description,
        qty: wheelsQty,
        baseRate: baseRate,
        totalCost: cost,
        salePrice: product.salePrice
      });
      totalPrice += cost;
      totalSalePrice += product.salePrice * wheelsQty;
    }

    // Determine visible periods
    const showPeriod2 = days > 30;
    const showPeriod3 = days > 60;
    const showPeriod4 = days > 90;

    return {
      items,
      totalPrice,
      totalSalePrice,
      days,
      showPeriod2,
      showPeriod3,
      showPeriod4
    };
  }, [showResults, totalMeters, rentalDays, fenceType, heightMeters, thicknessMm, stoneType, warningSignQty, walkingGateQty, wheelsQty]);

  const handleShowResults = useCallback(() => {
    calculateResults();
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
  }, [calculateResults]);

  // Visibility helpers
  const showHeightOptions = fenceType === 'standard';
  const showThicknessOptions = fenceType === 'standard';
  const showStoneTypeOptions = fenceType === 'standard' || fenceType === 'plastic';
  const showWheels = fenceType === 'standard';
  const showWalkingGate = fenceType !== 'queue' && fenceType !== 'warning-sign';
  const showMetersInput = fenceType !== 'warning-sign';

  return (
    <PageContainer flexDirection="column" offsetNav={false}>
      <ContentContainer>
        <Card>
            <>
              <CardInner>
                <SectionBlock>
                  <h6>Veldu tegund girðingar</h6>
                  <SelectionContainer>
                    <RadioGroup>
                      <RadioLabel 
                        $selected={fenceType === 'standard'}
                        onClick={() => setFenceType('standard')}
                      >
                        <RadioInput
                          type="radio"
                          name="fenceType"
                          value="standard"
                          checked={fenceType === 'standard'}
                          onChange={() => setFenceType('standard')}
                        />
                        <FenceTypeImage src="./images/01-BAT-GI01-015.png" alt="Vinnustaðagirðing" />
                        Girðingar 3,5m
                      </RadioLabel>
                      <RadioLabel 
                        $selected={fenceType === 'queue'}
                        onClick={() => setFenceType('queue')}
                      >
                        <RadioInput
                          type="radio"
                          name="fenceType"
                          value="queue"
                          checked={fenceType === 'queue'}
                          onChange={() => setFenceType('queue')}
                        />
                        <FenceTypeImage src="./images/01-BAT-GI01-050.png" alt="Biðraðagirðing" />
                        Biðraðagirðingar 2,5m
                      </RadioLabel>
                      <RadioLabel 
                        $selected={fenceType === 'plastic'}
                        onClick={() => setFenceType('plastic')}
                      >
                        <RadioInput
                          type="radio"
                          name="fenceType"
                          value="plastic"
                          checked={fenceType === 'plastic'}
                          onChange={() => setFenceType('plastic')}
                        />
                        <FenceTypeImage src="./images/01-BAT-GI01-043.png" alt="Plastgirðing" />
                        Plast girðingar 2,1m
                      </RadioLabel>
                      <RadioLabel 
                        $selected={fenceType === 'warning-sign'}
                        onClick={() => setFenceType('warning-sign')}
                      >
                        <RadioInput
                          type="radio"
                          name="fenceType"
                          value="warning-sign"
                          checked={fenceType === 'warning-sign'}
                          onChange={() => setFenceType('warning-sign')}
                        />
                        <FenceTypeImage src="./images/01-BAT-GI01-045.png" alt="Gátaskjöldur" />
                        Gátaskjöldur
                      </RadioLabel>
                    </RadioGroup>
                  </SelectionContainer>
                </SectionBlock>

                {showHeightOptions && (
                  <SectionBlock>
                    <h6>Hæð í metrum</h6>
                    <SelectionContainer>
                      <RadioGroup>
                        <RadioLabel 
                          $selected={heightMeters === '2.0'}
                          onClick={() => setHeightMeters('2.0')}
                        >
                          <RadioInput
                            type="radio"
                            name="height"
                            value="2.0"
                            checked={heightMeters === '2.0'}
                            onChange={() => setHeightMeters('2.0')}
                          />
                          2,0 m
                        </RadioLabel>
                        <RadioLabel 
                          $selected={heightMeters === '1.2'}
                          onClick={() => setHeightMeters('1.2')}
                        >
                          <RadioInput
                            type="radio"
                            name="height"
                            value="1.2"
                            checked={heightMeters === '1.2'}
                            onChange={() => setHeightMeters('1.2')}
                          />
                          1,2 m
                        </RadioLabel>
                      </RadioGroup>
                    </SelectionContainer>
                  </SectionBlock>
                )}

                {showThicknessOptions && (
                  <SectionBlock>
                    <h6>Þykkt á túbu (mm)</h6>
                    <SelectionContainer>
                      <RadioGroup>
                        <RadioLabel 
                          $selected={thicknessMm === '1.1'}
                          onClick={() => setThicknessMm('1.1')}
                        >
                          <RadioInput
                            type="radio"
                            name="thickness"
                            value="1.1"
                            checked={thicknessMm === '1.1'}
                            onChange={() => setThicknessMm('1.1')}
                          />
                          1,1 mm
                        </RadioLabel>
                        <RadioLabel 
                          $selected={thicknessMm === '1.7'}
                          $disabled={heightMeters === '1.2'}
                          onClick={() => heightMeters !== '1.2' && setThicknessMm('1.7')}
                        >
                          <RadioInput
                            type="radio"
                            name="thickness"
                            value="1.7"
                            checked={thicknessMm === '1.7'}
                            onChange={() => setThicknessMm('1.7')}
                            disabled={heightMeters === '1.2'}
                          />
                          1,7 mm {heightMeters === '1.2' && '(Aðeins fyrir 2,0 m hæð)'}
                        </RadioLabel>
                      </RadioGroup>
                    </SelectionContainer>
                  </SectionBlock>
                )}

                {showStoneTypeOptions && (
                  <SectionBlock>
                    <h6>Steinar</h6>
                    <SelectionContainer>
                      <RadioGroup>
                        <RadioLabel 
                          $selected={stoneType === 'concrete'}
                          onClick={() => setStoneType('concrete')}
                        >
                          <RadioInput
                            type="radio"
                            name="stoneType"
                            value="concrete"
                            checked={stoneType === 'concrete'}
                            onChange={() => setStoneType('concrete')}
                          />
                          Steyptir steinar
                        </RadioLabel>
                        <RadioLabel 
                          $selected={stoneType === 'pvc'}
                          onClick={() => setStoneType('pvc')}
                        >
                          <RadioInput
                            type="radio"
                            name="stoneType"
                            value="pvc"
                            checked={stoneType === 'pvc'}
                            onChange={() => setStoneType('pvc')}
                          />
                          PVC steinar
                        </RadioLabel>
                      </RadioGroup>
                    </SelectionContainer>
                  </SectionBlock>
                )}

                <SectionBlock>
                  <h6>Leigutímabil</h6>
                  <SelectionContainer>
                    <InputBlock>
                      <Label>
                        {showMetersInput ? 'Samtals metrar' : 'Magn'}
                      </Label>
                      {showMetersInput ? (
                        <Input
                          $stretch={true}
                          type="number"
                          min="0"
                          step="0.1"
                          value={totalMeters}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setTotalMeters(e.target.value)}
                          placeholder="Sláðu inn metratölu"
                        />
                      ) : (
                        <Input
                          $stretch={true}
                          type="number"
                          min="0"
                          step="1"
                          value={warningSignQty.toString()}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setWarningSignQty(parseInt(e.target.value) || 0)}
                          placeholder="Sláðu inn magn"
                        />
                      )}
                    </InputBlock>
                    <InputBlock>
                      <Label>Upphafsdagur</Label>
                      <Input
                        $stretch={true}
                        type="date"
                        value={startDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                      />
                    </InputBlock>
                    <InputBlock>
                      <Label>Skiladagur</Label>
                      <Input
                        $stretch={true}
                        type="date"
                        value={endDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                      />
                    </InputBlock>
                  </SelectionContainer>
                </SectionBlock>

                {(showWalkingGate || showWheels) && (
                  <SectionBlock>
                    <h6>Aukahlutir</h6>
                    <SelectionContainer>
                      <CheckboxGroup>
                        {showWalkingGate && (
                          <CheckboxLabel $selected={walkingGateQty > 0}>
                            <CheckboxInput
                              type="checkbox"
                              checked={walkingGateQty > 0}
                              onChange={(e) => setWalkingGateQty(e.target.checked ? 1 : 0)}
                            />
                            Gönguhlið
                            <NumberInput
                              type="number"
                              min="0"
                              value={walkingGateQty}
                              onChange={(e) => setWalkingGateQty(parseInt(e.target.value) || 0)}
                            />
                            stk
                          </CheckboxLabel>
                        )}
                        {showWheels && (
                          <CheckboxLabel $selected={wheelsQty > 0}>
                            <CheckboxInput
                              type="checkbox"
                              checked={wheelsQty > 0}
                              onChange={(e) => setWheelsQty(e.target.checked ? 1 : 0)}
                            />
                            Hjól f/girðingar
                            <NumberInput
                              type="number"
                              min="0"
                              value={wheelsQty}
                              onChange={(e) => setWheelsQty(parseInt(e.target.value) || 0)}
                            />
                            stk
                          </CheckboxLabel>
                        )}
                      </CheckboxGroup>
                    </SelectionContainer>
                  </SectionBlock>
                )}
              </CardInner>
              <ButtonActionContainer>
                <Button
                  $buttonColor="blueButton"
                  icon={LongArrowSideIcons}
                  label="Reikna leiguverð"
                  onClick={handleShowResults}
                />
              </ButtonActionContainer>
            </>
          </Card>

          {results && (
            <ResultsSection id="nidurstodur" $show={showResults}>
              <h3>Niðurstöður</h3>
              <PricingInfo>
                Lágmarksleigutími er 10 dagar. Leiguverð lækkar í þrepum eftir fyrsta mánuðinn.
              </PricingInfo>
              <ResultsTable>
                <thead>
                  <tr>
                    <th>Sölunúmer</th>
                    <th>Leigunúmer</th>
                    <th>Lýsing</th>
                    <th>Magn</th>
                    <th>Söluverð</th>
                    <th>Fyrstu 30 dagar</th>
                    <th className={results.showPeriod2 ? '' : 'hidden'}>+30 dagar</th>
                    <th className={results.showPeriod3 ? '' : 'hidden'}>+60 dagar</th>
                    <th className={results.showPeriod4 ? '' : 'hidden'}>+90 dagar</th>
                    <th>Samtals</th>
                  </tr>
                </thead>
                <tbody>
                  {results.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.saleNo}</td>
                      <td>{item.rentalNo}</td>
                      <td>{item.description}</td>
                      <td>{item.qty} stk</td>
                      <td>{formatNumber(item.salePrice)} kr.</td>
                      <td>{formatNumber(item.baseRate)} kr.</td>
                      <td className={results.showPeriod2 ? '' : 'hidden'}>
                        {formatNumber(Math.round(item.baseRate * 0.5))} kr.
                      </td>
                      <td className={results.showPeriod3 ? '' : 'hidden'}>
                        {formatNumber(Math.round(item.baseRate * 0.25))} kr.
                      </td>
                      <td className={results.showPeriod4 ? '' : 'hidden'}>
                        {formatNumber(Math.round(item.baseRate * 0.125))} kr.
                      </td>
                      <td>{formatNumber(Math.round(item.totalCost))} kr.</td>
                    </tr>
                  ))}
                </tbody>
              </ResultsTable>
              <TotalPrice>
                <span>Samtals leiguverð:</span>
                <span>{formatNumber(Math.round(results.totalPrice))} kr.</span>
              </TotalPrice>
              <TotalPrice>
                <span>Samtals söluverð:</span>
                <span>{formatNumber(results.totalSalePrice)} kr.</span>
              </TotalPrice>
            </ResultsSection>
          )}
        </ContentContainer>
      </PageContainer>
  );
};
