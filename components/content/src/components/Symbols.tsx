import React from "react";

interface SymbolsProviderProps {
  fill?: number;
  grade?: number;
  weight?: number;
  iconSize?: string;
  color?: string;
  classname?: string;
  children: React.ReactNode;
}

const SymbolsProvider: React.FC<SymbolsProviderProps> = ({
  fill = 0,
  grade = 0,
  weight = 400,
  iconSize = "24px",
  color = undefined,
  classname = "",
  children,
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [parsedSize, setParsedSize] = React.useState(24);
  
  React.useEffect(() => {
    const size = convertToPx({ size: iconSize });
    setParsedSize(size);
  }, [iconSize]);

  const opsz = Math.min(48, Math.max(20, parsedSize));

  if (fill !== 0 && fill !== 1) {
    console.error("IconsProvider: fill must be 0 or 1");
  }

  if (grade < -25 || grade > 200) {
    console.error("IconsProvider: grade must be between -25 and 200");
  }

  if (weight < 100 || weight > 700) {
    console.error("IconsProvider: weight must be between 100 and 700");
  }

  return (
    <span
      className={`material-symbols-rounded ${classname}`}
      ref={ref}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'GRAD' ${grade}, 
        'opsz' ${opsz}, 'wght' ${weight}`,
        fontSize: parsedSize,
        color: color || undefined,
      }}
    >
      {children}
    </span>
  );
};

export default SymbolsProvider;

interface ConvertToPxProps {
  size: string;
}
function convertToPx({ size }: ConvertToPxProps) {
  try {
    const match = size.trim().match(/^([\d.]+)(px|rem)$/u);
    if (!match) {
      return 24;
    }

    const [, numericPart, unit] = match;
    const value = parseFloat(numericPart);

    if (unit === "px") {
      return value;
    }

    if (unit === "rem") {
      if (typeof window !== "undefined") {
        const rootFontSize = parseFloat(
          window.getComputedStyle(document.documentElement).fontSize
        );
        return value * rootFontSize;
      }
      return value * 16;
    }

    return 24;
  } catch (error) {
    console.error("Error parsing icon size", error);
    return 24;
  }
}
