import { gridTheme, theme } from "@byko/lib-styles";
import styled from "styled-components";

export const Label = styled.p``;

export const PriceRow = styled.div`
  display: flex;
  width: 260px;
  justify-content: space-between;
`;

export const PriceTitle = styled.div`
  color: ${theme.palette.gray[60]};
  font-size: 16px;
  &.bold {
    color: ${theme.palette.blue.dark};
    font-size: 18px;
    font-weight: 800;
  }
`;

export const PriceAmount = styled.div`
  color: ${theme.palette.gray[60]};
  font-size: 16px;
  &.bold {
    color: ${theme.palette.blue.dark};
    font-size: 18px;
    font-weight: 800;
  }
`;

export const PriceTotals = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 16px;
  gap: 16px;
`;

export const ButtonInner = styled.div`
  width: 270px;
`;

export const ButtonActionContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1400px;
  justify-content: flex-end;
  margin-top: 38px;
`;

export const InputBlockInner = styled.div`
  display: flex;
  gap: 16px;
`;

export const InputBlock = styled.div`
  display: flex;
  min-width: min(260px, 100%);
  max-width: 50%;
  flex: 1;
  flex-direction: column;
  gap: 9px;
  .select-container {
    border: 1px solid ${theme.palette.gray[10]};
  }
  input:disabled {
    border: 1px solid ${theme.palette.gray[10]};
    background-color: ${theme.palette.gray[5]};
    color: ${theme.palette.blue.dark};
    cursor: not-allowed;
    opacity: 1;
  }
`;

export const CardInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 57px;
`;

export const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 34px;
  h6 {
    color: ${theme.palette.blue.main};
    font-size: 32px;
    font-weight: 300;
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: ${gridTheme.maxContentWidth}px;
  flex-direction: column;
  align-items: center;
  margin-top: 104px;
  margin-right: auto;
  margin-left: auto;
  gap: 57px;
  .card-container {
    width: 100%;
    max-width: 1400px;
  }
`;

export const SelectionContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-grow: 1;
  flex-wrap: wrap;
  gap: 8px;
`;

export const SelectionItem = styled.button`
  width: 320px;
  height: 286px;
  flex-direction: column;
  justify-content: center;
  padding: 8px;
  gap: 16px;
  outline: 1px solid ${theme.palette.transparent.main};
  transition: 300ms;
  &:hover {
    outline: 1px solid ${theme.palette.blue.main}2c;
  }
  &.active {
    outline: 1px solid ${theme.palette.blue.main};
  }
  @media screen and (max-width: 648px) {
    width: 148px;
    height: 132px;
  }
`;

export const SelectionImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
`;

export const SelectionLabel = styled.p`
  color: ${theme.palette.blue.main};
  font-size: 20px;
`;

export const BreakdownContainer = styled.div`
  h6 {
    color: ${theme.palette.blue.main};
    font-size: 40px;
    font-weight: 300;
  }
`;

export const ProductLines = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 6px;
  gap: 8px;
`;
