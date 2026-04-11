import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, Activity, Clock, Hospital, BookOpen, Info, 
  Menu, X, Sparkles, Phone
} from 'lucide-react';
import { Card } from '../components/ui/card';

// SIDEBAR SEDERHANA - TANPA PROPS
export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true); 

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home, path: '/' },
    { id: 'assessment', label: 'Asesmen Baru', icon: Activity, path: '/assessment', highlight: true },
    { id: 'history', label: 'Riwayat', icon: Clock, path: '/history' },
    { id: 'hospitals', label: 'Rumah Sakit', icon: Hospital, path: '/hospitals' },
    { id: 'education', label: 'Edukasi', icon: BookOpen, path: '/education' },
    { id: 'about', label: 'Tentang', icon: Info, path: '/about' },
  ];

  const quickTips = [
    "💧 Minum 8 gelas air putih per hari",
    "🚶 Jalan kaki 30 menit setiap hari",
    "🥗 Perbanyak sayur & kurangi gula",
    "😴 Tidur cukup 7-8 jam per malam",
    "🩺 Cek gula darah rutin",
  ];

  const randomTip = quickTips[Math.floor(Math.random() * quickTips.length)];

  return (
    <>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-white border-r-2 border-red-100 shadow-lg z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header dengan Tombol X */}
        <div className="flex items-center justify-between p-4 border-b-2 border-red-100 bg-red-50">
          <h3 className="text-lg font-bold text-gray-900">Menu</h3>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" /> 
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-160px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                } ${item.highlight ? 'border-2 border-red-300' : ''}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto px-2 py-0.5 bg-red-100 rounded-full text-xs font-bold text-red-600">New</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Tip Card */}
        <div className="p-4">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-md">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800">Tips Hari Ini</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">{randomTip}</p>
            </div>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="p-4 border-t-2 border-red-100 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            <Phone className="w-4 h-4 text-red-600" />
            <span className="font-medium">Butuh bantuan?</span>
          </div>
          <p className="text-xs text-gray-500">info@diacares.id</p>
        </div>
      </aside>

      {/* Tombol Hamburger (muncul saat sidebar tertutup) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border-2 border-red-100 hover:border-red-300 transition-all"
        >
          <Menu className="w-6 h-6 text-red-600" />
        </button>
      )}
    </>
  );
}