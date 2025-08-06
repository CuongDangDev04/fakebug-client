import BlockedUserList from "@/components/profile/BlockedUserList";
export const metadata = {
    title: 'Danh sách đã chặn',
};
export default function BlockedUserPage() {
    return (
        <>
            <BlockedUserList />
        </>
    )
}