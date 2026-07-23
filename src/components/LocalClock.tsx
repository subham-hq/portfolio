"use client";

import { useEffect, useState } from "react";
import { person } from "@/content/site";

/**
 * The visitor sees what time it is where Subham is. Small, but it is the one
 * piece of information a recruiter in another timezone actually needs before
 * deciding when to write.
 *
 * Renders an empty slot on the server so hydration cannot mismatch.
 */
export function LocalClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: person.timezone,
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="mono tabular-nums" suppressHydrationWarning>
      {time ? `${time} IST` : "—:— IST"}
    </span>
  );
}
