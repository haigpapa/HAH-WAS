
import { LocalNotifications } from '@capacitor/local-notifications';
import { useCallback } from 'react';

export const useNotifications = () => {
    
    const requestPermissions = useCallback(async () => {
        try {
            const { display } = await LocalNotifications.requestPermissions();
            return display === 'granted';
        } catch (e) {
            console.error("Notification permissions error", e);
            return false;
        }
    }, []);

    const scheduleDailyReminder = useCallback(async (streak: number) => {
        try {
            const permissions = await LocalNotifications.checkPermissions();
            if (permissions.display !== 'granted') {
                console.log("Notification permissions not granted, cannot schedule.");
                return;
            }

            // Cancel any existing notifications to avoid duplicates
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel(pending);
            }

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(8, 0, 0, 0); // Schedule for 8 AM tomorrow

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: " تحدي هَوَسْ اليومي بانتظارك!",
                        body: `لقد حان الوقت لكشف وهم جديد. سلسلتك الحالية: ${streak} 🔥`,
                        id: 1, // Use a static ID to allow cancellation/overwriting
                        schedule: { at: tomorrow },
                        sound: undefined,
                        attachments: undefined,
                        actionTypeId: "",
                        extra: null,
                    },
                ],
            });
            console.log("Daily reminder scheduled for tomorrow at 8 AM.");
        } catch(e) {
            console.error("Failed to schedule notification", e);
        }
    }, []);

    return { requestPermissions, scheduleDailyReminder };
};
