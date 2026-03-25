import styled from "styled-components";
import { gridTheme, theme } from "@byko/lib-styles";

export const ProductLineContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 96px;

  align-items: center;
  justify-content: space-between;
  padding: 16px 0px;
  box-shadow: inset 0px -1px 0px #e6e7e8;
  gap: 36px;

  @media screen and (max-width: ${gridTheme.container.maxWidth.mm}px) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  @media screen and (max-width: ${gridTheme.container.maxWidth.sm}px) {
    justify-content: flex-start;
  }

  img {
    max-width: 60px;
  }
`;

export const CheckAndImageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

export const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

export const PriceWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-end;
`;

export const ProductTextBlock = styled.div<{ fullWidth?: boolean; flexible?: boolean }>`
  display: flex;
  width: ${({ fullWidth }) => (fullWidth ? "min-content" : "160px")};
  min-width: ${({ fullWidth }) => (fullWidth ? "250px" : "160px")};
  flex: ${({ flexible }) => (flexible ? "1" : "0")};

  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  .calculator-list-label {
    color: ${theme.palette.gray[60]};
    font-size: 14px;
    text-transform: uppercase;
  }
  .calculator-list-value {
    color: ${theme.palette.blue.dark};
    font-size: 16px;
  }
  .strikethrough {
    text-decoration: line-through;
  }
`;
