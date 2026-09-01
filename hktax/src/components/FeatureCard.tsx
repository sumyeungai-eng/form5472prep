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
      className="card group focus-ring block overflow-hidden transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-lift hover:will-change-transform focus-visible:-translate-y-1 focus-visible:shadow-lift focus-visible:will-change-transform"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-100">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-warm-700">{description}</p>
      </div>
    </Link>
  );
}
