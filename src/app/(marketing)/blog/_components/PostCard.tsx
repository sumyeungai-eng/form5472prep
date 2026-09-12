import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { formatPostDate, type PostMeta } from "@/lib/blog";
import { formatTag } from "@/lib/blog-tags";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)] transition duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_55px_-32px_rgba(30,58,138,0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <PostMetaLine post={post} compact />
        <h3 className="mt-4 font-serif text-xl font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.description}</p>
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-xs font-medium text-slate-500">{formatTag(post.tags?.[1] ?? post.tags?.[0] ?? "Filing guide")}</span>
          <span className="inline-flex items-center text-xs font-semibold text-accent">
            Read <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PostMetaLine({ post, compact = false }: { post: PostMeta; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${compact ? "text-[11px]" : "text-xs"} font-medium text-slate-500`}>
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5 text-accent" />
        {formatPostDate(post.date)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-accent" />
        {post.readingMinutes} min read
      </span>
    </div>
  );
}

export function AuthorChip({ author }: { author: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-accent/15 bg-accent-50 p-1.5">
        <Image src="/logo-mark.svg" alt="" fill sizes="32px" className="object-contain p-1.5" />
      </div>
      <span className="text-sm text-slate-700">{author}</span>
    </div>
  );
}
