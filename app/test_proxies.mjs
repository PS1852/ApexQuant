const testApis = async () => {
    try {
        const url = 'https://cors.eu.org/https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=1d';
        console.log("Testing:", url);
        const res = await fetch(url);
        if (!res.ok) {
            console.log("ERROR:", res.status);
        } else {
            const data = await res.json();
            console.log("SUCCESS:", data.chart.result[0].meta.symbol);
        }
    } catch(e) {
        console.error("FAIL:", e.message);
    }
}
testApis();
