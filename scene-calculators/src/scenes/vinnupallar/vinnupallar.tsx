// Vinnupallar reiknivél

import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";

// Byko imports
import { Button } from "@byko/component-buttons";
import { Card } from "@byko/component-cards";
import { Input } from "@byko/component-inputs";
import { PageContainer } from "@byko/component-page-container";
import { Select } from "@byko/component-select";
import { theme } from "@byko/lib-styles";
import { formatPriceNumber } from "@byko/lib-utils";

import { HlidInput, EndClosureType, DerivedInputs, HlidDerivedValues } from "./interface";
import { deriveInputsFromHlid, calculateVinnupallarFromDerived, BAY_LENGTH_M } from "./calculator";
import { VSK_RATE } from "./configuration";

// Grid constants
const GRID_ROWS = 6;
const GRID_COLS = 12;

type CellType = "empty" | "scaffold" | "wall";
type ToolType = "add" | "wall" | "remove";

interface GridState {
  cells: CellType[][];
}

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: ${theme.palette.blue.dark};
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: ${theme.palette.gray.main};
  margin-bottom: 30px;
`;

const Section = styled.section`
  background: ${theme.palette.white.main};
  border: 1px solid ${theme.palette.gray.light};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: ${theme.palette.blue.dark};
  font-size: 1.3em;
  margin-bottom: 15px;
  border-bottom: 2px solid ${theme.palette.blue.main};
  padding-bottom: 8px;
`;

const PallurGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const PallurCard = styled.div`
  border: 1px solid ${theme.palette.gray.light};
  border-radius: 6px;
  padding: 15px;
  background: ${theme.palette.gray.lightest};
`;

const PallurTitle = styled.h3`
  color: ${theme.palette.blue.main};
  font-size: 1.1em;
  margin-bottom: 12px;
`;

const InputGroup = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9em;
  color: ${theme.palette.gray.dark};
  margin-bottom: 4px;
`;

// Styled input wrapper
const StyledInputWrapper = styled.div`
  margin-bottom: 10px;

  input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid ${theme.palette.gray.light};
    border-radius: 4px;
    font-size: 0.95em;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: ${theme.palette.blue.main};
    }
  }
`;

// Buttons 
const ActionButton = styled.button`
  background: ${theme.palette.blue.main};
  color: ${theme.palette.white.main};
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background: ${theme.palette.blue.dark};
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: ${theme.palette.gray.main};

  &:hover {
    background: ${theme.palette.gray.dark};
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 0.95em;
`;

const Th = styled.th`
  background: ${theme.palette.blue.main};
  color: ${theme.palette.white.main};
  padding: 10px 8px;
  text-align: left;
  border: 1px solid ${theme.palette.blue.dark};
  font-weight: 600;
`;

const Td = styled.td`
  padding: 8px;
  border: 1px solid ${theme.palette.gray.light};
  text-align: left;
`;

const TdNumber = styled(Td)`
  text-align: right;
  font-family: monospace;
`;

const TotalRow = styled.tr`
  background: ${theme.palette.blue.lightest};
  font-weight: 600;
`;

const HighlightRow = styled.tr`
  background: ${theme.palette.blue.light};
  font-weight: 700;
  font-size: 1.05em;
`;

const InfoBox = styled.div`
  background: ${theme.palette.blue.lightest};
  border-left: 4px solid ${theme.palette.blue.main};
  padding: 12px 15px;
  margin-top: 15px;
  border-radius: 4px;
`;

// Select wrapper
const StyledSelectWrapper = styled.div`
  select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid ${theme.palette.gray.light};
    border-radius: 4px;
    font-size: 0.95em;
    box-sizing: border-box;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: ${theme.palette.blue.main};
      box-shadow: 0 0 0 2px rgba(23, 162, 184, 0.2);
    }
  }
`;

