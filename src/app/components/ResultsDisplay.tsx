import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { AlertCircle, CheckCircle, Home, FileText } from 'lucide-react';
import { DiabetesParameters } from './ParametersForm';
import jsPDF from 'jspdf';

interface ResultsDisplayProps {
  patientName: string;
  parameters: DiabetesParameters;
  onReset: () => void;
}

interface PredictionResult {
  hasDiabetes: boolean;
  riskScore: number;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';
  recommendations: string[];
}

function calculatePrediction(params: DiabetesParameters): PredictionResult {
  let riskScore = 0;

  // Age risk
  if (params.age > 45) riskScore += 15;
  else if (params.age > 35) riskScore += 10;
  else if (params.age > 25) riskScore += 5;

  // Glucose risk (most important factor)
  if (params.glucose >= 200) riskScore += 30;
  else if (params.glucose >= 140) riskScore += 25;
  else if (params.glucose >= 126) riskScore += 20;
  else if (params.glucose >= 100) riskScore += 10;

  // BMI risk
  if (params.bmi >= 35) riskScore += 15;
  else if (params.bmi >= 30) riskScore += 12;
  else if (params.bmi >= 25) riskScore += 8;

  // Blood pressure risk
  if (params.bloodPressure >= 90) riskScore += 10;
  else if (params.bloodPressure >= 80) riskScore += 5;

  // Insulin risk
  if (params.insulin > 200) riskScore += 10;
  else if (params.insulin > 150) riskScore += 5;

  // Diabetes Pedigree Function (family history)
  if (params.diabetesPedigreeFunction > 0.8) riskScore += 12;
  else if (params.diabetesPedigreeFunction > 0.5) riskScore += 8;
  else if (params.diabetesPedigreeFunction > 0.3) riskScore += 5;

  // Pregnancies (only for women, skip if 0 for men)
  if (params.pregnancies > 0) {
    if (params.pregnancies > 5) riskScore += 8;
    else if (params.pregnancies > 3) riskScore += 5;
  }

  // Normalize risk score to 0-100
  riskScore = Math.min(riskScore, 100);

  let riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';
  if (riskScore >= 70) riskLevel = 'Sangat Tinggi';
  else if (riskScore >= 50) riskLevel = 'Tinggi';
  else if (riskScore >= 30) riskLevel = 'Sedang';
  else riskLevel = 'Rendah';

  const hasDiabetes = riskScore >= 50;

  const recommendations: string[] = [];

  if (params.glucose >= 126) {
    recommendations.push('Kadar glukosa puasa menunjukkan indikasi diabetes. Segera konsultasikan dengan dokter spesialis endokrinologi.');
  } else if (params.glucose >= 100) {
    recommendations.push('Monitor kadar glukosa darah secara teratur. Pertimbangkan modifikasi pola makan.');
  }

  if (params.bmi >= 25) {
    recommendations.push('Manajemen berat badan direkomendasikan. Targetkan BMI di bawah 25 melalui diet dan olahraga teratur.');
  }

  if (params.bloodPressure >= 80) {
    recommendations.push('Pemantauan tekanan darah diperlukan. Pertimbangkan perubahan gaya hidup untuk mengurangi hipertensi.');
  }

  if (hasDiabetes) {
    recommendations.push('Jadwalkan pemeriksaan diabetes komprehensif dan tes HbA1c.');
    recommendations.push('Kembangkan rencana manajemen diabetes dengan penyedia layanan kesehatan Anda.');
  } else if (riskLevel === 'Tinggi' || riskLevel === 'Sedang') {
    recommendations.push('Pemeriksaan kesehatan rutin setiap 6 bulan direkomendasikan.');
    recommendations.push('Pertahankan gaya hidup sehat: diet seimbang, olahraga teratur, manajemen stres.');
  } else {
    recommendations.push('Lanjutkan mempertahankan kebiasaan gaya hidup sehat.');
    recommendations.push('Pemeriksaan kesehatan tahunan direkomendasikan.');
  }

  return {
    hasDiabetes,
    riskScore,
    riskLevel,
    recommendations,
  };
}

