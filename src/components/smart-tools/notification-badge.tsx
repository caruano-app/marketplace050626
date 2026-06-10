"use client";

import { useEffect, useState } from "react";

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCount((current) => (current >= 9 ? 1 : current + 1));
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-40 grid h-8 min-w-8 place-items-center rounded-full bg-red-600 px-2 text-xs font-black text-white shadow-lg">
      {count}
    </div>
  );
}
