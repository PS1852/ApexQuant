const testApis = async () => {
  console.log("Testing Finnhub...");
  try {
    const res1 = await fetch("https://finnhub.io/api/v1/quote?symbol=AAPL&token=d6g2o99r01qqnmbqhvsgd6g2o99r01qqnmbqhvt0");
    const json1 = await res1.json();
    console.log("Finnhub:", res1.status, json1);
  } catch(e) { console.error("Finnhub Error:", e.message); }

  console.log("\Testing Yahoo via Corsproxy...");
  try {
    const url = 'https://corsproxy.io/?url=' + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=1d');
    const res2 = await fetch(url);
    if (!res2.ok) {
        console.log("Yahoo Corsproxy HTTP ERROR:", res2.status, await res2.text());
    } else {
        const json2 = await res2.json();
        console.log("Yahoo Corsproxy:", res2.status, json2?.chart?.result?.[0]?.meta?.regularMarketPrice ? "Success" : "No price data");
    }
  } catch(e) { console.error("Yahoo Error:", e.message); }

  console.log("\Testing Direct Yahoo Finance (for server comparison)...");
  try {
    const res3 = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=1d', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!res3.ok) {
        console.log("Direct Yahoo HTTP ERROR:", res3.status, await res3.text());
    } else {
        const json3 = await res3.json();
        console.log("Direct Yahoo:", res3.status, json3?.chart?.result?.[0]?.meta?.regularMarketPrice ? "Success" : "No price data");
    }
  } catch(e) { console.error("Direct Yahoo Error:", e.message); }
};

testApis();
