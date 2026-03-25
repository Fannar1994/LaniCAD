import React, { useState, useMemo } from 'react';

interface FenceProduct {
  salesCode: string | null;
  rentalCode: string | null;
  name: string;
}

interface MobileFenceSystem {
  id: string;
  name: string;
  panelProduct: FenceProduct;
  stoneProduct: FenceProduct;
  clampProduct: FenceProduct;
  panelLengthM: number;
  stonesPerPanel: number;
  clampsPerPanel: number;
}

interface CalculationResult {
  panelCount: number;
  stoneCount: number;
  clampCount: number;
  totalLength: number;
}

const mobileFenceSystems: MobileFenceSystem[] = [
  {
    id: 'Girðing 3500x2000x1,1mm',
    name: 'Girðing 3500x2000x1,1mm',
    panelProduct: {
      salesCode: '0295300',
      rentalCode: '01-BAT-GI01-015',
      name: 'Girðingar 3500x2000x1,1mm',
    },
    stoneProduct: {
      salesCode: '0295320',
      rentalCode: '01-BAT-GI01-054',
      name: 'Steinar fyrir Girðingar',
    },
    clampProduct: {
      salesCode: '97100097',
      rentalCode: '01-BAT-GI01-097',
      name: 'Klemmur fyrir Girðingar',
    },
    panelLengthM: 3.5,
    stonesPerPanel: 2,
    clampsPerPanel: 1,
  },
  {
    id: 'Girðing 3500x2000x1,7mm',
    name: 'Girðing 3500x2000x1,7mm',
    panelProduct: {
      salesCode: '0295317',
      rentalCode: '01-BAT-GI01-053',
      name: 'Girðingar 3500x2000x1,7mm',
    },
    stoneProduct: {
      salesCode: '0295320',
      rentalCode: '01-BAT-GI01-054',
      name: 'Steinar fyrir Girðingar',
    },
    clampProduct: {
      salesCode: '97100097',
      rentalCode: '01-BAT-GI01-097',
      name: 'Klemmur fyrir Girðingar',
    },
    panelLengthM: 3.5,
    stonesPerPanel: 2,
    clampsPerPanel: 2,
  },
  {
    id: 'Girðing 3500x1200x1,1mm',
    name: 'Girðing 3500x1200x1,1mm',
    panelProduct: {
      salesCode: '0295290',
      rentalCode: '01-BAT-GI01-052',
      name: 'Girðingar 3500x1200x1,1mm',
    },
    stoneProduct: {
      salesCode: '0295320',
      rentalCode: '01-BAT-GI01-054',
      name: 'Steinar fyrir Girðingar',
    },
    clampProduct: {
      salesCode: '97100097',
      rentalCode: '01-BAT-GI01-097',
      name: 'Klemmur fyrir Girðingar',
    },
    panelLengthM: 3.5,
    stonesPerPanel: 2,
    clampsPerPanel: 1,
  },
];

const MobileFenceCalculator: React.FC = () => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>(mobileFenceSystems[0].id);
  const [lengthMeters, setLengthMeters] = useState<string>('');

  const calculation = useMemo((): CalculationResult => {
    const requestedM = Number(lengthMeters) || 0;
    const system = mobileFenceSystems.find((s) => s.id === selectedSystemId);

    if (!system || requestedM <= 0) {
      return {
        panelCount: 0,
        stoneCount: 0,
        clampCount: 0,
        totalLength: 0,
      };
    }

    const panelCount = Math.ceil(requestedM / system.panelLengthM);
    const stoneCount = panelCount * system.stonesPerPanel;
    const clampCount = panelCount * system.clampsPerPanel;
    const totalLength = panelCount * system.panelLengthM;

    return {
      panelCount,
      stoneCount,
      clampCount,
      totalLength,
    };
  }, [selectedSystemId, lengthMeters]);

  const selectedSystem = mobileFenceSystems.find((s) => s.id === selectedSystemId)!;

  return (
    <div className="mobile-fence-calculator">
      <h1>Tilboðsgerð fyrir girðingar</h1>

      <div className="calculator-form">
        <div className="form-group">
          <label htmlFor="fence-type">Veldu tegund girðingar:</label>
          <select
            id="fence-type"
            className="form-control"
            value={selectedSystemId}
            onChange={(e) => setSelectedSystemId(e.target.value)}
          >
            {mobileFenceSystems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="length-meters">Lengd í metrum:</label>
          <input
            id="length-meters"
            type="number"
            className="form-control"
            placeholder="t.d. 50"
            min="0"
            step="0.1"
            value={lengthMeters}
            onChange={(e) => setLengthMeters(e.target.value)}
          />
        </div>
      </div>

      {calculation.panelCount > 0 && (
        <div className="calculation-results">
          <h2>Niðurstöður</h2>

          <div className="result-summary">
            <p>
              <strong>Umbeðin lengd:</strong> {lengthMeters} m
            </p>
            <p>
              <strong>Raunveruleg lengd:</strong> {calculation.totalLength.toFixed(1)} m
            </p>
          </div>

          <table className="results-table">
            <thead>
              <tr>
                <th>Vara</th>
                <th>Vörunúmer (Sala)</th>
                <th>Leigukóði</th>
                <th>Magn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedSystem.panelProduct.name}</td>
                <td>{selectedSystem.panelProduct.salesCode || '—'}</td>
                <td>{selectedSystem.panelProduct.rentalCode || '—'}</td>
                <td>{calculation.panelCount} stk</td>
              </tr>
              <tr>
                <td>{selectedSystem.stoneProduct.name}</td>
                <td>{selectedSystem.stoneProduct.salesCode || '—'}</td>
                <td>{selectedSystem.stoneProduct.rentalCode || '—'}</td>
                <td>{calculation.stoneCount} stk</td>
              </tr>
              <tr>
                <td>{selectedSystem.clampProduct.name}</td>
                <td>{selectedSystem.clampProduct.salesCode || '—'}</td>
                <td>{selectedSystem.clampProduct.rentalCode || '—'}</td>
                <td>{calculation.clampCount} stk</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MobileFenceCalculator;