const ReadOnlyValue = styled.div`
  padding: 6px 8px;
  background: ${theme.palette.gray.lightest};
  border: 1px solid ${theme.palette.gray.light};
  border-radius: 4px;
  font-size: 0.95em;
  color: ${theme.palette.gray.dark};
  font-family: monospace;
`;

const ButtonGroup = styled.div`
  margin: 20px 0;
  display: flex;
  gap: 10px;
  align-items: center;
`;

// Grid Builder styled components
const GridContainer = styled.div`
  display: inline-grid;
  grid-template-columns: repeat(${GRID_COLS}, 48px);
  grid-template-rows: repeat(${GRID_ROWS}, 48px);
  gap: 2px;
  background: ${theme.palette.gray.light};
  padding: 8px;
  border-radius: 8px;
  user-select: none;
`;

const GridCell = styled.div<{ $cellType: CellType; $hasCorner?: string }>`
  width: 48px;
  height: 48px;
  background: ${props => {
    if (props.$cellType === "scaffold") return theme.palette.blue.main;
    if (props.$cellType === "wall") return theme.palette.gray.main;
    return theme.palette.white.main;
  }};
  border: 2px solid ${props => {
    if (props.$cellType === "scaffold") return theme.palette.blue.dark;
    if (props.$cellType === "wall") return theme.palette.gray.dark;
    return theme.palette.gray.light;
  }};
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.1s;

  &:hover {
    opacity: 0.8;
    transform: scale(1.02);
  }

  ${props => props.$hasCorner?.includes("corner-tl") && `
    &::before {
      content: "";
      position: absolute;
      top: 2px;
      left: 2px;
      width: 8px;
      height: 8px;
      background: ${theme.palette.yellow.main};
      border-radius: 50%;
    }
  `}

  ${props => props.$hasCorner?.includes("corner-tr") && `
    &::after {
      content: "";
      position: absolute;
      top: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      background: ${theme.palette.yellow.main};
      border-radius: 50%;
    }
  `}
`;

const CornerMarkerBL = styled.div`
  position: absolute;
  bottom: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  background: ${theme.palette.yellow.main};
  border-radius: 50%;
`;

const CornerMarkerBR = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: ${theme.palette.yellow.main};
  border-radius: 50%;
`;

const ToolBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const ToolButton = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 10px 16px;
  border: 2px solid ${props => props.$color || theme.palette.blue.main};
  background: ${props => props.$active ? (props.$color || theme.palette.blue.main) : theme.palette.white.main};
  color: ${props => props.$active ? theme.palette.white.main : (props.$color || theme.palette.blue.main)};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s;

  &:hover {
    background: ${props => props.$color || theme.palette.blue.main};
    color: ${theme.palette.white.main};
  }
`;

