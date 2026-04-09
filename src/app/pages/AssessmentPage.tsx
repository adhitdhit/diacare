import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, User, UserCircle } from 'lucide-react';

// Import Logo
// @ts-ignore
import logoImage from "@/assets/logoss.png";

export function AssessmentPage() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [gender, setGender] = useState<'Laki-Laki' | 'Perempuan' | ''>('');

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientName.trim() && gender) {
      sessionStorage.setItem('patientName', patientName);
      sessionStorage.setItem('patientGender', gender);
      navigate('/parameters');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Tombol kembali ke beranda */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-white/50 transition-all text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>

        {/* Card Form Assessment */}
        <Card className="w-full shadow-2xl border-2 border-red-200 overflow-hidden">
          
          {/* Header dengan Logo Transparan */}
          <CardHeader className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-b border-red-200 pt-8 pb-6 text-center">
            
            {/* LOGO - DENGAN CSS HACK mix-blend-multiply */}
            <div className="flex justify-center -mb-5">
              <img
                src={logoImage}
                alt="DiaCares Logo"
                // 'mix-blend-multiply' adalah kuncinya! Ini menghapus background putih gambar
                className="w-90 h-auto mix-blend-multiply" 
              />
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
             
              <CardDescription className="text-base text-gray-600 font-medium">
                Diabetes Care & Risk Evaluation System
              </CardDescription>
              <p className="text-sm text-gray-500 mt-2 font-medium">
                Masukkan Informasi Pasien
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Patient Name Input */}
              <div className="space-y-3">
                <Label htmlFor="patientName" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                  <User className="w-5 h-5 text-red-600" />
                  Nama Pasien
                </Label>
                <Input
                  id="patientName"
                  type="text"
                  placeholder="Masukkan Nama Lengkap Pasien"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                  className="h-14 text-base border-2 border-red-200 focus:border-red-500 rounded-xl transition-all"
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2 text-gray-700">
                  <UserCircle className="w-5 h-5 text-red-600" />
                  Jenis Kelamin
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Male Button */}
                  <button
                    type="button"
                    onClick={() => setGender('Laki-Laki')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      gender === 'Laki-Laki'
                        ? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg scale-[1.02]'
                        : 'border-red-200 bg-white hover:border-red-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        gender === 'Laki-Laki'
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-md'
                          : 'bg-gray-200'
                      }`}>
                        <svg className={`w-8 h-8 ${gender === 'Laki-Laki' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-base ${gender === 'Laki-Laki' ? 'text-red-700' : 'text-gray-700'}`}>
                        Laki-laki
                      </span>
                    </div>
                  </button>

                  {/* Female Button */}
                  <button
                    type="button"
                    onClick={() => setGender('Perempuan')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      gender === 'Perempuan'
                        ? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg scale-[1.02]'
                        : 'border-red-200 bg-white hover:border-red-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        gender === 'Perempuan'
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-md'
                          : 'bg-gray-200'
                      }`}>
                        <svg className={`w-8 h-8 ${gender === 'Perempuan' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-base ${gender === 'Perempuan' ? 'text-red-700' : 'text-gray-700'}`}>
                        Perempuan
                      </span>
                    </div>
                  </button>
                </div>
               
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!patientName.trim() || !gender}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-700 hover:via-red-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl text-white"
              >
                Lanjutkan ke Parameter Klinis
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl text-center shadow-lg border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-1">1</div>
            <div className="text-sm font-medium text-gray-700">Data Pasien</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl text-center shadow-md border border-gray-200">
            <div className="text-3xl font-bold text-gray-400 mb-1">2</div>
            <div className="text-sm text-gray-500">Parameter</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl text-center shadow-md border border-gray-200">
            <div className="text-3xl font-bold text-gray-400 mb-1">3</div>
            <div className="text-sm text-gray-500">Hasil</div>
          </div>
        </div>
      </div>
    </div>
  );
}