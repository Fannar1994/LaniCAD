/* eslint-disable max-len */
import React, { useMemo } from "react";
import { PSmall } from "@byko/component-typography";
import { BookingSection } from "@byko/component-booking-section";
import { Girding, Pallur, Fence } from "./scenes";
import { TopBanner } from "./top-banner";
import type { CalculatorProps } from "./interface";
import { BookinSectionContainer } from "./styles";

const subTitle = {
  girding:
    "Viltu aðeins meira næði? Í reiknivélinni hér að neðan getur þú áætlað efniskostnað við girðingu í garðinn þinn af töluverðri nákvæmni. Veldu tegund klæðningar og sláðu inn stærð girðingarinnar. Skoðaðu stærðir vel og athugaðu hvort magn stemmi ekki örugglega.",
  pallur:
    "Dreymir þig um að byggja sólpall? Sláðu inn stærð pallsins, veldu þér tegund klæðningar og hvort þú vilt reikna með efni í undirstöður. Í reiknivélinni hér að neðan getur þú áætlað efniskostnað við nýja pallinn þinn af töluverðri nákvæmni. Þó að sólpallurinn hafi óreglulega lögun gefur fermetratalan nokkuð rétta niðurstöðu. Stærðir á vörum miðast við lagerstöðu en reiknivélar taka tillit til hentugustu útfærslunnar. Skoðaðu stærðir vel og athugaðu hvort magn stemmi ekki örugglega.",
  fence:
    "Veldu lengd, hæð og þykkt á girðingum, sláðu inn heildarmetra og leigudaga til að reikna leiguverð.",
};

export const Calculator = ({ type }: CalculatorProps): JSX.Element => {
  const SubTitle = useMemo(() => {
    if (type === "pallur") return <PSmall>{subTitle.pallur}</PSmall>;
    if (type === "fence") return <PSmall>{subTitle.fence}</PSmall>;
    return <PSmall>{subTitle.girding}</PSmall>;
  }, [type]);

  return (
    <>
      <TopBanner heading={type === "pallur" ? "Pallareiknivél" : type === "fence" ? "Girðinga reiknivél" : "Girðingareiknivél"} paragraph={SubTitle} />

      {type === "girðing" && <Girding />}
      {type === "pallur" && <Pallur />}
      {type === "fence" && <Fence />}
      <BookinSectionContainer>
        <BookingSection />
      </BookinSectionContainer>
    </>
  );
};
