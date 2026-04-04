import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { AlertCircle, CheckCircle, Home, Download, RefreshCw, Info, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

interface DiabetesParameters {
  age: number;
  glucose: number;
  bloodPressure: number;
  bmi: number;
  insulin: number;
  pregnancies: number;
  skinThickness: number;
  diabetesPedigreeFunction: number;
}

interface PredictionResult {
  hasDiabetes: boolean;
  riskScore: number;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';
  recommendations: string[];
}

// Fungsi untuk mendapatkan warna risk score (HANYA untuk UI)
const getRiskScoreColor = (riskScore: number) => {
  if (riskScore >= 70) {
    return {
      bg: 'from-red-600 to-red-500',
      text: 'text-red-600',
      border: 'border-red-300',
      light: 'bg-red-50',
      badge: 'bg-red-600'
    };
  } else if (riskScore >= 50) {
    return {
      bg: 'from-orange-500 to-orange-400',
      text: 'text-orange-600',
      border: 'border-orange-300',
      light: 'bg-orange-50',
      badge: 'bg-orange-500'
    };
  } else if (riskScore >= 30) {
    return {
      bg: 'from-yellow-500 to-yellow-400',
      text: 'text-yellow-600',
      border: 'border-yellow-300',
      light: 'bg-yellow-50',
      badge: 'bg-yellow-500'
    };
  } else {
    return {
      bg: 'from-green-500 to-green-400',
      text: 'text-green-600',
      border: 'border-green-300',
      light: 'bg-green-50',
      badge: 'bg-green-500'
    };
  }
};

// Fungsi untuk mendapatkan status parameter (untuk UI saja)
const getParameterStatus = (value: number, idealMin: number, idealMax: number) => {
  if (value < idealMin || value > idealMax) {
    return { status: 'Tidak Ideal', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  }
  return { status: 'Ideal', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
};

export function ResultsPage() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string | null>(null);
  const [parameters, setParameters] = useState<DiabetesParameters | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const savedName = sessionStorage.getItem('patientName');
    const savedParams = sessionStorage.getItem('parameters');
    const savedGender = sessionStorage.getItem('patientGender');
    const savedResult = sessionStorage.getItem('predictionResult');

    if (!savedName || !savedParams) {
      navigate('/assessment', { replace: true });
    } else {
      try {
        setPatientName(savedName);
        setParameters(JSON.parse(savedParams));
        if (savedGender) setPatientGender(savedGender);
        
        if (savedResult) {
          setResult(JSON.parse(savedResult));
        } else {
          setResult({
            hasDiabetes: false,
            riskScore: 0,
            riskLevel: 'Rendah',
            recommendations: [
              'Lanjutkan mempertahankan kebiasaan gaya hidup sehat.',
              'Pemeriksaan kesehatan tahunan direkomendasikan.',
            ]
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        navigate('/assessment', { replace: true });
      }
    }
    setIsLoaded(true);
  }, [navigate]);

  // Auto-save to localStorage history
  useEffect(() => {
    if (!parameters || !result || !isLoaded) return;

    try {
      const history = localStorage.getItem('diabetesHistory');
      const parsedHistory = history ? JSON.parse(history) : [];

      const newRecord = {
        id: Date.now(),
        patientName,
        patientGender,
        parameters,
        result,
        date: new Date().toISOString(),
      };

      parsedHistory.unshift(newRecord);
      localStorage.setItem('diabetesHistory', JSON.stringify(parsedHistory.slice(0, 50)));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }, [patientName, patientGender, parameters, result, isLoaded]);

  if (!isLoaded || !parameters || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-red-600 text-xl animate-pulse">Memproses hasil...</div>
      </div>
    );
  }

  const riskColors = getRiskScoreColor(result.riskScore);

  const handlePrintPDF = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // === HEADER ===
    pdf.setFillColor(220, 38, 38);
    pdf.roundedRect(margin, yPos, 20, 20, 3, 3, 'FD');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('D', margin + 7, yPos + 13);

    pdf.setTextColor(220, 38, 38);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DiaCARES', margin + 30, yPos + 10);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Diabetes Care & Risk Evaluation System', margin + 30, yPos + 16);

    yPos += 28;

    // === INFORMASI PASIEN ===
    pdf.setFillColor(248, 248, 248);
    pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 18, 2, 2, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.text('INFORMASI PASIEN', margin + 5, yPos + 7);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Nama: ${patientName}`, margin + 5, yPos + 13);
    
    if (patientGender) {
      pdf.text(`Jenis Kelamin: ${patientGender === 'male' ? 'Laki-laki' : 'Perempuan'}`, margin + 60, yPos + 13);
    }
    
    const reportDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    pdf.text(`Tanggal: ${reportDate}`, margin + 120, yPos + 13);

    yPos += 24;

    // === RISK SCORE BOX ===
    const riskColor =
      result.riskLevel === 'Sangat Tinggi' ? [220, 38, 38] :
      result.riskLevel === 'Tinggi' ? [234, 88, 12] :
      result.riskLevel === 'Sedang' ? [202, 138, 4] :
      [22, 163, 74];

    pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 25, 4, 4, 'FD');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('SKOR RISIKO DIABETES', pageWidth / 2, yPos + 8, { align: 'center' });
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${result.riskScore}%`, pageWidth / 2, yPos + 18, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.text(`Kategori: ${result.riskLevel.toUpperCase()}`, pageWidth / 2, yPos + 23, { align: 'center' });

    yPos += 32;

    // === STATUS ===
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38);
    pdf.text('STATUS:', margin, yPos);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const statusText = result.hasDiabetes 
      ? 'RISIKO TINGGI DIABETES - Diperlukan evaluasi medis' 
      : 'RISIKO RENDAH DIABETES - Pertahankan pola hidup sehat';
    
    pdf.text(statusText, margin + 15, yPos);
    yPos += 10;

    // === PARAMETER KLINIS ===
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38);
    pdf.text('PARAMETER KLINIS', margin, yPos);
    yPos += 7;

    // Header tabel
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos - 2, pageWidth - margin * 2, 6, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.text('Parameter', margin + 3, yPos + 2);
    pdf.text('Nilai', margin + 70, yPos + 2);
    pdf.text('Satuan', margin + 110, yPos + 2);
    
    yPos += 8;

    // Data parameter (LENGKAP 8 PARAMETER)
    const clinicalData = [
      { label: 'Glukosa Darah', value: parameters.glucose, unit: 'mg/dL' },
      { label: 'Tekanan Darah', value: parameters.bloodPressure, unit: 'mmHg' },
      { label: 'BMI', value: parameters.bmi.toFixed(1), unit: 'kg/m²' },
      { label: 'Insulin', value: parameters.insulin, unit: 'μU/mL' },
      { label: 'Usia', value: parameters.age, unit: 'tahun' },
      { label: 'Jumlah Kehamilan', value: parameters.pregnancies, unit: 'kali' },
      { label: 'Ketebalan Kulit', value: parameters.skinThickness, unit: 'mm' },
      { label: 'Riwayat Keluarga', value: parameters.diabetesPedigreeFunction.toFixed(3), unit: '-' },
    ];

    clinicalData.forEach((item, index) => {
      if (index > 0) {
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.1);
        pdf.line(margin, yPos - 1, pageWidth - margin, yPos - 1);
      }

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(50, 50, 50);
      pdf.text(item.label, margin + 3, yPos + 3);
      pdf.text(String(item.value), margin + 70, yPos + 3);
      pdf.text(item.unit, margin + 110, yPos + 3);
      
      yPos += 7;
    });

    yPos += 5;

    // === REKOMENDASI MEDIS ===
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38);
    pdf.text('REKOMENDASI MEDIS', margin, yPos);
    yPos += 7;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    result.recommendations.forEach((rec, index) => {
      if (yPos + 20 > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFillColor(220, 38, 38);
      pdf.circle(margin + 2.5, yPos + 2, 1.2, 'F');
      
      const lines = pdf.splitTextToSize(rec, pageWidth - margin * 2 - 8);
      pdf.text(lines, margin + 7, yPos + 3);
      
      yPos += lines.length * 4 + 3;
    });

    yPos += 8;

    // === FOOTER ===
    pdf.setDrawColor(220, 38, 38);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(120, 120, 120);
    pdf.text('Hasil ini untuk tujuan skrining. Konsultasikan dengan tenaga medis.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    pdf.text('DiaCARES - Diabetes Care & Risk Evaluation System', pageWidth / 2, yPos, { align: 'center' });
    
    pdf.setFontSize(6);
    pdf.text(`ID: DIA-${Date.now().toString(36).toUpperCase()}`, margin, pageHeight - 8);
    pdf.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - margin, pageHeight - 8, { align: 'right' });

    // Save PDF
    const safeName = patientName.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
    pdf.save(`DiaCARES-Laporan-${safeName}-${Date.now()}.pdf`);
  };

  const handleReset = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleNewAssessment = () => {
    sessionStorage.removeItem('parameters');
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <Card className="border-2 border-red-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-600 via-red-500 to-orange-600 border-b border-red-300">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {patientGender && (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                    patientGender === 'male'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                      : 'bg-gradient-to-br from-pink-500 to-rose-500'
                  }`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Hasil Prediksi
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base">
                    Pasien: {patientName} {patientGender && `• ${patientGender === 'male' ? 'Laki-laki' : 'Perempuan'}`}
                  </CardDescription>
                </div>
              </div>
              {result.hasDiabetes ? (
                <AlertCircle className="w-12 h-12 text-white/90 flex-shrink-0 animate-pulse" />
              ) : (
                <CheckCircle className="w-12 h-12 text-white/90 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className={`text-center p-6 ${riskColors.light} rounded-2xl border-2 ${riskColors.border}`}>
              <p className="text-gray-700 mb-2 font-semibold">Diabetes Risk Score</p>
              <div className={`text-6xl font-bold mb-4 bg-gradient-to-r ${riskColors.bg} bg-clip-text text-transparent`}>
                {result.riskScore}%
              </div>
              <div className={`inline-block px-6 py-3 rounded-full text-base font-bold ${riskColors.badge} text-white`}>
                Risiko {result.riskLevel}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700">Progress Risiko</span>
                <span className={riskColors.text}>{result.riskScore}/100</span>
              </div>
              <Progress value={result.riskScore} className="h-4 bg-gray-200" />
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <Info className="w-5 h-5 text-red-600" />
                Detail Parameter & Rentang Ideal:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Glucose */}
                <div className={`p-3 rounded-lg border-2 ${getParameterStatus(parameters.glucose, 70, 100).bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Glukosa</span>
                    <span className={`text-xs font-bold ${getParameterStatus(parameters.glucose, 70, 100).color}`}>
                      {parameters.glucose} mg/dL
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ideal: 70-100 mg/dL</p>
                </div>

                {/* Blood Pressure */}
                <div className={`p-3 rounded-lg border-2 ${getParameterStatus(parameters.bloodPressure, 90, 120).bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Tekanan Darah</span>
                    <span className={`text-xs font-bold ${getParameterStatus(parameters.bloodPressure, 90, 120).color}`}>
                      {parameters.bloodPressure} mmHg
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ideal: &lt;120/80 mmHg</p>
                </div>

                {/* BMI */}
                <div className={`p-3 rounded-lg border-2 ${getParameterStatus(parameters.bmi, 18.5, 24.9).bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">BMI</span>
                    <span className={`text-xs font-bold ${getParameterStatus(parameters.bmi, 18.5, 24.9).color}`}>
                      {parameters.bmi}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ideal: 18.5-24.9</p>
                </div>

                {/* Insulin */}
                <div className={`p-3 rounded-lg border-2 ${getParameterStatus(parameters.insulin, 16, 150).bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Insulin</span>
                    <span className={`text-xs font-bold ${getParameterStatus(parameters.insulin, 16, 150).color}`}>
                      {parameters.insulin} μU/mL
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ideal: 16-150 μU/mL</p>
                </div>

                {/* Age */}
                <div className={`p-3 rounded-lg border-2 ${getParameterStatus(parameters.age, 0, 45).bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Usia</span>
                    <span className={`text-xs font-bold ${getParameterStatus(parameters.age, 0, 45).color}`}>
                      {parameters.age} tahun
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Risiko meningkat &gt;45</p>
                </div>

                {/* ✅ TAMBAHAN: Pregnancies */}
                <div className={`p-3 rounded-lg border-2 ${getParameterStatus(parameters.pregnancies, 0, 3).bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Jumlah Kehamilan</span>
                    <span className={`text-xs font-bold ${getParameterStatus(parameters.pregnancies, 0, 3).color}`}>
                      {parameters.pregnancies} kali
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Risiko meningkat &gt;3</p>
                </div>

                {/* ✅ TAMBAHAN: Skin Thickness */}
                <div className={`p-3 rounded-lg border-2 ${getParameterStatus(parameters.skinThickness, 10, 30).bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Ketebalan Kulit</span>
                    <span className={`text-xs font-bold ${getParameterStatus(parameters.skinThickness, 10, 30).color}`}>
                      {parameters.skinThickness} mm
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ideal: 10-30 mm</p>
                </div>

                {/* Diabetes Pedigree */}
                <div className={`p-3 rounded-lg border-2 ${getParameterStatus(parameters.diabetesPedigreeFunction, 0, 0.3).bg}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Riwayat Keluarga</span>
                    <span className={`text-xs font-bold ${getParameterStatus(parameters.diabetesPedigreeFunction, 0, 0.3).color}`}>
                      {parameters.diabetesPedigreeFunction}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ideal: &lt;0.3</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Rekomendasi Medis:
              </h4>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-red-600 font-bold text-lg">{index + 1}.</span>
                    <p className="text-gray-700 text-sm flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-red-100 space-y-3">
              <Button 
                onClick={handlePrintPDF} 
                className="w-full h-12 text-base font-semibold bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-300 flex items-center justify-center gap-2" 
                variant="outline"
              >
                <Printer className="w-5 h-5" />
                Cetak Laporan PDF
              </Button>

              <Button 
                onClick={handleNewAssessment} 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-700 hover:via-red-600 hover:to-orange-700 text-white shadow-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Asesmen Pasien Baru
              </Button>

              <Button 
                onClick={handleReset} 
                variant="ghost" 
                className="w-full h-12 text-base text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <Home className="w-5 h-5 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-600 p-4 bg-red-50 rounded-xl border-2 border-red-200">
          <p className="font-medium">⚠️ Hasil ini hanya untuk tujuan skrining dan edukasi.</p>
          <p>Konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 backdrop-blur-sm p-4 rounded-xl text-center shadow-md border-2 border-green-300">
            <div className="flex justify-center mb-1">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-sm font-semibold text-green-700">Data Pasien</div>
          </div>
          <div className="bg-green-50 backdrop-blur-sm p-4 rounded-xl text-center shadow-md border-2 border-green-300">
            <div className="flex justify-center mb-1">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-sm font-semibold text-green-700">Parameter</div>
          </div>
          <div className="bg-green-50 backdrop-blur-sm p-4 rounded-xl text-center shadow-lg border-2 border-green-300">
            <div className="flex justify-center mb-1">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-sm font-semibold text-green-700">Hasil</div>
          </div>
        </div>
      </div>
    </div>
  );
}