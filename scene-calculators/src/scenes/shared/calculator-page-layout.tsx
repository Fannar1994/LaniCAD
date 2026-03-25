import React from 'react';
import styled from 'styled-components';

// Hero Section with Background Image
const HeroWrapper = styled.section<{ $backgroundImage?: string; $backgroundColor: string }>`
  position: relative;
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin-bottom: 48px;
  background-image: ${props => props.$backgroundImage ? `url(${props.$backgroundImage})` : 'none'};
  background-color: ${props => props.$backgroundColor};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    min-height: 300px;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 20px;
`;

const HeroTitle = styled.h1`
  font-size: 56px;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
  
  @media (max-width: 480px) {
    font-size: 32px;
  }
`;

interface HeroSectionProps {
  backgroundImage?: string;
  title: string;
  backgroundColor?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundImage,
  title,
  backgroundColor = '#007bff',
}) => {
  return (
    <HeroWrapper
      $backgroundImage={backgroundImage}
      $backgroundColor={backgroundColor}
    >
      <HeroContent>
        <HeroTitle>{title}</HeroTitle>
      </HeroContent>
    </HeroWrapper>
  );
};

// Credibility Banner
const CredibilityWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto 48px;
  padding: 0 20px;
  text-align: center;
`;

const CredibilityText = styled.p`
  font-size: 31px;
  line-height: 1.4;
  color: #333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

interface CredibilityBannerProps {
  text: string;
}

export const CredibilityBanner: React.FC<CredibilityBannerProps> = ({ text }) => {
  return (
    <CredibilityWrapper>
      <CredibilityText>{text}</CredibilityText>
    </CredibilityWrapper>
  );
};

// Calculator Section Header
const CalculatorHeaderWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto 32px;
  padding: 0 20px;
  text-align: center;
`;

const CalculatorHeading = styled.h1`
  font-size: 40px;
  font-weight: bold;
  color: #181818;
  margin: 0 0 16px;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
  
  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const CalculatorNote = styled.p`
  font-size: 24px;
  color: #666;
  margin: 0;
  font-style: italic;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

interface CalculatorHeaderProps {
  heading: string;
  showNote?: boolean;
  noteText?: string;
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  heading,
  showNote = true,
  noteText = '*Útskýringar og mælileiðbeiningar eru fyrir neðan reiknivél',
}) => {
  return (
    <CalculatorHeaderWrapper>
      <CalculatorHeading>{heading}</CalculatorHeading>
      {showNote && <CalculatorNote>{noteText}</CalculatorNote>}
    </CalculatorHeaderWrapper>
  );
};

// Educational Diagram Section
const DiagramWrapper = styled.div`
  max-width: 1200px;
  margin: 48px auto;
  padding: 0 20px;
`;

const DiagramHeading = styled.h2`
  font-size: 40px;
  font-weight: bold;
  color: #181818;
  margin: 0 0 24px;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
  
  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const DiagramImage = styled.img`
  max-width: 100%;
  height: auto;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DiagramExplanation = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

interface DiagramSectionProps {
  heading: string;
  imageSrc?: string;
  imageAlt?: string;
  explanation: string;
}

export const DiagramSection: React.FC<DiagramSectionProps> = ({
  heading,
  imageSrc,
  imageAlt = '',
  explanation,
}) => {
  return (
    <DiagramWrapper>
      <DiagramHeading>{heading}</DiagramHeading>
      {imageSrc && <DiagramImage src={imageSrc} alt={imageAlt} />}
      <DiagramExplanation>{explanation}</DiagramExplanation>
    </DiagramWrapper>
  );
};

// Educational Content Container
const EducationalWrapper = styled.div`
  background: #f8f9fa;
  padding: 48px 0;
  margin-top: 64px;
`;

interface EducationalContentProps {
  children: React.ReactNode;
}

export const EducationalContent: React.FC<EducationalContentProps> = ({ children }) => {
  return <EducationalWrapper>{children}</EducationalWrapper>;
};

// Calculator Container (wraps the actual calculator)
const CalculatorWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

interface CalculatorContainerProps {
  children: React.ReactNode;
}

export const CalculatorContainer: React.FC<CalculatorContainerProps> = ({ children }) => {
  return <CalculatorWrapper>{children}</CalculatorWrapper>;
};

// Full Page Layout Component
const PageWrapper = styled.div`
  min-height: 100vh;
  background: white;
`;

interface CalculatorPageLayoutProps {
  heroImage?: string;
  heroBackgroundColor?: string;
  title: string;
  credibilityStatement: string;
  calculatorHeading: string;
  calculatorNote?: string;
  showNote?: boolean;
  calculator: React.ReactNode;
  educationalSections?: Array<{
    heading: string;
    imageSrc?: string;
    imageAlt?: string;
    explanation: string;
  }>;
}

export const CalculatorPageLayout: React.FC<CalculatorPageLayoutProps> = ({
  heroImage,
  heroBackgroundColor,
  title,
  credibilityStatement,
  calculatorHeading,
  calculatorNote,
  showNote,
  calculator,
  educationalSections,
}) => {
  return (
    <PageWrapper>
      <HeroSection
        backgroundImage={heroImage}
        backgroundColor={heroBackgroundColor}
        title={title}
      />

      <CredibilityBanner text={credibilityStatement} />

      <CalculatorHeader
        heading={calculatorHeading}
        showNote={showNote}
        noteText={calculatorNote}
      />

      <CalculatorContainer>{calculator}</CalculatorContainer>

      {educationalSections && educationalSections.length > 0 && (
        <EducationalContent>
          {educationalSections.map((section, index) => (
            <DiagramSection key={index} {...section} />
          ))}
        </EducationalContent>
      )}
    </PageWrapper>
  );
};
