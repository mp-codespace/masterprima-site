/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/checkout/failed/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Home, RefreshCcw, ExternalLink } from 'lucide-react';

type Invoice = {
  id: string;
  status?: string;
  normalized_status?: string;
  is_paid?: boolean;
  invoice_url?: string;
  paid_at?: string | null;
  expiry_date?: string | null;
  [k: string]: any;
};

function formatTime(v?: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '-' : d.toLocaleString();
}

function Badge({ text, tone }: { text: string; tone: 'red'|'yellow'|'green'|'gray' }) {
  const color =
    tone === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
    tone === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    tone === 'green' ? 'bg-green-100 text-green-700 border-green-200' :
    'bg-gray-100 text-gray-700 border-gray-200';
  return <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>{text}</span>;
}

function FailedContent() {
  const searchParams = useSearchParams();
  const externalId = searchParams.get('eid');

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const status = (invoice?.normalized_status || invoice?.status || 'PENDING').toUpperCase();
  const isPaid = status === 'PAID';

  const fetchStatus = async () => {
    if (!externalId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/xendit/get-invoice?external_id=${encodeURIComponent(externalId)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) setError(data?.error || 'Gagal mengambil status invoice');
      else setInvoice(data as Invoice);
    } catch (e: any) {
      setError(e?.message || 'Gagal mengambil status invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); /* eslint-disable-next-line */ }, [externalId]);

  const tone: 'red'|'yellow'|'green'|'gray' =
    isPaid ? 'green' : status === 'EXPIRED' || status === 'FAILED' ? 'red' : status === 'PENDING' ? 'yellow' : 'gray';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg text-center max-w-lg w-full border border-gray-200">
        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pembayaran Gagal / Tidak Selesai</h1>
        <div className="mb-6">
          <Badge text={isPaid ? 'PAID' : status} tone={tone} />
        </div>

        {!externalId && <p className="text-gray-600 mb-8">Tidak ada external_id pada URL. Silakan kembali ke halaman paket dan coba lagi.</p>}

        {externalId && (
          <>
            <div className="text-gray-700 mb-6 leading-relaxed">
              {loading && <p>Mengecek status terbaru…</p>}
              {!loading && isPaid && <p>Pembayaran sebenarnya <b>BERHASIL</b>. Jika akses belum aktif, refresh atau kembali ke beranda.</p>}
              {!loading && !isPaid && status === 'EXPIRED' && <p>Invoice <b>EXPIRED</b>. Silakan buat pesanan baru.</p>}
              {!loading && !isPaid && status === 'FAILED' && <p>Pembayaran <b>FAILED</b>. Coba lagi atau gunakan metode lain.</p>}
              {!loading && !isPaid && status === 'PENDING' && <p>Masih <b>MENUNGGU</b>. Klik tombol di bawah untuk cek lagi.</p>}
              {error && <p className="text-red-600 mt-3">{error}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left mb-8">
              <dl className="grid grid-cols-3 gap-2 text-sm">
                <dt className="col-span-1 text-gray-500">External ID</dt>
                <dd className="col-span-2 font-mono text-gray-800 break-all">{externalId}</dd>

                <dt className="col-span-1 text-gray-500">Invoice ID</dt>
                <dd className="col-span-2 font-mono text-gray-800 break-all">{invoice?.id ?? '-'}</dd>

                <dt className="col-span-1 text-gray-500">Paid at</dt>
                <dd className="col-span-2 text-gray-800">{formatTime(invoice?.paid_at)}</dd>

                <dt className="col-span-1 text-gray-500">Expiry</dt>
                <dd className="col-span-2 text-gray-800">{formatTime(invoice?.expiry_date)}</dd>
              </dl>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={fetchStatus} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition" disabled={loading}>
                <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Mengecek…' : 'Cek status lagi'}
              </button>

              {invoice?.invoice_url && !isPaid && (
                <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition">
                  <ExternalLink className="w-5 h-5" />
                  Buka Halaman Pembayaran
                </a>
              )}

              <Link href="/price" className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-700 transition">
                <Home className="w-5 h-5" />
                Kembali ke Halaman Paket
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <FailedContent />
    </Suspense>
  );
}
