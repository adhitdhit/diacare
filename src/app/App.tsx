import { useState } from 'react';
import { PatientNameForm } from './components/PatientNameForm';
import { ParametersForm, DiabetesParameters } from './components/ParametersForm';
import { ResultsDisplay } from './components/ResultsDisplay';

type AppStep = 'name' | 'parameters' | 'results';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('name');
  const [patientName, setPatientName] = useState('');
  const [parameters, setParameters] = useState<DiabetesParameters | null>(null);

  const handleNameSubmit = (name: string) => {
    setPatientName(name);
    setCurrentStep('parameters');
  };

  const handleParametersSubmit = (params: DiabetesParameters) => {
    setParameters(params);
    setCurrentStep('results');
  };

  const handleBack = () => {
    setCurrentStep('name');
  };

  const handleReset = () => {
    setPatientName('');
    setParameters(null);
    setCurrentStep('name');
  };

  return (
    <>
      {currentStep === 'name' && (
        <PatientNameForm onSubmit={handleNameSubmit} />
      )}

      {currentStep === 'parameters' && (
        <ParametersForm
          patientName={patientName}
          onSubmit={handleParametersSubmit}
          onBack={handleBack}
        />
      )}

      {currentStep === 'results' && parameters && (
        <ResultsDisplay
          patientName={patientName}
          parameters={parameters}
          onReset={handleReset}
        />
      )}
    </>
  );
}
