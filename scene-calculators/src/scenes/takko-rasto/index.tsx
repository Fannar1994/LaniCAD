import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
`;

const Section = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.8em;
  margin-bottom: 10px;
`;

const SectionSubtitle = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 1.1em;
`;

const Container = styled.div`
  max-width: 100%;
`;

const FormContainer = styled.div`
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
`;

const TextInput = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const DateInput = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const CalculateButton = styled.button`
  width: 100%;
  max-width: 980px;
  padding: 15px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin: 20px 0 10px 0;
  transition: all 0.2s;

  &:hover {
    background-color: #138496;
  }
`;

const ResultBox = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #e7f3ff;
  border: 2px solid #17a2b8;
  border-radius: 8px;
`;

const ResultItem = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
  color: #666;
  display: flex;
  justify-content: space-between;
  
  span {
    font-weight: bold;
    color: #333;
  }
`;

const TotalPrice = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  color: #17a2b8;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #17a2b8;
`;

const PeriodInfo = styled.div`
  font-size: 0.9rem;
  margin-top: 5px;
  color: #666;
`;

export const TakkoRasto = (): JSX.Element => {
  const [squareMeters, setSquareMeters] = useState<string>('');
  const [wallHeight, setWallHeight] = useState<string>('3.0');
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Set default dates: today and 10 days from now (minimum rental period)
  const today = new Date();
  const tenDaysLater = new Date(today);
  tenDaysLater.setDate(today.getDate() + 10);
  
  const [startDate, setStartDate] = useState<string>(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(tenDaysLater.toISOString().split('T')[0]);

  const calculation = useMemo(() => {
    const m2 = Number(squareMeters) || 0;
    const height = Number(wallHeight) || 3.0;

    if (m2 <= 0) {
      return {
        panelCount: 0,
        tieCount: 0,
        walerCount: 0,
        rentalPrice: 0,
        rentalDays: 10,
      };
    }

    // Calculate rental days (minimum 10 days)
    let days = 10;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      days = Math.max(10, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Panel calculations - adjust based on actual Excel formulas
    const panelArea = 3.3; // m² per panel (standard Rasto panel)
    const panelCount = Math.ceil(m2 / panelArea);
    const tieCount = Math.ceil((m2 / height) * 4); // ~4 ties per linear meter
    const walerCount = Math.ceil((m2 / height) * 2); // ~2 walers per linear meter

    // Daily pricing (example - adjust based on actual rates)
    const dailyPricePerPanel = 120; // kr per panel per day
    const dailyPricePerTie = 20; // kr per tie per day
    const dailyPricePerWaler = 30; // kr per waler per day

    const rentalPrice = Math.round(
      (panelCount * dailyPricePerPanel +
      tieCount * dailyPricePerTie +
      walerCount * dailyPricePerWaler) * days
    );

    return {
      panelCount,
      tieCount,
      walerCount,
      rentalPrice,
      rentalDays: days,
    };
  }, [squareMeters, wallHeight, startDate, endDate]);

  const calculatorContent = (
    <Container>
      <FormContainer>
        <FormGroup>
          <Label htmlFor="square-meters">Fermetrar steypumóta (m²)</Label>
          <TextInput
            id="square-meters"
            type="number"
            placeholder="Sláðu inn fermetra"
            min="0"
            step="0.1"
            value={squareMeters}
            onChange={(e) => setSquareMeters(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="wall-height">Hæð veggjar (m)</Label>
          <TextInput
            id="wall-height"
            type="number"
            placeholder="t.d. 3.0"
            min="0"
            step="0.1"
            value={wallHeight}
            onChange={(e) => setWallHeight(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="start-date">Upphafsdagur</Label>
          <DateInput
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="end-date">Skiladagur</Label>
          <DateInput
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormGroup>

        <CalculateButton
          onClick={() => {
            if (squareMeters && Number(squareMeters) > 0) {
              setShowResults(true);
            }
          }}
        >
          Reiknaðu leiguverð
        </CalculateButton>

        {showResults && calculation.panelCount > 0 && (
          <ResultBox>
            <ResultItem>
              <span>Fjöldi panela:</span>
              <span>{calculation.panelCount} stk</span>
            </ResultItem>
            <ResultItem>
              <span>Fjöldi tengja:</span>
              <span>{calculation.tieCount} stk</span>
            </ResultItem>
            <ResultItem>
              <span>Fjöldi bakka:</span>
              <span>{calculation.walerCount} stk</span>
            </ResultItem>
            <TotalPrice>
              Samtals leiguverð: {calculation.rentalPrice.toLocaleString('is-IS')} kr.
            </TotalPrice>
            <PeriodInfo>({calculation.rentalDays} daga leiga)</PeriodInfo>
          </ResultBox>
        )}
      </FormContainer>
    </Container>
  );

  return (
    <PageContainer>
      <Section>
        <SectionTitle>Takko-Rasto Steypumót Reiknivél</SectionTitle>
        <SectionSubtitle>Reiknaðu leigukostnað fyrir steypumót</SectionSubtitle>
        {calculatorContent}
      </Section>
    </PageContainer>
  );
};
