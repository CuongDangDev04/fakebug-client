"use client";
import React from "react";
import Link from "next/link";

interface ConversationItemSearchProps {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  onClick?: () => void;
}

export default function ConversationItemSearch({ user, onClick }: ConversationItemSearchProps) {
  const fullName = `${user.first_name} ${user.last_name}`.trim();

  return (
    <Link href={`/tin-nhan/${user.id}`} passHref>
      <div
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-dark-hover cursor-pointer"
      >
        <div className="relative">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border bg-gray-300 dark:bg-dark-border flex items-center justify-center text-sm text-white">
              {fullName.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-gray-900 dark:text-dark-text-primary truncate">
            {fullName}
          </div>
          <div className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">
            {/* Bạn có thể thêm info phụ như username, email nếu muốn */}
          </div>
        </div>
      </div>
    </Link>
  );
}
