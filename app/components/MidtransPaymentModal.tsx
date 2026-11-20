'use client';

import { useState, useEffect } from 'react';

type PaymentStep = 'METHODS' | 'VA_LIST' | 'PAY_DETAIL';

function formatRupiah(angka: number) {
  return 'Rp' + new Intl.NumberFormat('id-ID').format(angka);
}

export default function MidtransPaymentModal({
  orderCode,
  totalAmount,
  onSuccess,
  onClose,
}: {
  orderCode: string;
  totalAmount: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<PaymentStep>('METHODS');
  const [selectedChannel, setSelectedChannel] = useState<string>('GoPay QRIS');
  const [secondsLeft, setSecondsLeft] = useState(23 * 3600 + 59 * 60 + 53);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const handleSelectChannel = (channel: string) => {
    setSelectedChannel(channel);
    setStep('PAY_DETAIL');
  };

  const handleConfirmPaid = async () => {
    setIsConfirming(true);
    try {
      await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode,
          paymentMethod: selectedChannel,
        }),
      });
      onSuccess();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header Nominal & Order ID */}
        <div className="border-b border-slate-200 bg-white px-5 pt-4 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                {formatRupiah(totalAmount)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Order ID #{orderCode}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Countdown Bar */}
        <div className="bg-slate-100 py-2 text-center text-xs font-medium text-slate-700">
          Choose within{' '}
          <span className="font-mono font-bold text-slate-900">
            {hours}:{mins}:{secs}
          </span>
        </div>

        {/* Body Pilihan Metode */}
        {step === 'METHODS' && (
          <div className="max-h-[65vh] divide-y divide-slate-100 overflow-y-auto px-5 py-3">
            <div className="pb-3">
              <p className="mb-2 text-xs font-semibold text-slate-400">
                Recommended payment method
              </p>
              <button
                type="button"
                onClick={() => handleSelectChannel('GoPay QRIS')}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-blue-500 hover:bg-blue-50/40"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">GoPay QRIS</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] font-bold">
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-700">
                      gopay
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                      QRIS
                    </span>
                  </div>
                </div>
                <span className="text-slate-400">›</span>
              </button>
            </div>

            <div className="pt-3">
              <p className="mb-2 text-xs font-semibold text-slate-400">
                All payment methods
              </p>

              {/* GoPay QRIS */}
              <button
                type="button"
                onClick={() => handleSelectChannel('GoPay QRIS')}
                className="flex w-full items-center justify-between border-b border-slate-100 py-3.5 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">GoPay QRIS</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-bold">
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-700">
                      gopay
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                      QRIS
                    </span>
                  </div>
                </div>
                <span className="text-slate-400">›</span>
              </button>

              {/* Virtual Account */}
              <button
                type="button"
                onClick={() => setStep('VA_LIST')}
                className="flex w-full items-center justify-between border-b border-slate-100 py-3.5 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Virtual account
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold">
                    <span className="rounded border border-slate-200 px-1.5 py-0.5 text-blue-800">
                      BCA
                    </span>
                    <span className="rounded border border-slate-200 px-1.5 py-0.5 text-amber-700">
                      mandiri
                    </span>
                    <span className="rounded border border-slate-200 px-1.5 py-0.5 text-orange-600">
                      BNI
                    </span>
                    <span className="rounded border border-slate-200 px-1.5 py-0.5 text-blue-700">
                      BRI
                    </span>
                    <span className="rounded border border-slate-200 px-1.5 py-0.5 text-emerald-700">
                      Permata
                    </span>
                  </div>
                </div>
                <span className="text-slate-400">⌄</span>
              </button>

              {/* Card Payment */}
              <button
                type="button"
                onClick={() => handleSelectChannel('Credit / Debit Card')}
                className="flex w-full items-center justify-between border-b border-slate-100 py-3.5 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Card Payment
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-extrabold">
                    <span className="rounded border border-slate-200 px-1.5 py-0.5 text-blue-900">
                      VISA
                    </span>
                    <span className="rounded border border-slate-200 px-1.5 py-0.5 text-red-600">
                      Mastercard
                    </span>
                    <span className="rounded border border-slate-200 px-1.5 py-0.5 text-emerald-700">
                      JCB
                    </span>
                  </div>
                </div>
                <span className="text-slate-400">›</span>
              </button>

              {/* ShopeePay QRIS */}
              <button
                type="button"
                onClick={() => handleSelectChannel('ShopeePay QRIS')}
                className="flex w-full items-center justify-between py-3.5 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    ShopeePay QRIS
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold">
                    <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-600">
                      ShopeePay
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                      QRIS
                    </span>
                  </div>
                </div>
                <span className="text-slate-400">›</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub-pilihan Bank Virtual Account */}
        {step === 'VA_LIST' && (
          <div className="p-5">
            <button
              type="button"
              onClick={() => setStep('METHODS')}
              className="mb-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              ← Kembali ke semua metode
            </button>
            <p className="mb-3 text-sm font-bold text-slate-900">
              Pilih Bank Virtual Account
            </p>
            <div className="space-y-2">
              {[
                'BCA Virtual Account',
                'Mandiri Virtual Account',
                'BNI Virtual Account',
                'BRI Virtual Account',
                'Permata Virtual Account',
              ].map((bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => handleSelectChannel(bank)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 hover:border-blue-500 hover:bg-blue-50/40"
                >
                  <span>{bank}</span>
                  <span>›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detail Instruksi Pembayaran */}
        {step === 'PAY_DETAIL' && (
          <div className="space-y-4 p-5">
            <button
              type="button"
              onClick={() => setStep('METHODS')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              ← Ganti metode pembayaran
            </button>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-bold text-slate-700">
                {selectedChannel}
              </p>

              {selectedChannel.includes('QRIS') ? (
                <div className="mx-auto my-3 flex h-40 w-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-3">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-4 w-4 ${
                          i % 2 === 0 || i % 3 === 0
                            ? 'bg-slate-900'
                            : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-slate-500">
                    SCAN QRIS MIDTRANS
                  </p>
                </div>
              ) : (
                <div className="my-3 rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] text-slate-400">
                    Nomor Virtual Account
                  </p>
                  <p className="mt-1 font-mono text-lg font-extrabold tracking-wider text-slate-900">
                    88010{orderCode.replace(/\D/g, '').slice(0, 10) || '20261120'}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                Selesaikan pembayaran sesuai nominal{' '}
                <strong className="text-slate-900">
                  {formatRupiah(totalAmount)}
                </strong>
              </p>
            </div>

            <button
              type="button"
              disabled={isConfirming}
              onClick={handleConfirmPaid}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isConfirming
                ? 'Memverifikasi Pembayaran...'
                : 'Saya Sudah Bayar (Konfirmasi Lunas)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}