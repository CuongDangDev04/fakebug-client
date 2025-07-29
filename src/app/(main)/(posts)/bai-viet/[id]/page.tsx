import PostDetail from "@/components/posts/PostDetail";
interface PostPageProps {
    params: {
        id: string;
    };
}
export default async function PostPage({ params }: PostPageProps) {
    const postId = Number( params.id);

    return (
        <div className="w-full md:w-2/3 mx-auto py-6">
            <PostDetail postId={postId} />
        </div>
    );
}
