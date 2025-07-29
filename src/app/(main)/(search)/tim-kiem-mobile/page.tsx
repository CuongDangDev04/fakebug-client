import SearchMobile from "@/components/search/SearchMobile";
import { Suspense } from "react";

export default function SearchPageMobile() {
    return (
        <>
            <Suspense fallback={<div>Đang tải kết quả tìm kiếm...</div>}>
                <SearchMobile />
            </Suspense>
        </>
    )
}