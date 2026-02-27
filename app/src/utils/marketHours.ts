/**
 * Market hours awareness for NSE and NYSE
 */

function getTimeInZone(timeZone: string): { hour: number; minute: number; day: string } {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        hour12: false,
    });

    const parts = formatter.formatToParts(now);
    let h = 0, m = 0, dayString = '';

    for (const part of parts) {
        if (part.type === 'hour') h = parseInt(part.value, 10);
        if (part.type === 'minute') m = parseInt(part.value, 10);
        if (part.type === 'weekday') dayString = part.value;
    }

    // Intl returns 24 for midnight with hour12:false — normalise to 0
    if (h === 24) h = 0;

    return { hour: h, minute: m, day: dayString };
}

export function isNSEOpen(): boolean {
    const { hour, minute, day } = getTimeInZone('Asia/Kolkata');

    if (day === 'Sat' || day === 'Sun') return false;

    const mins = hour * 60 + minute;
    // NSE: 9:15 AM – 3:30 PM IST → 555 – 930 mins
    return mins >= 555 && mins <= 930;
}

export function isNYSEOpen(): boolean {
    const { hour, minute, day } = getTimeInZone('America/New_York');

    if (day === 'Sat' || day === 'Sun') return false;

    const mins = hour * 60 + minute;
    // NYSE: 9:30 AM – 4:00 PM ET → 570 – 960 mins
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
