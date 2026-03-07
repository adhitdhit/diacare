import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Activity, ArrowLeft } from "lucide-react";

interface ParametersFormProps {
  patientName: string;
  onSubmit: (parameters: DiabetesParameters) => void;
  onBack: () => void;
}

export interface DiabetesParameters {
  age: number;
  glucose: number;
  bloodPressure: number;
  bmi: number;
  insulin: number;
  pregnancies: number;
  skinThickness: number;
  diabetesPedigreeFunction: number;
}

export function ParametersForm({
  patientName,
  onSubmit,
  onBack,
}: ParametersFormProps) {
  const [parameters, setParameters] =
    useState<DiabetesParameters>({
      age: 0,
      glucose: 0,
      bloodPressure: 0,
      bmi: 0,
      insulin: 0,
      pregnancies: 0,
      skinThickness: 0,
      diabetesPedigreeFunction: 0,
    });

  const handleChange = (
    field: keyof DiabetesParameters,
    value: string,
  ) => {
    // Allow empty string, dash, or convert to number
    const numValue = value === "" || value === "-" ? 0 : parseFloat(value) || 0;
    setParameters((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parameters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle> Parameter Klinis</CardTitle>
                <CardDescription>
                  Pasien: {patientName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pregnancies">
                    Number of Pregnancies
                  </Label>
                  <Input
                    id="pregnancies"
                    type="number"
                    min="0"
                    step="1"
                    value={parameters.pregnancies || ""}
                    onChange={(e) =>
                      handleChange(
                        "pregnancies",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="glucose">
                    Glucose Level (mg/dL)
                  </Label>
                  <Input
                    id="glucose"
                    type="number"
                    min="0"
                    step="0.1"
                    value={parameters.glucose || ""}
                    onChange={(e) =>
                      handleChange("glucose", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">
                    Blood Pressure (mm Hg)
                  </Label>
                  <Input
                    id="bloodPressure"
                    type="number"
                    min="0"
                    step="0.1"
                    value={parameters.bloodPressure || ""}
                    onChange={(e) =>
                      handleChange(
                        "bloodPressure",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skinThickness">
                    Skin Thickness (mm)
                  </Label>
                  <Input
                    id="skinThickness"
                    type="number"
                    min="0"
                    step="0.1"
                    value={parameters.skinThickness || ""}
                    onChange={(e) =>
                      handleChange(
                        "skinThickness",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insulin">
                    Insulin Level (μU/mL)
                  </Label>
                  <Input
                    id="insulin"
                    type="number"
                    min="0"
                    step="0.1"
                    value={parameters.insulin || ""}
                    onChange={(e) =>
                      handleChange("insulin", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bmi">
                    BMI (Body Mass Index)
                  </Label>
                  <Input
                    id="bmi"
                    type="number"
                    min="0"
                    step="0.1"
                    value={parameters.bmi || ""}
                    onChange={(e) =>
                      handleChange("bmi", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diabetesPedigreeFunction">
                    Diabetes Pedigree Function
                  </Label>
                  <Input
                    id="diabetesPedigreeFunction"
                    type="number"
                    min="0"
                    step="0.001"
                    value={
                      parameters.diabetesPedigreeFunction || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "diabetesPedigreeFunction",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    step="1"
                    value={parameters.age || ""}
                    onChange={(e) =>
                      handleChange("age", e.target.value)
                    }
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Calculate Prediction
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}