import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Activity, ArrowLeft, CheckCircle, User } from "lucide-react";

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

export function ParametersPage() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  const [parameters, setParameters] = useState<DiabetesParameters>({
    age: 0,
    glucose: 0,
    bloodPressure: 0,
    bmi: 0,
    insulin: 0,
    pregnancies: 0,
    skinThickness: 0,
    diabetesPedigreeFunction: 0,
  });

  useEffect(() => {
    // Ambil data dari sessionStorage
    const savedName = sessionStorage.getItem('patientName');
    const savedGender = sessionStorage.getItem('patientGender');
    
    console.log('🔍 ParametersPage - Debug:', { savedName, savedGender });
    
    if (!savedName) {
      console.warn('⚠️ No patientName found, redirecting to /assessment');
      navigate('/assessment', { replace: true });
    } else {
      setPatientName(savedName);
      if (savedGender) {
        setPatientGender(savedGender);
      }
    }
    setIsLoaded(true);
  }, [navigate]);

  const handleChange = (
    field: keyof DiabetesParameters,
    value: string,
  ) => {
    const numValue = value === "" || value === "-" ? 0 : parseFloat(value) || 0;
    setParameters((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simpan parameters ke sessionStorage
    sessionStorage.setItem('parameters', JSON.stringify(parameters));
    
    // Navigate ke results page
    navigate('/results');
  };

  // Tampilkan loading sampai data ter-load
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-red-600 text-xl animate-pulse">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/assessment')}
          className="mb-4 hover:bg-white/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Card className="shadow-2xl border-2 border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Parameter Klinis</CardTitle>
                <CardDescription className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Pasien: {patientName} 
                  {patientGender && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2">
                      {patientGender === 'male' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pregnancies" className="text-base font-semibold">
                    Jumlah Kehamilan
                  </Label>
                  <Input
                    id="pregnancies"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={parameters.pregnancies === 0 ? "" : parameters.pregnancies}
                    onChange={(e) => handleChange("pregnancies", e.target.value)}
                    className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="glucose" className="text-base font-semibold">
                    Kadar Glukosa (mg/dL)
                  </Label>
                  <Input
                    id="glucose"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Contoh: 120"
                    value={parameters.glucose === 0 ? "" : parameters.glucose}
                    onChange={(e) => handleChange("glucose", e.target.value)}
                    className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodPressure" className="text-base font-semibold">
                    Tekanan Darah (mmHg)
                  </Label>
                  <Input
                    id="bloodPressure"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Contoh: 80"
                    value={parameters.bloodPressure === 0 ? "" : parameters.bloodPressure}
                    onChange={(e) => handleChange("bloodPressure", e.target.value)}
                    className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skinThickness" className="text-base font-semibold">
                    Ketebalan Kulit (mm)
                  </Label>
                  <Input
                    id="skinThickness"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={parameters.skinThickness === 0 ? "" : parameters.skinThickness}
                    onChange={(e) => handleChange("skinThickness", e.target.value)}
                    className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insulin" className="text-base font-semibold">
                    Kadar Insulin (μU/mL)
                  </Label>
                  <Input
                    id="insulin"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={parameters.insulin === 0 ? "" : parameters.insulin}
                    onChange={(e) => handleChange("insulin", e.target.value)}
                    className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bmi" className="text-base font-semibold">
                    BMI (Body Mass Index)
                  </Label>
                  <Input
                    id="bmi"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Contoh: 23.5"
                    value={parameters.bmi === 0 ? "" : parameters.bmi}
                    onChange={(e) => handleChange("bmi", e.target.value)}
                    className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diabetesPedigreeFunction" className="text-base font-semibold">
                    Riwayat Keluarga Diabetes
                  </Label>
                  <Input
                    id="diabetesPedigreeFunction"
                    type="number"
                    min="0"
                    step="0.001"
                    max="2"
                    placeholder="0.0 - 2.0"
                    value={parameters.diabetesPedigreeFunction === 0 ? "" : parameters.diabetesPedigreeFunction}
                    onChange={(e) => handleChange("diabetesPedigreeFunction", e.target.value)}
                    className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-base font-semibold">
                    Usia (tahun)
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Contoh: 35"
                    value={parameters.age === 0 ? "" : parameters.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-700 hover:via-red-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Activity className="w-5 h-5 mr-2" />
                Lanjutkan ke Hasil Prediksi
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress Indicator - Step 1 SUDAH HIJAU DENGAN CENTANG */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {/* Step 1 - Data Pasien (SUDAH SELESAI - HIJAU) */}
          <div className="bg-green-50 backdrop-blur-sm p-4 rounded-xl text-center shadow-lg border-2 border-green-300">
            <div className="flex justify-center mb-1">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-sm font-semibold text-green-700">Data Pasien</div>
          </div>

          {/* Step 2 - Parameter (SEDANG AKTIF) */}
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl text-center shadow-lg border-2 border-red-300">
            <div className="text-3xl font-bold text-red-600 mb-1">2</div>
            <div className="text-sm font-medium text-gray-700">Parameter</div>
          </div>

          {/* Step 3 - Hasil (BELUM SELESAI) */}
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl text-center shadow-md border border-gray-200">
            <div className="text-3xl font-bold text-gray-400 mb-1">3</div>
            <div className="text-sm text-gray-500">Hasil</div>
          </div>
        </div>
      </div>
    </div>
  );
}