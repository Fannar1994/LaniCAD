import * as React from "react";

import { TextBlockVariantOne } from "@byko/text-block-variant-one";

import { TextBlockContainer, TopBannerContainer } from "./styles";

import type { TopBannerProps } from "./interface";

export const TopBanner = ({ heading, paragraph }: TopBannerProps): JSX.Element => {
  return (
    <TopBannerContainer>
      <TextBlockContainer>
        <TextBlockVariantOne darkMode={true} heading={heading} maxColumns={1} paragraph={paragraph} />
      </TextBlockContainer>
    </TopBannerContainer>
  );
};
