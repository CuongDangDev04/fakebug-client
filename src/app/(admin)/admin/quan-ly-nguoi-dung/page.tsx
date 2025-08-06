import AdminUserManager from "@/components/admin/AdminUserManager";
export const metadata = {
    title: 'Quản lí người dùng',
};
export default function UserManagerPage(){
    return(
        <>
        <AdminUserManager/>
        </>
    )
}