"use client";

import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
