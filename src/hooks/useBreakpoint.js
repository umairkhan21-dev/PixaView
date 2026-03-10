import { useEffect, useState } from "react";

export default function useBreakpoint(maxWidth) {
  const [match, setMatch] = useState(
    window.innerWidth <= maxWidth
  );

  useEffect(() => {
    const onResize = () => {
      setMatch(window.innerWidth <= maxWidth);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [maxWidth]);

  return match;
};