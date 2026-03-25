import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";

import { PageContainer } from "@byko/component-page-container";
import { Card } from "@byko/component-cards";
import { Button } from "@byko/component-buttons";
import { Input } from "@byko/component-inputs";
import { restApi } from "@byko/lib-api-rest";
import { useProductPrices } from "@byko/lib-api-products";
import { LongArrowSideIcons } from "@byko/lib-icons";

import { useCalculateProductList, calculateDaysBetween } from "./calculator";
import {
  SCAFFOLD_TYPES,
  HEIGHT_OPTIONS,
  MIN_RENTAL_DAYS,
  productIdList,
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

import type { Configuration, ScaffoldType, HeightOption } from "./interface";

// Modern styled components matching fence.tsx pattern
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

const CheckboxOption = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px solid ${(props) => (props.$selected ? "#ff8800" : "#e0e0e0")};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$selected ? "#fff9f0" : "#fff")};
  font-weight: ${(props) => (props.$selected ? "600" : "normal")};
  box-shadow: ${(props) => (props.$selected ? "0 4px 16px rgba(255, 136, 0, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.05)")};

  &:hover {
    border-color: #ff8800;
    background: ${(props) => (props.$selected ? "#fff9f0" : "#f8f9fa")};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 136, 0, 0.15);
  }

  input[type="checkbox"] {
    cursor: pointer;
    width: 20px;
    height: 20px;
    accent-color: #ff8800;
  }
`;

const DateInputsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;

  &:focus {
    border-color: #17a2b8;
    outline: none;
    box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.1);
  }

  &:hover {
    border-color: #c0c0c0;
  }
`;

const ResultsSection = styled.div`
  margin-top: 2rem;
  padding: 24px;
  background: linear-gradient(135deg, #f8fdfe 0%, #f0f9fa 100%);
  border: 2px solid #17a2b8;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(23, 162, 184, 0.1);
`;

const PriceDisplay = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  h4 {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    color: #1a1a1a;
    font-weight: 600;
  }

  .price {
    font-size: 2em;
    font-weight: bold;
    color: #17a2b8;
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
  }

  .details {
    font-size: 0.95rem;
    color: #555;
    line-height: 1.6;
    margin-top: 0.5rem;
  }

  .deposit {
    color: #17a2b8;
    font-weight: 600;
    margin-top: 0.75rem;
    padding: 8px 12px;
    background: rgba(23, 162, 184, 0.05);
    border-radius: 6px;
    display: inline-block;
  }

  .support-legs {
    color: #ff8800;
    font-style: italic;
    font-weight: 500;
  }

  .warning {
    color: #d9534f;
    font-weight: bold;
    margin-top: 0.75rem;
    padding: 8px 12px;
    background: rgba(217, 83, 79, 0.05);
    border-radius: 6px;
  }

  .info {
    color: #ff8800;
    margin-top: 1rem;
    font-style: italic;
    padding: 8px 12px;
    background: rgba(255, 136, 0, 0.05);
    border-radius: 6px;
  }
`;

const ComponentsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;

  th,
  td {
    padding: 12px 16px;
    text-align: left;
    font-size: 0.95rem;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    font-weight: 600;
    color: white;
    letter-spacing: 0.3px;
    border-bottom: 2px solid #138496;
  }

  tbody tr {
    transition: background-color 0.2s ease;
  }

  tbody tr:nth-child(even) {
    background: #f8f9fa;
  }

  tbody tr:hover {
    background: #f0f9fa;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .support-legs-row {
    background: #fff9f0 !important;
    font-weight: 600;
  }

  .support-legs-row:hover {
    background: #fff3cd !important;
  }
`;

const TermsSection = styled.div`
  margin-top: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TermsHeader = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1a1a1a;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #e0e0e0 100%);
  }
`;

const TermsToggle = styled.span<{ rotated: boolean }>`
  font-size: 1.2rem;
  transition: transform 0.3s;
  transform: ${(props) => (props.rotated ? "rotate(180deg)" : "rotate(0)")};
`;

