import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/helpers/theme_helpers";
import { useEffect, useState } from "react";

export default function ToggleTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      setIsDark(htmlElement.classList.contains("dark"));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Button onClick={toggleTheme} size="icon" variant="ghost">
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
