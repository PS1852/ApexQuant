/**
 * Market hours awareness for NSE and NYSE
 */

export function isNSEOpen(): boolean {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    let h = 0, m = 0, dayString = '';

    for (const part of parts) {
        if (part.type === 'hour') h = parseInt(part.value, 10);
        if (part.type === 'minute') m = parseInt(part.value, 10);
        if (part.type === 'weekday') dayString = part.value;
    }

    if (dayString === 'Sun' || dayString === 'Sat') return false; // Weekend

    const mins = h * 60 + m;
    // 9:15 AM to 3:30 PM IST is 555 mins to 930 mins
    return mins >= 555 && mins <= 930;
}

export function isNYSEOpen(): boolean {
    const now = new Date();

    // Parse the actual New York time
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    let h = 0, m = 0, dayString = '';

    for (const part of parts) {
        if (part.type === 'hour') h = parseInt(part.value, 10);
        if (part.type === 'minute') m = parseInt(part.value, 10);
        if (part.type === 'weekday') dayString = part.value;
    }

    if (dayString === 'Sun' || dayString === 'Sat') return false; // Weekend

    const mins = h * 60 + m;
    // 9:30 AM to 4:00 PM EST is 570 mins to 960 mins
    return mins >= 570 && mins <= 960;
}

export function isMarketOpen(market: 'IN' | 'US'): boolean {
    return market === 'IN' ? isNSEOpen() : isNYSEOpen();
}

export function getMarketStatus(market: 'IN' | 'US'): { isOpen: boolean; label: string } {
    const open = isMarketOpen(market);
    return {
        isOpen: open,
        label: open ? 'Market Open' : 'Market Closed',
    };
}

export function getPollingInterval(market: 'IN' | 'US'): number {
    // Poll every 10s when open, every 60s when closed
    return isMarketOpen(market) ? 10000 : 60000;
}