export function ResultsDisplay({ patientName, parameters, onReset }: ResultsDisplayProps) {
  const result = calculatePrediction(parameters);

  const handlePrintPDF = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Title
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HASIL PREDIKSI DIABETES', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Pasien: ${patientName}`, pageWidth / 2, 30, { align: 'center' });
    
    yPos = 50;
    pdf.setTextColor(0, 0, 0);

    // Risk Score Section
    const riskColor = 
      result.riskLevel === 'Sangat Tinggi' ? [220, 38, 38] :
      result.riskLevel === 'Tinggi' ? [234, 88, 12] :
      result.riskLevel === 'Sedang' ? [202, 138, 4] :
      [22, 163, 74];
    
    pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    pdf.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
    pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 25, 3, 3, 'FD');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Skor Risiko: ${result.riskScore}%`, pageWidth / 2, yPos + 10, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text(`Tingkat Risiko: ${result.riskLevel}`, pageWidth / 2, yPos + 18, { align: 'center' });
    
    yPos += 35;
    pdf.setTextColor(0, 0, 0);

    // Status
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const statusText = result.hasDiabetes ? 'Risiko Tinggi Diabetes' : 'Risiko Rendah Diabetes';
    pdf.text(statusText, margin, yPos);
    yPos += 10;

    // Clinical Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ringkasan Uji Klinis', margin, yPos);
    yPos += 8;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const clinicalData = [
      { label: 'Usia', value: `${parameters.age} tahun` },
      { label: 'Glukosa', value: `${parameters.glucose} mg/dL` },
      { label: 'Tekanan Darah', value: `${parameters.bloodPressure} mm Hg` },
      { label: 'BMI', value: parameters.bmi.toFixed(1) },
      { label: 'Insulin', value: `${parameters.insulin} µU/mL` },
      { label: 'Kehamilan', value: `${parameters.pregnancies}` },
      { label: 'Diabetes Pedigree', value: parameters.diabetesPedigreeFunction.toFixed(3) },
    ];

    clinicalData.forEach((item, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPos - 4, (pageWidth - margin * 2) / 2 - 2, 8, 'F');
      }
      
      const xPos = index % 2 === 0 ? margin + 2 : pageWidth / 2 + 2;
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.label + ':', xPos, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.value, xPos + 40, yPos);
      
      if (index % 2 === 1) yPos += 10;
    });
    
    if (clinicalData.length % 2 === 1) yPos += 10;
    yPos += 5;

    // Recommendations
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rekomendasi Medis', margin, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    result.recommendations.forEach((rec, index) => {
      const bulletPoint = `${index + 1}. `;
      const lines = pdf.splitTextToSize(rec, pageWidth - margin * 2 - 10);
      
      // Check if we need a new page
      if (yPos + (lines.length * 4) > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }
      
      pdf.text(bulletPoint, margin + 2, yPos);
      pdf.text(lines, margin + 10, yPos);
      yPos += lines.length * 4 + 3;
    });

    // Footer
    yPos = pageHeight - 20;
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    pdf.setFont('helvetica', 'italic');
    const date = new Date().toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Dicetak pada: ${date}`, margin, yPos);
    pdf.text('Dokumen ini bersifat rahasia dan hanya untuk keperluan medis', pageWidth / 2, yPos + 5, { align: 'center' });

    // Save PDF
    pdf.save(`Hasil-Prediksi-Diabetes-${patientName.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hasil Prediksi</CardTitle>
                <CardDescription>Pasien: {patientName}</CardDescription>
              </div>
              {result.hasDiabetes ? (
                <AlertCircle className="w-12 h-12 text-red-500" />
              ) : (
                <CheckCircle className="w-12 h-12 text-green-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Diabetes Risk Score</span>
                <span className={`text-2xl font-bold ${
                  result.riskLevel === 'Sangat Tinggi' ? 'text-red-600' :
                  result.riskLevel === 'Tinggi' ? 'text-orange-600' :
                  result.riskLevel === 'Sedang' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {result.riskScore}%
                </span>
              </div>
              <Progress value={result.riskScore} className="h-3" />
            </div>

            <div className={`p-4 rounded-lg ${
              result.riskLevel === 'Sangat Tinggi' ? 'bg-red-50 border border-red-200' :
              result.riskLevel === 'Tinggi' ? 'bg-orange-50 border border-orange-200' :
              result.riskLevel === 'Sedang' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.hasDiabetes ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <span className="font-semibold">
                  {result.hasDiabetes ? 'Risiko Tinggi Diabetes' : 'Risiko Rendah Diabetes'}
                </span>
              </div>
              <p className="text-sm">
                Tingkat Risiko: <span className="font-medium">{result.riskLevel}</span>
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Ringkasan Uji Klinis</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Age</p>
                  <p className="font-medium">{parameters.age} years</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Glucose</p>
                  <p className="font-medium">{parameters.glucose} mg/dL</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Blood Pressure</p>
                  <p className="font-medium">{parameters.bloodPressure} mm Hg</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">BMI</p>
                  <p className="font-medium">{parameters.bmi.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Rekomendasi</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t space-y-3">
              <Button onClick={handlePrintPDF} className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Cetak PDF
              </Button>
              
              <Button onClick={onReset} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Asesmen Baru
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}