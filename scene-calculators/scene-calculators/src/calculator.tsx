/* eslint-disable max-len */
import React, { useMemo } from "react";
import { PSmall } from "@byko/component-typography";
import { BookingSection } from "@byko/component-booking-section";
import { Girding, Pallur } from "./scenes";
import { FenceRental, ScaffoldRental } from "./scenes/rental";
import { TopBanner } from "./top-banner";
import type { CalculatorProps } from "./interface";
import { BookinSectionContainer } from "./styles";

const subTitle = {
  girding:
    "Viltu aðeins meira næði? Í reiknivélinni hér að neðan getur þú áætlað efniskostnað við girðingu í garðinn þinn af töluverðri nákvæmni. Veldu tegund klæðningar og sláðu inn stærð girðingarinnar. Skoðaðu stærðir vel og athugaðu hvort magn stemmi ekki örugglega.",
  pallur:
    "Dreymir þig um að byggja sólpall? Sláðu inn stærð pallsins, veldu þér tegund klæðningar og hvort þú vilt reikna með efni í undirstöður. Í reiknivélinni hér að neðan getur þú áætlað efniskostnað við nýja pallinn þinn af töluverðri nákvæmni. Þó að sólpallurinn hafi óreglulega lögun gefur fermetratalan nokkuð rétta niðurstöðu. Stærðir á vörum miðast við lagerstöðu en reiknivélar taka tillit til hentugustu útfærslunnar. Skoðaðu stærðir vel og athugaðu hvort magn stemmi ekki örugglega.",
  "fence-rental":
    "Viltu aðeins meira næði? Veldu tegund af girðingu og fylltu inn valmöguleika til að sjá leiguverð. Verð er sótt beint úr Inriver PIM kerfi fyrir nákvæmar upplýsingar.",
  "scaffold-rental":
    "Dreymir þig um að byggja sólpall? Veldu tegund af hjólapalli og fylltu inn valmöguleika til að sjá leiguverð. Verð er sótt beint úr Inriver PIM kerfi fyrir nákvæmar upplýsingar.",
};

export const Calculator = ({ type }: CalculatorProps): JSX.Element => {
  const SubTitle = useMemo(() => {
    const text = subTitle[type] || subTitle.girding;
    return <PSmall>{text}</PSmall>;
  }, [type]);

  const heading = useMemo(() => {
    switch (type) {
      case "pallur":
        return "Pallareiknivél";
      case "fence-rental":
        return "Girðingar leigu reiknivél";
      case "scaffold-rental":
        return "Hjólapallar leigu reiknivél";
      default:
        return "Girðingareiknivél";
    }
  }, [type]);

  return (
    <>
      <TopBanner heading={heading} paragraph={SubTitle} />

      {type === "girðing" && <Girding />}
      {type === "pallur" && <Pallur />}
      {type === "fence-rental" && <FenceRental />}
      {type === "scaffold-rental" && <ScaffoldRental />}
      <BookinSectionContainer>
        <BookingSection />
      </BookinSectionContainer>
    </>
  );
};
