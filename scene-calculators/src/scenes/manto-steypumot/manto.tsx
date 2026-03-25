import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { useCalculateProductList } from "./calculator";
import type { Configuration } from "./interface";
import { ALL_MANTO_PRODUCTS } from "./configuration";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ResultsSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const SummaryBox = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SummaryCard = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #007bff;
`;

const SummaryLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 4px;
  overflow: hidden;
`;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  background: #007bff;
  color: white;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
`;

const CategoryHeader = styled.tr`
  background: #e9ecef;
  font-weight: bold;
`;

const Notice = styled.div`
  padding: 1rem;
  margin-top: 1rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  color: #856404;
`;

export const Manto = (): JSX.Element => {
  const [config, setConfig] = useState<Configuration>({
    totalSquareMeters: "",
    formworkHeight: "3",
    rentalStartDate: "",
    rentalEndDate: "",
  });

  const [showResults, setShowResults] = useState(false);

  const { items, totalWeight, totalArea, dailyTotal, totalRental, rentalDays } =
    useCalculateProductList(config);

  const canCalculate = useMemo(() => {
    return (
      parseFloat(config.totalSquareMeters) > 0 &&
      config.rentalStartDate &&
      config.rentalEndDate &&
      new Date(config.rentalEndDate) >= new Date(config.rentalStartDate)
    );
  }, [config]);

  const handleCalculate = useCallback(() => {
    if (canCalculate) {
      setShowResults(true);
    }
  }, [canCalculate]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {
      base_units: [],
      connectors: [],
      accessories: [],
    };

    items.forEach((item) => {
      groups[item.category].push(item);
    });

    return groups;
  }, [items]);

  return (
    <Container>
      <Title>Manto Steypumót - Leigureiknivél</Title>

      <FormSection>
        <SectionTitle>Verkefnisupplýsingar</SectionTitle>

        <InputGroup>
          <Label>Fjöldi fermetra (m²)</Label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={config.totalSquareMeters}
            onChange={(e) =>
              setConfig({ ...config, totalSquareMeters: e.target.value })
            }
            placeholder="0.0"
          />
        </InputGroup>

        <InputGroup>
          <Label>Hæð steypumóta (m)</Label>
          <Select
            value={config.formworkHeight}
            onChange={(e) =>
              setConfig({ ...config, formworkHeight: e.target.value })
            }
          >
            <option value="2">2.0 m</option>
            <option value="2.5">2.5 m</option>
            <option value="3">3.0 m</option>
            <option value="3.5">3.5 m</option>
            <option value="4">4.0 m</option>
            <option value="4.5">4.5 m</option>
            <option value="5">5.0 m</option>
          </Select>
        </InputGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>Leigutímabil</SectionTitle>

        <InputGroup>
          <Label>Upphafsdagur</Label>
          <Input
            type="date"
            value={config.rentalStartDate}
            onChange={(e) =>
              setConfig({ ...config, rentalStartDate: e.target.value })
            }
          />
        </InputGroup>

        <InputGroup>
          <Label>Skiladagur</Label>
          <Input
            type="date"
            value={config.rentalEndDate}
            onChange={(e) =>
              setConfig({ ...config, rentalEndDate: e.target.value })
            }
          />
        </InputGroup>

        <Button onClick={handleCalculate} disabled={!canCalculate}>
          Reikna tilboð
        </Button>
      </FormSection>

      {showResults && items.length > 0 && (
        <ResultsSection>
          <SectionTitle>Niðurstöður</SectionTitle>

          <SummaryBox>
            <SummaryCard>
              <SummaryLabel>Fjöldi daga</SummaryLabel>
              <SummaryValue>{rentalDays}</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Heildarþyngd (kg)</SummaryLabel>
              <SummaryValue>{totalWeight.toFixed(1)}</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Heildar m²</SummaryLabel>
              <SummaryValue>{totalArea.toFixed(1)}</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Dagleiga m/vsk</SummaryLabel>
              <SummaryValue>{dailyTotal.toLocaleString()} kr</SummaryValue>
            </SummaryCard>
            <SummaryCard style={{ borderLeftColor: "#28a745" }}>
              <SummaryLabel>Heildarleiga m/vsk</SummaryLabel>
              <SummaryValue>{totalRental.toLocaleString()} kr</SummaryValue>
            </SummaryCard>
          </SummaryBox>

          <Notice>
            <strong>Athugið:</strong> Þetta er grunnútreikningur byggt á einföldu
            líkani. Fyrir nákvæmt tilboð þarf að nota raunverulegar formúlur úr
            Excel skjalinu "Leigutilboð Manto.xlsx". Magntölur eru metnar út frá
            almennum reglum fyrir steypumót.
          </Notice>

          <Table>
            <thead>
              <tr>
                <Th>Flokkur</Th>
                <Th>Heiti</Th>
                <Th>Leigunúmer</Th>
                <Th>Magn</Th>
                <Th>Þyngd (kg)</Th>
                <Th>m²</Th>
                <Th>Dagleiga/stk</Th>
                <Th>Samtals</Th>
              </tr>
            </thead>
            <tbody>
              {groupedItems.base_units.length > 0 && (
                <>
                  <CategoryHeader>
                    <Td colSpan={8}>Grunneiningar</Td>
                  </CategoryHeader>
                  {groupedItems.base_units.map((item, idx) => (
                    <tr key={idx}>
                      <Td>{item.category}</Td>
                      <Td>{item.name}</Td>
                      <Td>{item.rentalCode}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>{item.totalWeight.toFixed(1)}</Td>
                      <Td>{item.totalArea.toFixed(2)}</Td>
                      <Td>{item.dailyRentalPrice} kr</Td>
                      <Td>{item.totalPrice.toLocaleString()} kr</Td>
                    </tr>
                  ))}
                </>
              )}

              {groupedItems.connectors.length > 0 && (
                <>
                  <CategoryHeader>
                    <Td colSpan={8}>Samtengihlutir</Td>
                  </CategoryHeader>
                  {groupedItems.connectors.map((item, idx) => (
                    <tr key={idx}>
                      <Td>{item.category}</Td>
                      <Td>{item.name}</Td>
                      <Td>{item.rentalCode}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>{item.totalWeight.toFixed(1)}</Td>
                      <Td>{item.totalArea.toFixed(2)}</Td>
                      <Td>{item.dailyRentalPrice} kr</Td>
                      <Td>{item.totalPrice.toLocaleString()} kr</Td>
                    </tr>
                  ))}
                </>
              )}

              {groupedItems.accessories.length > 0 && (
                <>
                  <CategoryHeader>
                    <Td colSpan={8}>Aukahlutir</Td>
                  </CategoryHeader>
                  {groupedItems.accessories.map((item, idx) => (
                    <tr key={idx}>
                      <Td>{item.category}</Td>
                      <Td>{item.name}</Td>
                      <Td>{item.rentalCode}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>{item.totalWeight.toFixed(1)}</Td>
                      <Td>{item.totalArea.toFixed(2)}</Td>
                      <Td>{item.dailyRentalPrice} kr</Td>
                      <Td>{item.totalPrice.toLocaleString()} kr</Td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </Table>
        </ResultsSection>
      )}
    </Container>
  );
};
