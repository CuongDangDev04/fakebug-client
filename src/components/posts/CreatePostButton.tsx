'use client';

import { useState } from 'react';
import Modal from './ModalCreat';
import CreatePost from './CreatePost';

export default function CreatePostButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer bg-white dark:bg-dark-card rounded-xl shadow-sm m-auto mb-2 p-3 w-full md:w-4/6  text-gray-500 dark:text-gray-300"
      >
        Bạn đang nghĩ gì thế?
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <CreatePost onPostSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
