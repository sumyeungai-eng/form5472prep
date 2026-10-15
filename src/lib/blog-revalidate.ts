import { revalidatePath } from "next/cache";

// Every route that lists posts. /blog is page 1 of the paginated index and
// /blog/page/[n] are the older pages; a publish, edit, delete or scheduled
// release shifts posts across page boundaries, so all of them must refresh
// together (and a brand-new last page, e.g. page 9 once the post count passes
// 8 x 24, must stop serving a cached 404). Pass the route PATTERN to
// revalidatePath for the dynamic segment, never a concrete page number.
export function revalidateBlogIndex(): void {
  revalidatePath("/blog");
  revalidatePath("/blog/page/[n]", "page");
}
