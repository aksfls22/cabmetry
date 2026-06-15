import Image from "next/image";

interface CabmetryIconProps {
  className?: string;
}

export function CabmetryIcon({ className }: CabmetryIconProps) {
  return (
    <Image
      src="/cabmetry-app-icon.png"
      alt="Cabmetry"
      width={1024}
      height={1024}
      className={className}
      priority
    />
  );
}