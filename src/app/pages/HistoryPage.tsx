// src/pages/HistoryPage.tsx
import { useContext } from "react";
import { PatientContext } from "./PatientContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar, BarChart3, ArrowRight } from "lucide-react";

export function HistoryPage() {
  const { patient } = useContext(PatientContext);

  if (!patient) return <p className="text-center mt-10">Belum ada data pasien</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-red-600">Riwayat Pemeriksaan {patient.name}</h1>

      {/* Contoh riwayat dummy */}
      <Card className="border-red-200 shadow-lg">
        <CardHeader>
          <CardTitle>Asesmen Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <span>03 Apr 2026</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <span>Score: 12 (Rendah)</span>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <span>02 Apr 2026</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <span>Score: 25 (Tinggi)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}