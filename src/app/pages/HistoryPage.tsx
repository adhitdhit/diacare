// src/pages/HistoryPage.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Calendar, 
  User, 
  Activity, 
  Loader2,
  AlertCircle,
  FileText,
  Home,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HistoryData {
  _id: string;
  patientName: string;
  patientGender: string;
  status: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/history`);
        const result = await response.json();
        
        if (result.success) {
          setHistory(result.data);
        } else {
          setError('Gagal memuat data riwayat');
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Tidak dapat terhubung ke server');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);


  //Format Date
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    // FIX: Ganti spasi jadi format ISO yang valid
    let cleanDate = dateString.replace(' ', 'T');
    if (cleanDate.includes('+00:00')) {
      cleanDate = cleanDate.replace('+00:00', 'Z');
    }
    const utcDate = new Date(cleanDate);
    
    // AUTO-DETECT timezone browser user
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Format sesuai timezone user
    const formatted = utcDate.toLocaleString('id-ID', {
      timeZone: userTimezone,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return formatted;
  } catch (error) {
    console.error('Format date error:', error);
    return '-';
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium">Memuat riwayat asesmen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-red-300 shadow-lg">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-semibold mb-2">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Asesmen</h1>
            <p className="text-gray-600 mt-1">
              Daftar pasien yang telah melakukan pemeriksaan
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Kembali ke Beranda</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/assessment')}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
            >
              <Activity className="w-5 h-5 mr-2" />
              Asesmen Baru
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Belum Ada Riwayat
              </h3>
              <p className="text-gray-500 mb-4">
                Data asesmen akan muncul di sini setelah ada pasien yang melakukan pemeriksaan
              </p>
              <Button onClick={() => navigate('/assessment')}>
                Mulai Asesmen Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* List History - TANPA TOMBOL LIHAT & UMUR */
          <div className="space-y-3">
            {history.map((item) => (
              <Card 
                key={item._id} 
                className="border-2 border-gray-200 hover:border-red-300 transition-all shadow-sm hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    
                    {/* Left: Patient Info */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon Gender */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.patientGender === 'perempuan' 
                          ? 'bg-pink-100' 
                          : 'bg-blue-100'
                      }`}>
                        <User className={`w-6 h-6 ${
                          item.patientGender === 'perempuan' 
                            ? 'text-pink-600' 
                            : 'text-blue-600'
                        }`} />
                      </div>

                      {/* Patient Name & Date */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {item.patientName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                          <span>•</span>
                          <span>{item.patientGender}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Badge Only */}
                    <div className="ml-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : item.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                      }`}>
                        {item.status === 'completed' ? '✅ Selesai' : 
                         item.status === 'processing' ? '⏳ Diproses' : 
                         '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                🔒 Kerahasiaan Data Pasien Terjaga
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Halaman ini hanya menampilkan informasi dasar (nama, tanggal, dan jenis kelamin). 
                Hasil pemeriksaan medis yang bersifat rahasia tidak ditampilkan di sini untuk 
                melindungi privasi pasien.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}