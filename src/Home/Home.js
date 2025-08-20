import React, { useState, useEffect } from "react";
import DesktopHome from "./DesktopHome";
import MobileHome from "./MobileHome";

export default function HomeWrapper() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <MobileHome /> : <DesktopHome />;
}
