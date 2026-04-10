import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { AlertCircle, CheckCircle, Home, RefreshCw, Info, Printer, Loader2 } from 'lucide-react';
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

interface MongoPrediction {
  _id: string;
  patientName: string;
  patientGender: string;
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
  Prediction_Result: number | null;
  Risk_Score: number | null;
  Risk_Level: string | null;
  Recommendations: string[] | null;
  status: 'pending' | 'completed' | 'processing';
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';



if (!API_URL) {
  console.error('⚠️ VITE_API_URL belum diset! Cek file .env atau .env.production');
}

// Helper: warna risk score
const getRiskColor = (score: number) => {
  if (score >= 70) return { bg: 'from-red-600 to-red-500', text: 'text-red-600', border: 'border-red-300', light: 'bg-red-50', badge: 'bg-red-600' };
  if (score >= 50) return { bg: 'from-orange-500 to-orange-400', text: 'text-orange-600', border: 'border-orange-300', light: 'bg-orange-50', badge: 'bg-orange-500' };
  if (score >= 30) return { bg: 'from-yellow-500 to-yellow-400', text: 'text-yellow-600', border: 'border-yellow-300', light: 'bg-yellow-50', badge: 'bg-yellow-500' };
  return { bg: 'from-green-500 to-green-400', text: 'text-green-600', border: 'border-green-300', light: 'bg-green-50', badge: 'bg-green-500' };
};

// Helper: status parameter (untuk UI)
const getParamStatus = (value: number, min: number, max: number) => {
  if (value < min || value > max) return { color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  return { color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
};

export function ResultsPage() {
  const navigate = useNavigate();
  
  // ✅ REFS untuk prevent double submit
  const hasSubmittedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const pollingIntervalRef = useRef<number | null>(null); // ✅ Untuk auto-polling
  
  const [patientName, setPatientName] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('');
  const [parameters, setParameters] = useState<DiabetesParameters | null>(null);
  const [prediction, setPrediction] = useState<MongoPrediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [predictionId, setPredictionId] = useState<string | null>(null);

  // 1️⃣ Init: load data & submit ke backend (HANYA SEKALI!)
  useEffect(() => {
    const initPage = async () => {
      // ✅ Cek apakah sudah pernah submit (prevent double call di Strict Mode)
      if (hasSubmittedRef.current) {
        console.log('⏭️ Already initialized, skipping...');
        return;
      }

      try {
        const name = sessionStorage.getItem('patientName');
        const gender = sessionStorage.getItem('patientGender');
        const paramsStr = sessionStorage.getItem('parameters');
        const savedId = sessionStorage.getItem('predictionId');

        if (!name || !paramsStr) {
          console.warn('⚠️ No patient data, redirecting to assessment');
          navigate('/assessment', { replace: true });
          return;
        }

        console.log('✅ Loading patient:', name, gender);
        setPatientName(name);
        setPatientGender(gender || 'laki-laki');
        setParameters(JSON.parse(paramsStr));

        if (savedId) {
          console.log('🔍 Found existing prediction ID:', savedId);
          setPredictionId(savedId);
          await checkPredictionStatus(savedId);
        } else {
          console.log('📤 Submitting new prediction...');
          hasSubmittedRef.current = true; // ✅ Set flag sudah submit
          await submitToBackend(JSON.parse(paramsStr), name, gender || 'laki-laki');
        }
      } catch (err) {
        console.error('❌ Init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [navigate]);

  // 2️⃣ Submit input user ke backend (HANYA SEKALI!)
    const submitToBackend = async (params: DiabetesParameters, name: string, gender: string) => {
  if (isProcessingRef.current) {
    console.log('⏭️ Already processing, skipping...');
    return;
  }

  try {
    isProcessingRef.current = true;
    
    console.log('📡 API_URL:', API_URL); // Debug
    
    const payload = {
      Pregnancies: params.pregnancies,
      Glucose: params.glucose,
      BloodPressure: params.bloodPressure,
      SkinThickness: params.skinThickness,
      Insulin: params.insulin,
      BMI: params.bmi,
      DiabetesPedigreeFunction: params.diabetesPedigreeFunction,
      Age: params.age,
      patientName: name,
      patientGender: gender,
      source: 'web_app'
    };

    console.log('📡 Sending to backend...', payload);

    const response = await axios.post(`${API_URL}/predict`, payload);
    
    console.log('📥 Backend response:', response.data); // ✅ Debug log
    
    if (response.data.success) {
      const id = response.data.savedId;
      
      if (!id) {
        console.error('❌ savedId is missing from response!');
        throw new Error('Backend did not return savedId');
      }
      
      console.log('✅ Saved with ID:', id);
      setPredictionId(id);
      sessionStorage.setItem('predictionId', id);
      await checkPredictionStatus(id);
    }
  } catch (error: any) {
    console.error('❌ Submit error:', error);
    alert('Gagal menyimpan data: ' + (error.message || 'Unknown error'));
  } finally {
    isProcessingRef.current = false;
  }
};




  // 3️⃣ Cek status prediksi dari MongoDB
  const checkPredictionStatus = async (id: string) => {
    try {
      setIsChecking(true);
      console.log('🔍 Checking prediction status:', id);
      
      const response = await axios.get(`${API_URL}/prediction/${id}`);
      
      if (response.data.success) {
        const data: MongoPrediction = response.data.data; // ✅ FIX: variable name 'data'
        console.log('📥 Received prediction:', data);
        setPrediction(data);
        
        if (data.status === 'completed' && data.Risk_Score !== null) {
          console.log('✅ Prediction completed:', {
            riskScore: data.Risk_Score,
            riskLevel: data.Risk_Level,
            prediction: data.Prediction_Result
          });
          
          // ✅ STOP polling kalau sudah selesai
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            console.log('⏹️ Polling stopped - prediction completed');
          }
        } else {
          console.log('⏳ Still pending, status:', data.status);
        }
      }
    } catch (error) {
      console.warn('⚠️ Gagal cek status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // ✅ AUTO-POLLING: Cek otomatis setiap 3 detik (TAMBAHAN BARU)
  useEffect(() => {
    if (predictionId && prediction?.status !== 'completed') {
      console.log('🔄 Starting auto-polling for prediction:', predictionId);
      
      // Langsung cek sekali pertama kali
      checkPredictionStatus(predictionId);
      
      // Set interval untuk cek setiap 3 detik
      pollingIntervalRef.current = setInterval(() => {
        console.log('🔄 Auto-checking...');
        checkPredictionStatus(predictionId);
      }, 3000); // 3000ms = 3 detik
      
      // Cleanup: clear interval saat component unmount atau status completed
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          console.log('🛑 Polling cleanup');
        }
      };
    }
  }, [predictionId, prediction?.status]); // ✅ Re-run jika predictionId atau status berubah

  // 4️⃣ Refresh button (masih bisa dipakai manual kalau mau)
  const handleRefresh = () => {
    if (predictionId) {
      checkPredictionStatus(predictionId);
    }
  };

  // 5️⃣ PDF Export (kode sama, tidak diubah)

  const handlePrintPDF = () => {
  if (!prediction || !parameters) {
    alert('Data belum tersedia untuk dicetak');
    return;
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // === HEADER ===
  pdf.setFillColor(220, 38, 38);
  pdf.rect(margin, yPos, pageWidth - margin * 2, 15, 'FD');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HASIL PREDIKSI DIABETES', pageWidth / 2, yPos + 10, { align: 'center' });

  yPos += 25;

  // === INFORMASI PASIEN ===
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('INFORMASI PASIEN', margin, yPos);
  yPos += 7;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Nama: ${patientName}`, margin, yPos);
  pdf.text(`Jenis Kelamin: ${patientGender}`, margin + 60, yPos);
  yPos += 7;
  
  const reportDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  pdf.text(`Tanggal: ${reportDate}`, margin, yPos);
  yPos += 10;

  // === RISK SCORE ===
  // === SKOR RISIKO (BOX DENGAN BACKGROUND) ===
if (prediction.status === 'completed' && prediction.Risk_Score !== null) {
  // Tentukan warna berdasarkan risk level
  let boxColor: [number, number, number];
  if (prediction.Risk_Score >= 70) {
    boxColor = [220, 38, 38]; // Merah - Sangat Tinggi
  } else if (prediction.Risk_Score >= 50) {
    boxColor = [234, 88, 12]; // Orange - Tinggi
  } else if (prediction.Risk_Score >= 30) {
    boxColor = [234, 179, 8]; // Kuning - Sedang
  } else {
    boxColor = [22, 163, 74]; // Hijau - Rendah
  }
  
  // Draw box
  pdf.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
  pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, 'FD');
  
  // Text putih di dalam box
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`SKOR RISIKO: ${prediction.Risk_Score}%`, pageWidth / 2, yPos + 8, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Kategori: ${prediction.Risk_Level}`, pageWidth / 2, yPos + 16, { align: 'center' });
  
  yPos += 25;
}

// === STATUS (dengan separator yang jelas) ===
pdf.setDrawColor(220, 38, 38);
pdf.setLineWidth(0.5);
pdf.line(margin, yPos, pageWidth - margin, yPos);
yPos += 8;

pdf.setFontSize(12);
pdf.setFont('helvetica', 'bold');
pdf.setTextColor(0, 0, 0);
pdf.text('STATUS:', margin, yPos);

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(10);
const statusText = prediction.Prediction_Result === 1 
  ? 'RISIKO TINGGI DIABETES - Diperlukan evaluasi medis' 
  : 'RISIKO RENDAH DIABETES - Pertahankan pola hidup sehat';

pdf.text(statusText, margin + 20, yPos);
yPos += 12;
  // === PARAMETER KLINIS ===
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 38, 38);
  pdf.text('PARAMETER KLINIS', margin, yPos);
  yPos += 8;

  // Table header
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, yPos - 2, pageWidth - margin * 2, 6, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Parameter', margin + 3, yPos + 2);
  pdf.text('Nilai', margin + 70, yPos + 2);
  pdf.text('Satuan', margin + 110, yPos + 2);
  
  yPos += 7;

  // Data parameter
  const clinicalData = [
    { label: 'Glukosa Darah', value: parameters.glucose, unit: 'mg/dL' },
    { label: 'Tekanan Darah', value: parameters.bloodPressure, unit: 'mmHg' },
    { label: 'BMI', value: parameters.bmi.toFixed(1), unit: 'kg/m2' },
    { label: 'Insulin', value: parameters.insulin, unit: 'uU/mL' },
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

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50, 50, 50);
    pdf.text(item.label, margin + 3, yPos + 3);
    pdf.text(String(item.value), margin + 70, yPos + 3);
    pdf.text(item.unit, margin + 110, yPos + 3);
    
    yPos += 6;
  });

  yPos += 8;




   // === REKOMENDASI MEDIS ===
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 38, 38);
  pdf.text('REKOMENDASI MEDIS', margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(50, 50, 50);

  if (prediction.Recommendations && prediction.Recommendations.length > 0) {
    prediction.Recommendations.forEach((rec, index) => {
      // Cek batas halaman
      if (yPos + 10 > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }

      // ✅ Bersihkan teks: hapus emoji, quote, dan nomor lama
      const cleanRec = rec
        .replace(/[✅⚠️🔴🚨'"`]/g, '')
        .replace(/^\d+\.\s*/, '') // Hapus nomor lama jika ada
        .trim();
      
      // ✅ Tambahkan numbering baru (1., 2., 3., dst)
      const numberedRec = `${index + 1}. ${cleanRec}`;
      
      // Potong teks panjang agar tidak keluar margin
      const lines = pdf.splitTextToSize(numberedRec, pageWidth - margin * 2 - 5);
      
      // Tulis rekomendasi
      pdf.text(lines, margin, yPos + 3);
      
      // Update posisi Y sesuai jumlah baris
      yPos += lines.length * 5 + 3;
    });
  }
  // === FOOTER ===
  pdf.setDrawColor(220, 38, 38);
  pdf.setLineWidth(0.3);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(120, 120, 120);
  pdf.text('Hasil ini untuk tujuan skrining. Konsultasikan dengan tenaga medis.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  pdf.text('DiaCARES - Diabetes Care & Risk Evaluation System', pageWidth / 2, yPos, { align: 'center' });
  
  pdf.setFontSize(7);
  pdf.text(`ID: DIA-${prediction._id ? prediction._id.slice(-8).toUpperCase() : 'PENDING'}`, margin, pageHeight - 10);
  pdf.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

  // Save PDF
  const safeName = patientName.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
  pdf.save(`DiaCARES-Laporan-${safeName}-${Date.now()}.pdf`);
};

  const handleNewAssessment = () => {
    sessionStorage.removeItem('parameters');
    sessionStorage.removeItem('predictionId');
    navigate('/assessment');
  };

  const handleReset = () => {
    sessionStorage.clear();
    navigate('/');
  };

  
  // Loading state
if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
        <p className="text-red-600 text-lg font-medium">Memuat data pasien...</p>
      </div>
    </div>
  );
}

  if (!prediction) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
        <p className="text-red-600 text-lg font-medium">Menyiapkan prediksi...</p>
      </div>
    </div>
  );
}

  const isCompleted = prediction.status === 'completed' && prediction.Risk_Score !== null;
  const colors = isCompleted ? getRiskColor(prediction.Risk_Score!) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Status Banner */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
          isCompleted 
            ? 'bg-green-50 border-green-300 text-green-700' 
            : 'bg-blue-50 border-blue-300 text-blue-700'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {isCompleted ? '✅ Prediksi Selesai!' : '⏳ Sedang Diproses'}
            </p>
           
          </div>
          {!isCompleted && (
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isChecking}>
              {isChecking ? 'Memeriksa...' : 'Cek Ulang'}
            </Button>
          )}
        </div>

        <Card className="border-2 border-red-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-600 via-red-500 to-orange-600 border-b border-red-300">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Gender Icon - Bahasa Indonesia */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                  patientGender.toLowerCase() === 'laki-laki' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                    : 'bg-gradient-to-br from-pink-500 to-rose-500'
                }`}>
                  <span className="text-xl text-white font-bold">
                    {patientGender.toLowerCase() === 'laki-laki' ? 'L' : patientGender.toLowerCase() === 'perempuan' ? 'P' : '?'}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Hasil Prediksi
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base">
                    Pasien: {patientName} • {patientGender}
                  </CardDescription>
                  {prediction._id && (
                    <p className="text-xs text-white/70 mt-1">
                      ID: <code className="bg-white/20 px-1 rounded">{prediction._id.slice(-8)}</code>
                    </p>
                  )}
                </div>
              </div>
              {isCompleted && prediction.Prediction_Result === 1 ? (
                <AlertCircle className="w-12 h-12 text-white/90 animate-pulse" />
              ) : isCompleted ? (
                <CheckCircle className="w-12 h-12 text-white/90" />
              ) : (
                <Loader2 className="w-12 h-12 text-white/90 animate-spin" />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            
            {/* Risk Score - HANYA jika completed */}
            {isCompleted && colors && (
              <>
                <div className={`text-center p-6 ${colors.light} rounded-2xl border-2 ${colors.border}`}>
                  <p className="text-gray-700 mb-2 font-semibold">Diabetes Risk Score</p>
                  <div className={`text-6xl font-bold mb-4 bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
                    {prediction.Risk_Score}%
                  </div>
                  <div className={`inline-block px-6 py-3 rounded-full text-base font-bold ${colors.badge} text-white`}>
                    Risiko {prediction.Risk_Level}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-700">Progress Risiko</span>
                    <span className={colors.text}>{prediction.Risk_Score}/100</span>
                  </div>
                  <Progress value={prediction.Risk_Score!} className="h-4 bg-gray-200" />
                </div>
              </>
            )}

            {/* Parameter yang Diinput */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <Info className="w-5 h-5 text-red-600" />
                Parameter yang Diinput:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {parameters && Object.entries(parameters).map(([key, value]: [string, any]) => {
                  const labels: Record<string, string> = {
                    age: 'Usia', glucose: 'Glukosa', bloodPressure: 'Tekanan Darah',
                    bmi: 'BMI', insulin: 'Insulin', pregnancies: 'Jumlah Kehamilan',
                    skinThickness: 'Ketebalan Kulit', diabetesPedigreeFunction: 'Riwayat Keluarga'
                  };
                  const units: Record<string, string> = {
                    glucose: 'mg/dL', bloodPressure: 'mmHg', bmi: '', insulin: 'μU/mL',
                    age: 'tahun', pregnancies: 'kali', skinThickness: 'mm', diabetesPedigreeFunction: ''
                  };
                  const ranges: Record<string, [number, number]> = {
                    glucose: [70, 100], bloodPressure: [90, 120], bmi: [18.5, 24.9],
                    insulin: [16, 150], age: [0, 45], pregnancies: [0, 3],
                    skinThickness: [10, 30], diabetesPedigreeFunction: [0, 0.3]
                  };

                  const label = labels[key] || key;
                  const unit = units[key] || '';
                  const range = ranges[key];
                  const status = range ? getParamStatus(value, range[0], range[1]) : { color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
                  const displayValue = typeof value === 'number' 
                    ? (unit && (key === 'bmi' || key === 'diabetesPedigreeFunction') ? value.toFixed(1) : value) 
                    : value;

                  return (
                    <div key={key} className={`p-3 rounded-lg border-2 ${status.bg}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                        <span className={`text-xs font-bold ${status.color}`}>{displayValue} {unit}</span>
                      </div>
                      {range && <p className="text-xs text-gray-500 mt-1">Ideal: {range[0]}-{range[1]} {unit}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rekomendasi - HANYA jika completed */}
            {isCompleted && prediction.Recommendations && prediction.Recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Rekomendasi Medis:
                </h4>
                {prediction.Recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white-50 rounded-lg border border-white-100 hover:border-white-200 transition-all">
                    <span className="text-red-600 font-bold text-lg">{i + 1}.</span>
                    <p className="text-gray-700 text-sm flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Jika masih pending */}
            {!isCompleted && (
              <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-blue-700 font-medium">Menunggu hasil dari Machine Learning...</p>
                <p className="text-sm text-blue-600 mt-1">Hasil akan muncul otomatis dalam beberapa detik</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t-2 border-red-100 space-y-3">
              <Button 
                onClick={handlePrintPDF} 
                className="w-full h-12 text-base font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-300 flex items-center justify-center gap-2" 
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
                className="w-full h-12 text-base text-gray-600 hover:text-white-600 hover:bg-gray-60"
              >
                <Home className="w-5 h-5 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center text-xs text-gray-600 p-4 bg-red-50 rounded-xl border-2 border-red-200">
          <p className="font-medium">⚠️ Hasil ini hanya untuk tujuan skrining dan edukasi.</p>
          <p>Konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.</p>
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 backdrop-blur-sm p-4 rounded-xl text-center shadow-md border-2 border-green-300">
            <div className="flex justify-center mb-1"><CheckCircle className="w-8 h-8 text-green-600" /></div>
            <div className="text-sm font-semibold text-green-700">Data Pasien</div>
          </div>
          <div className="bg-green-50 backdrop-blur-sm p-4 rounded-xl text-center shadow-md border-2 border-green-300">
            <div className="flex justify-center mb-1"><CheckCircle className="w-8 h-8 text-green-600" /></div>
            <div className="text-sm font-semibold text-green-700">Parameter</div>
          </div>
          <div className={`backdrop-blur-sm p-4 rounded-xl text-center shadow-lg border-2 ${
            isCompleted ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex justify-center mb-1">
              {isCompleted ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              )}
            </div>
            <div className={`text-sm font-semibold ${isCompleted ? 'text-green-700' : 'text-blue-700'}`}>Hasil</div>
          </div>
        </div>
      </div>
    </div>
  );
}