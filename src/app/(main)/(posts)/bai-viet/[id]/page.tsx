import PostDetail from "@/components/posts/PostDetail";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;  
  const postId = Number(id);

  return (
    <div className="w-full md:w-2/3 mx-auto py-6">
      <PostDetail postId={postId} />
    </div>
  );
}
