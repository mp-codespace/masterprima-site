/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/checkout/page.tsx
'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Home, RefreshCcw, ExternalLink, Clock } from 'lucide-react';

type Invoice = {
  id: string;
  external_id: string;
  status?: string;
  normalized_status?: string;
  is_paid?: boolean;
  amount?: number;
  paid_at?: string | null;
  expiry_date?: string | null;
  invoice_url?: string;
  [k: string]: any;
};

function formatTime(v?: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '-' : d.toLocaleString();
}
function formatIDR(n?: number) {
  if (typeof n !== 'number') return '-';
  try { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n); }
  catch { return String(n); }
}
function Badge({ text, tone }: { text: string; tone: 'green'|'yellow'|'red'|'gray' }) {
  const color =
    tone === 'green' ? 'bg-green-100 text-green-700 border-green-200' :
    tone === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    tone === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
    'bg-gray-100 text-gray-700 border-gray-200';
  return <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>{text}</span>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const externalId = searchParams.get('eid');

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollStop = useRef(false);

  const status = useMemo(() => {
    const raw = (invoice?.normalized_status || invoice?.status || 'PENDING').toUpperCase();
    return raw === 'SETTLED' ? 'PAID' : raw;
  }, [invoice]);
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

  // initial fetch + short polling (maks 60s atau berhenti saat PAID)
  useEffect(() => {
    if (!externalId) return;
    let elapsed = 0;
    pollStop.current = false;

    const run = async () => {
      await fetchStatus();
      if (pollStop.current) return;
      const timer = setInterval(async () => {
        elapsed += 3;
        if (pollStop.current || elapsed >= 60) {
          clearInterval(timer);
          return;
        }
        await fetchStatus();
      }, 3000);
      return () => clearInterval(timer);
    };

    const cleanupPromise = run();
    return () => {
      pollStop.current = true;
      if (cleanupPromise && typeof cleanupPromise.then === 'function') cleanupPromise.then((c: any) => c && c());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalId]);

  useEffect(() => {
    if (isPaid) pollStop.current = true;
  }, [isPaid]);

  const tone: 'green'|'yellow'|'red'|'gray' =
    isPaid ? 'green' : status === 'PENDING' ? 'yellow' : (status === 'EXPIRED' || status === 'FAILED') ? 'red' : 'gray';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg text-center max-w-lg w-full border border-gray-200">
        <CheckCircle className={`w-20 h-20 mx-auto mb-6 ${isPaid ? 'text-green-500' : 'text-gray-400'}`} />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Terima kasih!</h1>

        <div className="mb-4">
          <Badge text={isPaid ? 'PAID' : status} tone={tone} />
        </div>

        {!externalId && (
          <p className="text-gray-600 mb-8">
            Tidak ada <span className="font-mono">external_id</span> pada URL. Silakan kembali ke beranda.
          </p>
        )}

        {externalId && (
          <>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {loading && <>Mengecek status pembayaran…</>}
              {!loading && isPaid && <>Pembayaran Anda <b>berhasil</b>. Akses paket segera aktif.</>}
              {!loading && !isPaid && status === 'PENDING' && (<>Pembayaran masih <b>menunggu</b>. Halaman ini akan ter-update otomatis setelah notifikasi dari Xendit diterima.</>)}
              {!loading && !isPaid && status === 'EXPIRED' && (<>Invoice sudah <b>EXPIRED</b>. Silakan buat pesanan baru dari halaman paket.</>)}
              {!loading && !isPaid && status === 'FAILED' && (<>Pembayaran <b>FAILED</b>. Anda bisa mencoba lagi atau gunakan metode lain.</>)}
              {error && <span className="text-red-600 block mt-2">{error}</span>}
            </p>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left mb-8">
              <dl className="grid grid-cols-3 gap-2 text-sm">
                <dt className="col-span-1 text-gray-500">External ID</dt>
                <dd className="col-span-2 font-mono text-gray-800 break-all">{externalId}</dd>

                <dt className="col-span-1 text-gray-500">Invoice ID</dt>
                <dd className="col-span-2 font-mono text-gray-800 break-all">{invoice?.id ?? '-'}</dd>

                <dt className="col-span-1 text-gray-500">Jumlah</dt>
                <dd className="col-span-2 text-gray-800">{formatIDR(invoice?.amount)}</dd>

                <dt className="col-span-1 text-gray-500">Paid at</dt>
                <dd className="col-span-2 text-gray-800">{formatTime(invoice?.paid_at)}</dd>

                <dt className="col-span-1 text-gray-500">Expiry</dt>
                <dd className="col-span-2 text-gray-800">{formatTime(invoice?.expiry_date)}</dd>
              </dl>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!isPaid && (
                <button
                  onClick={fetchStatus}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                  disabled={loading}
                  aria-disabled={loading}
                >
                  <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Mengecek…' : 'Cek status lagi'}
                </button>
              )}

              {!isPaid && invoice?.invoice_url && (
                <a
                  href={invoice.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition"
                >
                  <ExternalLink className="w-5 h-5" />
                  Buka Halaman Pembayaran
                </a>
              )}

              {isPaid ? (
                <Link href="/" className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition">
                  <Home className="w-5 h-5" />
                  Kembali ke Beranda
                </Link>
              ) : (
                <Link href="/price" className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-700 transition">
                  <Clock className="w-5 h-5" />
                  Pilih Ulang Paket
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
