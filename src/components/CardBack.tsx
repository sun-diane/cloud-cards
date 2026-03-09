import { cn } from "@/lib/utils";

interface CardBackProps {
  large?: boolean;
  className?: string;
}

export default function CardBack({ large, className }: CardBackProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden card-shadow",
        large ? "w-[340px] h-[405px]" : "w-[260px] h-[310px]",
        className
      )}
    >
      <img
        src={`${import.meta.env.BASE_URL}ui/card-back.png`}
        alt="Card Back"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
