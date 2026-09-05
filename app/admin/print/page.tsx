import { Suspense } from "react";
import PrintClient from "./PrintClient";

export default function PrintPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-neutral-100">
          <p>正在載入祈福資料...</p>
        </main>
      }
    >
      <PrintClient />
    </Suspense>
  );
}
