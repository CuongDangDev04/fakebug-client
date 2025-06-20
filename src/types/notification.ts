export default interface Notification {
    id: number,
    userId: number,
    message: string,
    url: string,
    avt: string,
    isRead: boolean,
    createdAt: string;
}
export type NotificationToastData = {
    message: string;
    url: string;
    avt: string;
    createdAt: string;
};
// export interface NotificationToastProps {
//     avatarUrl: string;
//     senderName: string;
//     message: string;
//     time?: string;
//     link?: string;
// };