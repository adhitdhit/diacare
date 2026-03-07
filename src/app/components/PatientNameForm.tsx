import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { UserCircle } from 'lucide-react';

interface PatientNameFormProps {
  onSubmit: (name: string) => void;
}

export function PatientNameForm({ onSubmit }: PatientNameFormProps) {
  const [patientName, setPatientName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientName.trim()) {
      onSubmit(patientName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle>DiaCARE (Diabetes Care System)</CardTitle>
          <CardDescription>
            Masukkan Informasi Pasien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Nama Pasien</Label>
              <Input
                id="patientName"
                type="text"
                placeholder="Masukkan Nama Lengkap"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Continue to Assessment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
