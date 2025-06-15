// src\components\MapSection.tsx

'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Clock, Mail, ExternalLink, Car, Bus, Train } from 'lucide-react';

interface MapSectionProps {
  className?: string;
}

const MapSection: React.FC<MapSectionProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'directions' | 'contact'>('map');
  const [isLoading, setIsLoading] = useState(false);

  // Location data
  const locationData = {
    name: "MASTERPRIMA - SURABAYA",
    address: "Jl. Gubernur Suryo 3 Surabaya (Komplek SMA Trimurti)",
    phone: "+62 856-4687-7888",
    email: "masterprimasurabaya@gmail.com",
    hours: "Senin - Jumat: 09:00 - 17:00"
  };

  const nearbyPlaces = [
    { name: "BG Junction Mall", type: "Shopping", distance: "0.5 km" },
    { name: "Tunjungan Plaza 6", type: "Shopping", distance: "0.8 km" },
    { name: "JW Marriott Hotel Surabaya", type: "Hotel", distance: "0.6 km" },
    { name: "Surabaya City Hall", type: "Government", distance: "1.2 km" },
    { name: "Grand City Mall Surabaya", type: "Shopping", distance: "1.0 km" }
  ];

  const transportOptions = [
    { icon: Car, type: "Mobil", desc: "15 menit dari pusat kota", color: "text-red-600" },
    { icon: Bus, type: "Bus", desc: "Halte terdekat 200m", color: "text-green-600" },
    { icon: Train, type: "KRL", desc: "Stasiun Gubeng 2km", color: "text-purple-600" }
  ];

  const handleGetDirections = () => {
    setIsLoading(true);
    setTimeout(() => {
      const googleMapsUrl = 'https://maps.app.goo.gl/DGw5Kpmu7vUxJJxTA';
      window.open(googleMapsUrl, '_blank');
      setIsLoading(false);
    }, 1000);
  };

  const tabs = [
    { key: 'map' as const, label: 'Peta', icon: MapPin },
    { key: 'directions' as const, label: 'Petunjuk Arah', icon: Navigation },
    { key: 'contact' as const, label: 'Kontak', icon: Phone }
  ];

  return (
    <section className={`py-16 bg-secondary-sand ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white text-primary-red px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            Alamat dan Maps
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lokasi Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan lokasi kantor cabang MasterPrima Surabaya dan dapatkan petunjuk arah
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Map Container */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-all duration-200 ${
                      activeTab === key
                        ? 'bg-red-50 text-red-600 border-b-2 border-red-600'
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'map' && (
                  <div className="space-y-6">
                    {/* Real Google Maps Embed */}
                    <div className="relative rounded-xl overflow-hidden h-80 sm:h-96 shadow-lg">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.4831842467!2d112.74950931477!3d-7.257472994757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f96ec1b5b729%3A0x8c8a8f1b2b2b2b2b!2sJl.%20Gubernur%20Suryo%20No.3%2C%20Embong%20Kaliasin%2C%20Kec.%20Genteng%2C%20Surabaya%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1640000000000!5m2!1sid!2sid"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Lokasi MasterPrima Surabaya"
                        className="w-full h-full"
                      />
                      
                      {/* Overlay Controls */}
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={handleGetDirections}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 border"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Navigation className="w-4 h-4 text-red-600" />
                          )}
                          <span className="hidden sm:inline">Petunjuk Arah</span>
                          <ExternalLink className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>

                      {/* Location Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-red-500 rounded-full p-2 flex-shrink-0">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                {locationData.name}
                              </h3>
                              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                {locationData.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Map Features */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Lokasi Spesifik
                        </h4>
                        <p className="text-purple-700 text-sm">
                          Komplek SMA Trimurti
                        </p>
                        <p className="text-purple-600 text-xs mt-1">
                          Area pendidikan & bisnis
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <Navigation className="w-4 h-4" />
                          Area
                        </h4>
                        <p className="text-green-700 text-sm">
                          Pusat Kota Surabaya
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          Zona strategis bisnis
                        </p>
                      </div>
                    </div>

                    {/* Map Instructions */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-800 mb-2">💡 Tips Menggunakan Peta</h4>
                      <ul className="text-amber-700 text-sm space-y-1">
                        <li>&bull; Klik dan drag untuk menggeser peta</li>
                        <li>&bull; Gunakan scroll mouse untuk zoom in/out</li>
                        <li>&bull; Klik tombol &ldquo;Petunjuk Arah&rdquo; untuk navigasi</li>
                        <li>&bull; Klik &ldquo;View larger map&rdquo; untuk membuka di tab baru</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'directions' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Pilihan Transportasi</h3>
                    <div className="grid gap-4">
                      {transportOptions.map(({ icon: Icon, type, desc, color }, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className={`p-3 rounded-full bg-white ${color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{type}</h4>
                            <p className="text-gray-600 text-sm">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Tips Perjalanan</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>• Parkir tersedia di area komplek</li>
                        <li>• Akses mudah dari Jalan Raya Gubernur Suryo</li>
                        <li>• Landmark: dekat dengan BG Junction Mall</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Informasi Kontak</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-800">Telepon</p>
                          <p className="text-gray-600">{locationData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-semibold text-gray-800">Email</p>
                          <p className="text-gray-600">{locationData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-semibold text-gray-800">Jam Operasional</p>
                          <p className="text-gray-600">{locationData.hours}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Cepat</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Alamat</p>
                    <p className="text-gray-600 text-sm">{locationData.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Jam Buka</p>
                    <p className="text-gray-600 text-sm">{locationData.hours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nearby Places */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tempat Terdekat</h3>
              <div className="space-y-3">
                {nearbyPlaces.map((place, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{place.name}</p>
                      <p className="text-gray-500 text-xs">{place.type}</p>
                    </div>
                    <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                      {place.distance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;