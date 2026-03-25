import styled from "styled-components";

import { gridTheme, theme } from "@byko/lib-styles";
import type { CalculatorProps } from "./interface";

export const BannerContainer = styled.div<CalculatorProps>`
  display: flex;
  height: ${(props) => (props.type === "pallur" ? "270px" : "170px")};
  flex-direction: column;
  align-items: flex-start;
  padding-left: 60px;
  background-color: ${theme.palette.blue.dark};
  @media screen and (max-width: ${gridTheme.container.maxWidth.sm}px) {
    height: ${(props) => (props.type === "pallur" ? "370px" : "250px")};
  }
`;

export const TitleContainer = styled.div`
  padding-top: 10px;
`;

export const SubTitleContainer = styled.div`
  padding-right: 30px;
`;

export const SubTitleSecondContainer = styled.div``;

export const TopBannerContainer = styled.div`
  position: relative;

  width: 100%;
  max-width: ${gridTheme.maxContentWidth}px;
  border: 8px solid ${theme.palette.white.main};
  margin-top: 16px;
  margin-right: auto;
  margin-left: auto;
  background-color: ${theme.palette.white.main};
  grid-template-columns: 0.75fr 0.75fr 1fr;
  grid-template-rows: auto 333px;

  @media screen and (max-width: ${gridTheme.breakpoints.sm}px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const PrimaryImageContainer = styled.div`
  position: relative;
  height: 100%;
  border: 8px solid ${theme.palette.white.main};
  grid-area: primary;
  img {
    object-fit: cover !important;
  }
`;

export const TopBannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const TextBlockContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  padding: 96px 112px;
  border: 8px solid ${theme.palette.white.main};
  background-color: ${theme.palette.blue.dark};
  grid-area: text;
  transition: padding 300ms;

  @media screen and (min-width: ${gridTheme.container.minWidth.xs}px) and (max-width: ${gridTheme.container.maxWidth
      .s}px) {
    padding: 48px 24px;
  }

  @media screen and (min-width: ${gridTheme.container.minWidth.sm}px) and (max-width: ${gridTheme.container.maxWidth
      .sm}px) {
    padding: 64px 48px;
  }

  @media screen and (min-width: ${gridTheme.container.minWidth.md}px) and (max-width: ${gridTheme.container.maxWidth
      .md}px) {
    padding: 80px 56px;
  }

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 32px;
    background-color: ${theme.palette.yellow.main};
    content: "";
    transition: width 300ms;
    @media screen and (min-width: ${gridTheme.container.minWidth.xs}px) and (max-width: ${gridTheme.container.maxWidth
        .s}px) {
      width: 16px;
    }
  }

  p {
    max-width: 544px;
  }
`;

export const BookinSectionContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  max-width: ${gridTheme.maxContentWidth}px;
  align-items: center;
  padding: 96px 112px;
  border: 8px solid ${theme.palette.white.main};
  margin-top: 64px;
  margin-right: auto;
  margin-left: auto;
  background-color: ${theme.palette.blue.dark};
  @media screen and (max-width: ${gridTheme.container.maxWidth.sm}px) {
    padding: 0px 0px;
  }
`;