const GridStats = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding: 12px 16px;
  background: ${theme.palette.gray.lightest};
  border-radius: 6px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  font-size: 0.95em;
  
  strong {
    color: ${theme.palette.blue.main};
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85em;
  color: ${theme.palette.gray.main};
`;

const LegendBox = styled.div<{ $bg: string; $border: string }>`
  width: 16px;
  height: 16px;
  background: ${props => props.$bg};
  border: 2px solid ${props => props.$border};
  border-radius: 3px;
`;

const LegendDot = styled.div`
  width: 10px;
  height: 10px;
  background: ${theme.palette.yellow.main};
  border-radius: 50%;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid ${theme.palette.gray.light};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  background: ${props => props.$active ? theme.palette.blue.main : "transparent"};
  color: ${props => props.$active ? theme.palette.white.main : theme.palette.gray.main};
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.15s;

  &:hover {
    background: ${props => props.$active ? theme.palette.blue.main : theme.palette.gray.lightest};
  }
`;

// Helper: find endahandrið edges
function findEndahandridEdges(cells: CellType[][]): Record<string, string[]> {
  const edges: Record<string, string[]> = {};

  // Check rows for leftmost/rightmost scaffold
  for (let r = 0; r < GRID_ROWS; r++) {
    let leftmost: number | null = null;
    let rightmost: number | null = null;

    for (let c = 0; c < GRID_COLS; c++) {
      if (cells[r][c] === "scaffold") {
        if (leftmost === null) leftmost = c;
        rightmost = c;
      }
    }

    if (leftmost !== null && rightmost !== null) {
      const leftKey = `${r},${leftmost}`;
      if (!edges[leftKey]) edges[leftKey] = [];
      const hasAbove = r > 0 && cells[r - 1][leftmost] === "scaffold";
      const hasBelow = r < GRID_ROWS - 1 && cells[r + 1][leftmost] === "scaffold";
      if (!hasAbove && !edges[leftKey].includes("corner-tl")) edges[leftKey].push("corner-tl");
      if (!hasBelow && !edges[leftKey].includes("corner-bl")) edges[leftKey].push("corner-bl");

      const rightKey = `${r},${rightmost}`;
      if (!edges[rightKey]) edges[rightKey] = [];
      const hasAboveR = r > 0 && cells[r - 1][rightmost] === "scaffold";
      const hasBelowR = r < GRID_ROWS - 1 && cells[r + 1][rightmost] === "scaffold";
      if (!hasAboveR && !edges[rightKey].includes("corner-tr")) edges[rightKey].push("corner-tr");
      if (!hasBelowR && !edges[rightKey].includes("corner-br")) edges[rightKey].push("corner-br");
    }
  }

  // Check columns for topmost/bottommost scaffold
  for (let c = 0; c < GRID_COLS; c++) {
    let topmost: number | null = null;
    let bottommost: number | null = null;

    for (let r = 0; r < GRID_ROWS; r++) {
      if (cells[r][c] === "scaffold") {
        if (topmost === null) topmost = r;
        bottommost = r;
      }
    }

    if (topmost !== null && bottommost !== null) {
      const topKey = `${topmost},${c}`;
      if (!edges[topKey]) edges[topKey] = [];
      const hasLeft = c > 0 && cells[topmost][c - 1] === "scaffold";
      const hasRight = c < GRID_COLS - 1 && cells[topmost][c + 1] === "scaffold";
      if (!hasLeft && !edges[topKey].includes("corner-tl")) edges[topKey].push("corner-tl");
      if (!hasRight && !edges[topKey].includes("corner-tr")) edges[topKey].push("corner-tr");

      const bottomKey = `${bottommost},${c}`;
      if (!edges[bottomKey]) edges[bottomKey] = [];
      const hasLeftB = c > 0 && cells[bottommost][c - 1] === "scaffold";
      const hasRightB = c < GRID_COLS - 1 && cells[bottommost][c + 1] === "scaffold";
      if (!hasLeftB && !edges[bottomKey].includes("corner-bl")) edges[bottomKey].push("corner-bl");
      if (!hasRightB && !edges[bottomKey].includes("corner-br")) edges[bottomKey].push("corner-br");
    }
  }

  return edges;
}

// Helper: convert grid to sides
function gridToHlidir(cells: CellType[][], levelHeight: number): HlidInput[] {
  const hlidir: HlidInput[] = [];

  // Find connected rows of scaffold
  for (let r = 0; r < GRID_ROWS; r++) {
    let startCol: number | null = null;
    
    for (let c = 0; c <= GRID_COLS; c++) {
      const isScaffold = c < GRID_COLS && cells[r][c] === "scaffold";
      
      if (isScaffold && startCol === null) {
        startCol = c;
      } else if (!isScaffold && startCol !== null) {
        const bays = c - startCol;
        const lengthM = bays * BAY_LENGTH_M;
        
        hlidir.push({
          id: `Hlið ${hlidir.length + 1}`,
          lengthM,
          workingHeightM: levelHeight + 2,
          standHeightM: levelHeight,
          endClosure: "both-ends",
        });
        
        startCol = null;
      }
    }
  }

  return hlidir.length > 0 ? hlidir : [{
    id: "Hlið 1",
    lengthM: BAY_LENGTH_M,
    workingHeightM: 4,
    standHeightM: 2,
    endClosure: "both-ends",
  }];
}

export const Vinnupallar = (): JSX.Element => {
  // Tab state
  const [activeTab, setActiveTab] = useState<"grid" | "form">("grid");

  // Grid state
  const [cells, setCells] = useState<CellType[][]>(() => {
    const initial: CellType[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      initial.push(Array(GRID_COLS).fill("empty"));
    }
    return initial;
  });
  const [tool, setTool] = useState<ToolType>("add");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [levelHeight, setLevelHeight] = useState(4);

  // Form state
  const [hlidir, setHlidir] = useState<HlidInput[]>([
    {
      id: "Hlið 1",
      lengthM: 9.0, // 5 bays * 1.8m = 9m
      workingHeightM: 6.0,
      standHeightM: 4.0, // 2 * 2m levels
      endClosure: "both-ends",
    },
    {
      id: "Hlið 2",
      lengthM: 9.0,
      workingHeightM: 6.0,
      standHeightM: 4.0,
      endClosure: "both-ends",
    },
    {
      id: "Hlið 3",
      lengthM: 9.0,
      workingHeightM: 6.0,
      standHeightM: 4.0,
      endClosure: "none",
    },
  ]);

  const [showResults, setShowResults] = useState<boolean>(false);

  // Derive inputs and calculate results
  const derivedInputs = useMemo(() => deriveInputsFromHlid(hlidir), [hlidir]);
  const results = useMemo(() => calculateVinnupallarFromDerived(derivedInputs, VSK_RATE), [derivedInputs]);

  const handleUpdateHlid = (index: number, field: keyof HlidInput, value: string | number) => {
    const updated = [...hlidir];
    if (updated[index]) {
      if (field === "endClosure") {
        updated[index] = { ...updated[index], [field]: value as EndClosureType };
      } else if (field === "id") {
        updated[index] = { ...updated[index], [field]: value as string };
      } else {
        updated[index] = { ...updated[index], [field]: value as number };
      }
      setHlidir(updated);
    }
  };

  const handleAddHlid = () => {
    const newId = `Hlið ${hlidir.length + 1}`;
    const newHlid: HlidInput = {
      id: newId,
      lengthM: 9.0,
      workingHeightM: 6.0,
      standHeightM: 4.0,
      endClosure: "none",
    };
    setHlidir([...hlidir, newHlid]);
  };

  const handleRemoveHlid = () => {
    if (hlidir.length > 1) {
      setHlidir(hlidir.slice(0, -1));
    }
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setHlidir([
      {
        id: "Hlið 1",
        lengthM: 9.0,
        workingHeightM: 6.0,
        standHeightM: 4.0,
        endClosure: "both-ends",
      },
      {
        id: "Hlið 2",
        lengthM: 9.0,
        workingHeightM: 6.0,
        standHeightM: 4.0,
        endClosure: "both-ends",
      },
      {
        id: "Hlið 3",
        lengthM: 9.0,
        workingHeightM: 6.0,
        standHeightM: 4.0,
        endClosure: "none",
      },
    ]);
    setShowResults(false);
  };

  // Grid handlers
  const handleCellClick = useCallback((row: number, col: number) => {
    setCells(prev => {
      const next = prev.map(r => [...r]);
      if (tool === "add") {
        next[row][col] = "scaffold";
      } else if (tool === "wall") {
        next[row][col] = "wall";
      } else {
        next[row][col] = "empty";
      }
      return next;
    });
  }, [tool]);

  const handleClearGrid = () => {
    setCells(prev => prev.map(r => r.map(() => "empty")));
  };

  const handleGridCalculate = () => {
    const newHlidir = gridToHlidir(cells, levelHeight);
    setHlidir(newHlidir);
    setShowResults(true);
  };

  // Grid stats
  const gridStats = useMemo(() => {
    let scaffoldCount = 0;
    let wallCount = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (cells[r][c] === "scaffold") scaffoldCount++;
        if (cells[r][c] === "wall") wallCount++;
      }
    }
    const edges = findEndahandridEdges(cells);
    let cornerCount = 0;
    Object.values(edges).forEach(arr => cornerCount += arr.length);
    
    return {
      scaffoldCount,
      wallCount,
      lengthM: (scaffoldCount * BAY_LENGTH_M).toFixed(1),
      areaM2: (scaffoldCount * BAY_LENGTH_M * levelHeight).toFixed(1),
      endahandridCount: Math.ceil(cornerCount / 2),
    };
  }, [cells, levelHeight]);

  const cornerEdges = useMemo(() => findEndahandridEdges(cells), [cells]);

  return (
    <Container>
      <Title>Vinnupallar</Title>
      <Subtitle>Reiknivél fyrir vinnupalla</Subtitle>

      <TabContainer>
        <Tab $active={activeTab === "grid"} onClick={() => setActiveTab("grid")}>
          Visual Design
        </Tab>
        <Tab $active={activeTab === "form"} onClick={() => setActiveTab("form")}>
          Numerical Input
        </Tab>
      </TabContainer>

      {activeTab === "grid" && (
        <Section>
          <SectionTitle>Pallahönnuður</SectionTitle>
          
          <InfoBox style={{ marginBottom: "20px" }}>
            <strong>Leiðbeiningar:</strong> Smelltu á reiti til að bæta við pöllum. 
            Gulir punktar sýna hvar endahandrið koma.
          </InfoBox>

          <ToolBar>
            <ToolButton 
              $active={tool === "add"} 
              $color={theme.palette.blue.main}
              onClick={() => setTool("add")}
            >
              Pallur
            </ToolButton>
            <ToolButton 
              $active={tool === "wall"} 
              $color={theme.palette.gray.main}
              onClick={() => setTool("wall")}
            >
              Veggur
            </ToolButton>
            <ToolButton 
              $active={tool === "remove"} 
              $color={theme.palette.red.main}
              onClick={() => setTool("remove")}
            >
              Eyða
            </ToolButton>
            <ToolButton onClick={handleClearGrid} $color={theme.palette.yellow.main}>
              Hreinsa
            </ToolButton>
          </ToolBar>

          <div style={{ display: "flex", gap: "16px", marginBottom: "16px", alignItems: "center" }}>
            <label style={{ fontWeight: 600 }}>Pallhæð (m):</label>
            <select 
              value={levelHeight} 
              onChange={(e) => setLevelHeight(Number(e.target.value))}
              style={{ padding: "6px 12px", borderRadius: "4px", border: `1px solid ${theme.palette.gray.light}` }}
            >
              <option value={2}>2m (1 hæð)</option>
              <option value={4}>4m (2 hæðir)</option>
              <option value={6}>6m (3 hæðir)</option>
              <option value={8}>8m (4 hæðir)</option>
            </select>
          </div>

          <GridContainer
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}
            onMouseLeave={() => setIsMouseDown(false)}
          >
            {cells.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r},${c}`;
                const corners = cornerEdges[key] || [];
                const hasCornerStr = corners.join(" ");
                return (
                  <GridCell
                    key={key}
                    $cellType={cell}
                    $hasCorner={hasCornerStr}
                    onMouseDown={() => handleCellClick(r, c)}
                    onMouseEnter={() => isMouseDown && handleCellClick(r, c)}
                  >
                    {corners.includes("corner-bl") && <CornerMarkerBL />}
                    {corners.includes("corner-br") && <CornerMarkerBR />}
                  </GridCell>
                );
              })
            )}
          </GridContainer>

          <Legend>
            <LegendItem>
              <LegendBox $bg={theme.palette.blue.main} $border={theme.palette.blue.dark} /> Pallur
            </LegendItem>
            <LegendItem>
              <LegendBox $bg={theme.palette.gray.main} $border={theme.palette.gray.dark} /> Veggur
            </LegendItem>
            <LegendItem>
              <LegendDot /> Endahandrið
            </LegendItem>
          </Legend>

          <GridStats>
            <StatItem><strong>{gridStats.scaffoldCount}</strong> pallar</StatItem>
            <StatItem><strong>{gridStats.lengthM}</strong> m lengd</StatItem>
            <StatItem><strong>{gridStats.areaM2}</strong> m² flatarmál</StatItem>
            <StatItem><strong>{gridStats.endahandridCount}</strong> endahandrið</StatItem>
          </GridStats>

          <ButtonGroup>
            <Button onClick={handleGridCalculate}>Reikna niðurstöður</Button>
          </ButtonGroup>
        </Section>
      )}

      {activeTab === "form" && (
      <Section>
        <SectionTitle>Hliðir</SectionTitle>
        
        <InfoBox style={{ marginBottom: "20px" }}>
          <strong>Leiðbeiningar:</strong> Skilgreindu hverja hlið vinnupalls með lengd og hæð. 
          Kerfið reiknar sjálfkrafa fjölda eininga (bays) og fjölda 2m/0,7m hæða út frá 
          stærðfræðilegum gögnum. Bay lengd = {BAY_LENGTH_M}m.
        </InfoBox>

        <ButtonGroup>
          <Button onClick={handleAddHlid}>
            + Bæta við hlið
          </Button>
          <SecondaryButton onClick={handleRemoveHlid} disabled={hlidir.length <= 1}>
            - Fjarlægja hlið
          </SecondaryButton>
          <span style={{ color: theme.palette.gray.main }}>
            Virkar hliðir: {hlidir.length}
          </span>
        </ButtonGroup>

        <PallurGrid>
          {hlidir.map((hlid, index) => {
            const derived = derivedInputs.hlidir[index];
            return (
              <PallurCard key={index}>
                <PallurTitle>{hlid.id}</PallurTitle>
                
                <InputGroup>
                  <Label>Nafn hliðar:</Label>
                  <Input
                    type="text"
                    value={hlid.id}
                    onChange={(e) => handleUpdateHlid(index, "id", e.target.value)}
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Lengd (m):</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={hlid.lengthM}
                    onChange={(e) =>
                      handleUpdateHlid(index, "lengthM", parseFloat(e.target.value) || 0)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Hæsta standhæð (m):</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={hlid.standHeightM}
                    onChange={(e) =>
                      handleUpdateHlid(index, "standHeightM", parseFloat(e.target.value) || 0)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Mesta vinnuhæð (m):</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={hlid.workingHeightM}
                    onChange={(e) =>
                      handleUpdateHlid(index, "workingHeightM", parseFloat(e.target.value) || 0)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <Label htmlFor={`endClosure-${index}`}>Endalokun:</Label>
                  <Select
                    id={`endClosure-${index}`}
                    aria-label={`Endalokun fyrir ${hlid.id}`}
                    title="Veldu endalokun"
                    value={hlid.endClosure}
                    onChange={(e) =>
                      handleUpdateHlid(index, "endClosure", e.target.value as EndClosureType)
                    }
                  >
                    <option value="none">Ekkert (opin enda)</option>
                    <option value="one-end">Annar endi lokaður</option>
                    <option value="both-ends">Báðir endar lokaðir</option>
                  </Select>
                </InputGroup>

                {derived && (
                  <>
                    <InputGroup>
                      <Label>→ Einingafjöldi (reiknað):</Label>
                      <ReadOnlyValue>{derived.einingafjoldi} bays</ReadOnlyValue>
                    </InputGroup>

                    <InputGroup>
                      <Label>→ Fjöldi 2m hæða (reiknað):</Label>
                      <ReadOnlyValue>{derived.fjoldi2mHaeda}</ReadOnlyValue>
                    </InputGroup>

                    <InputGroup>
                      <Label>→ Fjöldi 0,7m hæða (reiknað):</Label>
                      <ReadOnlyValue>{derived.fjoldi0_7mHaeda}</ReadOnlyValue>
                    </InputGroup>

                    <InputGroup>
                      <Label>→ Fjöldi endalokana (reiknað):</Label>
                      <ReadOnlyValue>{derived.fjoldiEndalokana}</ReadOnlyValue>
                    </InputGroup>
                  </>
                )}
              </PallurCard>
            );
          })}
        </PallurGrid>

        <ButtonGroup>
          <Button onClick={handleCalculate}>Reikna niðurstöður</Button>
          <SecondaryButton onClick={handleReset}>Endurstilla</SecondaryButton>
        </ButtonGroup>
      </Section>
      )}

      {showResults && (
        <>
          <Section>
            <SectionTitle>Samantekt</SectionTitle>
            <InfoBox>
              <div><strong>Heildar einingafjöldi:</strong> {derivedInputs.einingafjoldiTotal} bays</div>
              <div><strong>Heildar fjöldi 2m hæða:</strong> {derivedInputs.fjoldi2mHaedaTotal}</div>
              <div><strong>Heildar fjöldi 0,7m hæða:</strong> {derivedInputs.fjoldi0_7mHaedaTotal}</div>
              <div><strong>Heildar endalokun:</strong> {derivedInputs.fjoldiEndalokanaTotal}</div>
              <div><strong>Hæsta standhæð:</strong> {derivedInputs.maxStandHeightM.toFixed(1)}m</div>
              <div><strong>Mesta vinnuhæð:</strong> {derivedInputs.maxWorkingHeightM.toFixed(1)}m</div>
              <div><strong>Heildar fermetrar:</strong> {results.totalFermetrar} m²</div>
            </InfoBox>
          </Section>

          <Section>
            <SectionTitle>Magn og verð</SectionTitle>
            <ResultsTable>
              <thead>
                <tr>
                  <Th>Söluvrn</Th>
                  <Th>Leigunumer</Th>
                  <Th>Heiti</Th>
                  <Th>Samtals</Th>
                  <Th>Ein.verð</Th>
                  <Th>Línusamtals</Th>
                </tr>
              </thead>
              <tbody>
                {results.items.map((item) => (
                  <tr key={item.saluvorn}>
                    <Td>{item.saluvorn}</Td>
                    <Td>{item.leigunumer}</Td>
                    <Td>{item.heiti}</Td>
                    <TdNumber>{item.samtals}</TdNumber>
                    <TdNumber>{item.einVerd.toFixed(2)}</TdNumber>
                    <TdNumber>{item.linuSamtals.toFixed(2)}</TdNumber>
                  </tr>
                ))}
                <HighlightRow>
                  <Td colSpan={5} style={{ textAlign: "right" }}>
                    <strong>Samtals dagleiga með virðisaukaskatti:</strong>
                  </Td>
                  <TdNumber>
                    <strong>{results.samtalseDaglegaMedVsk.toLocaleString()} kr.</strong>
                  </TdNumber>
                </HighlightRow>
                <HighlightRow>
                  <Td colSpan={5} style={{ textAlign: "right" }}>
                    <strong>Mánaðarleiga (30d) m/vsk:</strong>
                  </Td>
                  <TdNumber>
                    <strong>{results.manadarlega30dMedVsk.toLocaleString()} kr.</strong>
                  </TdNumber>
                </HighlightRow>
              </tbody>
            </ResultsTable>

            <InfoBox>
              <strong>Athugaðu:</strong> VSK: {(results.vsk * 100).toFixed(0)}% | Dagverð með VSK | Mánaðarleiga = Dagverð × 30 | Palllengd = {BAY_LENGTH_M}m
            </InfoBox>
          </Section>
        </>
      )}
    </Container>
  );
};