const TermsContent = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? "block" : "none")};
  padding: 1.5rem;
  background: #fff;
  line-height: 1.6;
  font-size: 0.9rem;
  color: #555;

  h4 {
    color: #333;
    margin: 1.5rem 0 0.5rem 0;
    font-size: 1.1rem;

    &:first-child {
      margin-top: 0;
    }
  }

  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.3rem 0;
  }

  strong {
    color: #333;
  }
`;

export function Scaffold() {
  // State for configuration
  const [scaffoldType, setScaffoldType] = useState<ScaffoldType>("narrow");
  const [height, setHeight] = useState<HeightOption | undefined>("2.5");
  const [includeSupportLegs, setIncludeSupportLegs] = useState(false);
  const [rentalStartDate, setRentalStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [rentalEndDate, setRentalEndDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // 1 day minimum for scaffold
    return tomorrow.toISOString().split("T")[0];
  });

  const [showResults, setShowResults] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Fetch all products
  const { data: productsData } = useQuery("products", getProducts);

  // Get product prices
  const products = useGetProductPrices(productsData || []);

  // Build configuration
  const config: Configuration = useMemo(
    () => ({
      scaffoldType,
      height: scaffoldType === "quickly" ? undefined : height,
      includeSupportLegs,
      rentalStartDate,
      rentalEndDate,
    }),
    [scaffoldType, height, includeSupportLegs, rentalStartDate, rentalEndDate]
  );

  // Calculate product list and pricing
  const calculation = useCalculateProductList(products, config);

  // Validation
  const rentalDays = calculateDaysBetween(rentalStartDate, rentalEndDate);
  const isValidConfiguration =
    (scaffoldType === "quickly" || height !== undefined) &&
    rentalStartDate &&
    rentalEndDate &&
    new Date(rentalEndDate) >= new Date(rentalStartDate);

  const handleScaffoldTypeChange = useCallback((type: ScaffoldType) => {
    setScaffoldType(type);
    if (type === "quickly") {
      setHeight(undefined);
      setIncludeSupportLegs(false);
    } else if (!height) {
      setHeight("2.5");
    }
  }, [height]);

  const handleCalculate = useCallback(() => {
    if (isValidConfiguration) {
      setShowResults(true);
    }
  }, [isValidConfiguration]);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat("de-DE").format(num);
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1a1a1a', 
          marginBottom: '8px', 
          letterSpacing: '-0.5px' 
        }}>
          Hjólapallar Reiknivél
        </div>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666', 
          marginBottom: '20px', 
          lineHeight: 1.6 
        }}>
          Veldu tegund af hjólapalli og fylltu inn valmöguleika til að sjá leiguverð.
        </p>
        <div style={{
          color: '#ff8800',
          fontStyle: 'italic',
          padding: '12px 16px',
          background: 'rgba(255, 136, 0, 0.1)',
          borderRadius: '8px',
          marginBottom: '40px',
          fontSize: '0.95rem'
        }}>
          Verð er áætlað - hafðu samband við leiga@byko.is eða í síma 515-4020 fyrir tilboð
        </div>
        
      <Card>
        <CardInner>
          <ContentContainer>
            {/* Scaffold Type Selection */}
            <SectionBlock>
              <Label>Veldu tegund hjólapalls</Label>
              <SelectionContainer>
                {SCAFFOLD_TYPES.map((type) => (
                  <RadioOption
                    key={type.id}
                    $selected={scaffoldType === type.id}
                  >
                    <input
                      type="radio"
                      name="scaffold_type"
                      value={type.id}
                      checked={scaffoldType === type.id}
                      onChange={() => handleScaffoldTypeChange(type.id)}
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

            {/* Height Selection (for narrow and wide only) */}
            {scaffoldType !== "quickly" && (
              <SectionBlock>
                <InputBlock>
                  <Label>Veldu vinnuhæð</Label>
                  <SelectInput
                    value={height || ""}
                    onChange={(e) => setHeight(e.target.value as HeightOption)}
                  >
                    <option value="" disabled>Veldu vinnuhæð...</option>
                    {(Object.keys(HEIGHT_OPTIONS) as HeightOption[]).map((h) => (
                      <option key={h} value={h}>
                        {HEIGHT_OPTIONS[h].label}
                      </option>
                    ))}
                  </SelectInput>
                </InputBlock>
              </SectionBlock>
            )}

            {/* Support Legs Option (for narrow and wide only) */}
            {scaffoldType !== "quickly" && (
              <SectionBlock>
                <Label>Viðbót</Label>
                <CheckboxOption $selected={includeSupportLegs}>
                  <input
                    type="checkbox"
                    name="support_legs"
                    checked={includeSupportLegs}
                    onChange={(e) => setIncludeSupportLegs(e.target.checked)}
                  />
                  Stuðningsfætur (sérstakt leigugjald)
                </CheckboxOption>
              </SectionBlock>
            )}

            {/* Rental Period */}
            <SectionBlock>
              <Label>Leigutímabil</Label>
              <DateInputsRow>
                <InputBlock>
                  <Label>Upphafsdagur</Label>
                  <Input
                    type="date"
                    value={rentalStartDate}
                    onChange={(e) => setRentalStartDate(e.target.value)}
                  />
                </InputBlock>
                <InputBlock>
                  <Label>Áætlaður skiladagur</Label>
                  <Input
                    type="date"
                    value={rentalEndDate}
                    onChange={(e) => setRentalEndDate(e.target.value)}
                  />
                </InputBlock>
              </DateInputsRow>
            </SectionBlock>

            <ButtonActionContainer>
              <Button
                $buttonColor="blueButton"
                icon={LongArrowSideIcons}
                label="Reiknaðu leiguverð"
                onClick={handleCalculate}
                disabled={!isValidConfiguration}
              />
            </ButtonActionContainer>

            {/* Results Display */}
            {showResults && isValidConfiguration && (
              <ResultsSection>
                <PriceDisplay>
                  <h4>Leiguverð fyrir hjólapall í {rentalDays} daga:</h4>
                  <div className="price">{formatNumber(calculation.rentalCost)} kr.</div>
                  {calculation.supportLegsCost > 0 && (
                    <div className="support-legs">
                      (stuðningsfætur: {formatNumber(calculation.supportLegsCost)} kr.)
                    </div>
                  )}
                  <div className="details">
                    Leigutími: {rentalDays} dagar ({formatDate(rentalStartDate)} -{" "}
                    {formatDate(rentalEndDate)})
                  </div>
                  <div className="details">
                    Verðskrá: {calculation.pricingDescription}
                  </div>
                  <div className="deposit">
                    Trygging: {formatNumber(calculation.deposit)} kr. (endurgreitt við skil)
                  </div>
                  {rentalDays < MIN_RENTAL_DAYS && (
                    <div className="warning">
                      Athugið: Lágmarksleigtími er {MIN_RENTAL_DAYS} dagar
                    </div>
                  )}
                  <div className="info">
                    Verð er áætlað - hafðu samband við leiga@byko.is eða í síma 515-4020 fyrir tilboð
                  </div>
                </PriceDisplay>

                {/* Components Table */}
                <ComponentsTable>
                  <thead>
                    <tr>
                      <th>Leigunúmer</th>
                      <th>Lýsing</th>
                      <th>Magn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculation.components.map((component, index) => (
                      <tr
                        key={index}
                        className={
                          component.itemno === "01-PAL-HP01-116"
                            ? "support-legs-row"
                            : ""
                        }
                      >
                        <td>{component.itemno}</td>
                        <td>{component.name}</td>
                        <td>{component.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </ComponentsTable>

                <div style={{ padding: "1rem", background: "#f0f8ff", borderRadius: "4px", marginTop: "1rem" }}>
                  <p><strong>Cart Integration:</strong> Product list will appear here when integrated into BYKO system.</p>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>Products ready: {calculation.productList?.length || 0}</p>
                </div>
              </ResultsSection>
            )}

            {/* Terms and Conditions */}
            <TermsSection>
              <TermsHeader onClick={() => setShowTerms(!showTerms)}>
                <span>Skilmálar og talningar</span>
                <TermsToggle rotated={showTerms}>▼</TermsToggle>
              </TermsHeader>
              <TermsContent show={showTerms}>
                <h4>ALMENNT</h4>
                <ul>
                  <li>Leigutími hjólapalla er að lágmarki 24 klst. og er farið í hálfa viku (3,5 daga) ef leiga fer yfir 3 daga.</li>
                  <li>Verð er háð breytingum án fyrirvara.</li>
                  <li>Öll verð eru í íslenskum krónum og með virðisaukaskatti.</li>
                  <li>Viðskiptavinur ber ábyrgð á öllu leigutæki frá því að hann tekur það við og þangað til það er skilað.</li>
                </ul>

                <h4>TRYGGING</h4>
                <ul>
                  <li>Trygging (deposit) er krafist fyrir öll leigutæki og skal greidd við afhendingu.</li>
                  <li>Trygging er endurgreidd að fullu við skil á óskemmdu tæki.</li>
                  <li>Sé tæki skemmt eða glatað er dregið af tryggingu samkvæmt matsverði skemmda.</li>
                  <li>Ef matsverð skemmda fer yfir tryggingu skal viðskiptavinur greiða mismuninn.</li>
                </ul>

                <h4>SKIL OG AFHENDING</h4>
                <ul>
                  <li>Tæki skal skila hreinu og í sama ástandi og það var við afhendingu.</li>
                  <li>Ef tæki er ekki skilað á umsömdum tíma eru rukkuð aukadagagjöld.</li>
                  <li>Viðskiptavinur ber kostnað við sótt og skil ef utan þjónustusvæðis.</li>
                  <li>Byko áskilur sér rétt til að innheimta tæki ef það er ekki skilað á réttum tíma.</li>
                </ul>

                <h4>ÁBYRGÐ OG TRYGGINGAR</h4>
                <ul>
                  <li>Viðskiptavinur ber ábyrgð á því að nota tæki á réttan hátt og samkvæmt leiðbeiningum.</li>
                  <li>Byko ber ekki ábyrgð á tjóni sem hlýst af rangri notkun leigutækis.</li>
                  <li>Mælt er með því að viðskiptavinur hafi tryggingu sem nær til leigutækis.</li>
                  <li>Leigutaki ber ábyrgð á þjófnaði eða skemmdum á leigutæki.</li>
                </ul>

                <h4>GREIÐSLUSKILMÁLAR</h4>
                <ul>
                  <li>Greiðsla skal fara fram við afhendingu tækis.</li>
                  <li>Viðurkenndar eru reiðufé, greiðslukort og millifærsla.</li>
                  <li>Ef leiga lengist eða bætist við tæki skal greiða viðbót strax.</li>
                  <li>Ef greiðsla berst ekki á réttum tíma eru rukkuð dráttarvextir.</li>
                </ul>

                <h4>SAMNINGSSLIT</h4>
                <ul>
                  <li>Byko áskilur sér rétt til að slíta samningi án fyrirvara ef:</li>
                  <li>- Greiðsla berst ekki á réttum tíma</li>
                  <li>- Tæki er notað á rangan hátt eða óvarlega</li>
                  <li>- Viðskiptavinur brýtur gegn öðrum skilmálum samnings</li>
                  <li>Ef samningi er slitið ber viðskiptavinur kostnað við endurheimt tækis.</li>
                </ul>

                <p><strong>Með því að nota þessa reiknivél samþykkir þú ofangreinda skilmála og talningar.</strong></p>
              </TermsContent>
            </TermsSection>
          </ContentContainer>
        </CardInner>
      </Card>
      </ContentContainer>
    </PageContainer>
  );
}