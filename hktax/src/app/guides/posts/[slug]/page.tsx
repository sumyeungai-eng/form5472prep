import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "@/lib/content/posts";
import { PostDetail } from "./PostDetail";

type PostPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export default function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <PostDetail post={post} />;
}
