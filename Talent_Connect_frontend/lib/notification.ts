import { toast } from 'react-hot-toast';

export type NotificationStatus = 'success' | 'error' | 'loading' | 'info';

/**
 * Global notification helper
 * @param message The message to display
 * @param status The status of the notification (success, error, loading, info)
 */
export const globalNotify = (message: string, status: NotificationStatus = 'info') => {
    const commonStyle = {
        borderRadius: '16px',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '700',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        minWidth: '350px',
        letterSpacing: '-0.01em',
    };

    switch (status) {
        case 'success':
            toast.success(message, {
                style: {
                    ...commonStyle,
                    background: '#10b981',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10b981',
                },
                duration: 4000,
            });
            break;
        case 'error':
            toast.error(message, {
                style: {
                    ...commonStyle,
                    background: '#ef4444',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
                duration: 5000,
            });
            break;
        case 'loading':
            toast.loading(message, {
                style: {
                    ...commonStyle,
                    background: '#fff',
                    color: '#1e293b',
                },
            });
            break;
        default:
            toast(message, {
                style: {
                    ...commonStyle,
                    background: '#334155',
                    color: '#fff',
                },
                duration: 4000,
            });
    }
};
