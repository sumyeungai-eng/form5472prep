import { revalidatePath } from "next/cache";

// Every route that lists posts. /blog is page 1 of the paginated index and
// /blog/page/[n] are the older pages; the topic hubs (/blog/topics,
// /blog/topics/[tag] and their older pages /blog/topics/[tag]/page/[n]) are
// paginated the same way. A publish, edit, delete or scheduled release shifts
// posts across page boundaries, so all of them must refresh together (and a
// brand-new last page, e.g. page 9 once the post count passes 8 x 24, must
// stop serving a cached 404). Pass the route PATTERN to revalidatePath for a
// dynamic segment, never a concrete page number.
//
// Route group: Next 14.2 tags a cached page with its APP path, which includes
// the "(marketing)" group ("/(marketing)/blog/page/[n]/page"), so a pattern
// revalidation only matches when it names the group too. The group-less forms
// are kept as well so the call still lands if the group is ever renamed or
// removed; an unmatched tag is a no-op.
export const BLOG_ROUTE_GROUP = "(marketing)";

export function revalidateBlogIndex(): void {
  revalidatePath("/blog");
  revalidatePath("/blog/page/[n]", "page");
  revalidatePath(`/${BLOG_ROUTE_GROUP}/blog/page/[n]`, "page");
  // Layout scope = the topics index, every hub and every older hub page.
  revalidatePath("/blog/topics", "layout");
  revalidatePath(`/${BLOG_ROUTE_GROUP}/blog/topics`, "layout");
}
