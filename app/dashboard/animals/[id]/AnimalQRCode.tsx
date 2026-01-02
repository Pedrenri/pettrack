"use client";

import QRCode from "react-qr-code";
import { useRef } from "react";

export default function AnimalQRCode({ animalId }: { animalId: string }) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/animals-public/${animalId}`;
  const qrRef = useRef<HTMLDivElement | null>(null);

  function downloadSVG() {
    if (!qrRef.current) return;

    const svgElement = qrRef.current.querySelector("svg");
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `animal-${animalId}.svg`;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm flex flex-col items-center gap-2">
      <div ref={qrRef}>
        <QRCode
          value={url}
          size={128}
        />
      </div>

      <button
        onClick={downloadSVG}
        className="text-xs text-emerald-700 hover:underline"
      >
        Baixar QR Code (SVG)
      </button>
    </div>
  );
}
