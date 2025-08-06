import SearchResults from '@/components/search/SearchResults';
import { Suspense } from 'react';
export const metadata = {
    title: 'Kết quả tìm kiếm',
};
export default function SearchPage() {

  return (
    <Suspense fallback={<div>Đang tải kết quả tìm kiếm...</div>}>
      <SearchResults />;
    </Suspense>
  )

}
