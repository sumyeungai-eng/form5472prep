import Image from "next/image";
import Link from "next/link";

type FeatureCardProps = {
  href: string;
  imageAlt: string;
  imageSrc: string;
  title: string;
  description: string;
};

export function FeatureCard({
  description,
  href,
  imageAlt,
  imageSrc,
  title
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="card group focus-ring flex h-full flex-col overflow-hidden p-2 transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:-translate-y-0.5 focus-visible:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-navy-100">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/[0.24] via-transparent to-white/[0.08]" />
      </div>
      <div className="flex flex-1 flex-col p-4 pb-5 pt-5">
        <h3 className="text-lg font-bold text-navy-950">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-warm-700">{description}</p>
      </div>
    </Link>
  );
}
