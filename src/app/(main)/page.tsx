import CreatePostButton from "@/components/posts/CreatePostButton";
import PostList from "@/components/posts/PostList";
export const metadata = {
    title: 'Trang chủ',
};
export default function HomePage() {
  return (
    <div className="">
      <CreatePostButton />
      <PostList/>
    </div>
  );
}
