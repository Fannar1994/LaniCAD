import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
`;

export const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 10px;
`;

export const Description = styled.p`
  color: #666;
  margin-bottom: 30px;
`;

export const FormContainer = styled.div`
  margin-bottom: 30px;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 15px;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  margin-right: 8px;
  width: 18px;
  height: 18px;
`;

export const TextInput = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

export const DateInput = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

export const CalculateButton = styled.button`
  width: 100%;
  max-width: 980px;
  padding: 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

export const TotalPrice = styled.div`
  font-size: 18px;
  font-weight: 500;

  span {
    color: #666;
  }
`;
