import SearchMobile from "@/components/search/SearchMobile";
import { Suspense } from "react";
export const metadata = {
    title: 'Tìm kiếm',
};
export default function SearchPageMobile() {
    return (
        <>
            <Suspense fallback={<div>Đang tải kết quả tìm kiếm...</div>}>
                <SearchMobile />
            </Suspense>
        </>
    )
}