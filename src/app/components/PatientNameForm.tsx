import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// @ts-ignore
import logoImage from '../../assets/logo.png';

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
          <div className="mx-auto -mb-10 w-56 h-56 flex items-center justify-center overflow-hidden">
            <img 
              src={logoImage} 
              alt="DiaCares Logo" 
              className="w-full h-full object-contain scale-[2]"
            />
          </div>
          <CardTitle>DiaCARES (Diabetes Care System)</CardTitle>
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
                className="h-12 text-base"
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