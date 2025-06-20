import { notificationService } from "@/services/notificationService";
import { useEffect } from "react"

export default function TotalUnreadNoti(){

    useEffect(()=> {
        const fetchUnreadNoti = async( ) => {
            const res = await notificationService.getUnreadNotification()
            console.log('res noti', res)
        }
        fetchUnreadNoti();
    },[])
    return (
        <>
        </>
    )
}