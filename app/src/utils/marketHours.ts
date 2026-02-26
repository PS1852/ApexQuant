/**
 * Market hours awareness for NSE and NYSE
 */

export function isNSEOpen(): boolean {
    const now = new Date();
    const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const h = ist.getHours();
    const m = ist.getMinutes();
    const day = ist.getDay();
    if (day === 0 || day === 6) return false; // Weekend
    const mins = h * 60 + m;
    return mins >= 555 && mins <= 930; // 9:15 AM to 3:30 PM IST
}

export function isNYSEOpen(): boolean {
    const now = new Date();
    const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const h = est.getHours();
    const m = est.getMinutes();
    const day = est.getDay();
    if (day === 0 || day === 6) return false; // Weekend
    const mins = h * 60 + m;
    return mins >= 570 && mins <= 960; // 9:30 AM to 4:00 PM EST
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
