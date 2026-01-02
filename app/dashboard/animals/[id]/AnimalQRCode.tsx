"use client";

import QRCode from "react-qr-code";

export default function AnimalQRCode({ animalId }: { animalId: string }) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/animals-public/${animalId}`;

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <QRCode value={url} size={96} />
    </div>
  );
}
