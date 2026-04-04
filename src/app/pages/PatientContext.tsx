// src/pages/PatientContext.tsx
import { createContext, useState, ReactNode } from "react";

export interface PatientData {
  name: string;
  age: number;
  gender: "Laki-laki" | "Perempuan";
  lastScore?: number;
}

interface PatientContextType {
  patient: PatientData | null;
  setPatient: (data: PatientData) => void;
}

export const PatientContext = createContext<PatientContextType>({
  patient: null,
  setPatient: () => {},
});

interface Props {
  children: ReactNode;
}

export const PatientProvider = ({ children }: Props) => {
  const [patient, setPatient] = useState<PatientData | null>(null);

  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  );
};