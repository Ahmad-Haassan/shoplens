import * as fs from 'fs';
import * as path from 'path';

async function testSerp() {
  const apiKey = '38117e817da16d8c72b3b46c1c38e71d66b93eab01d6e0a825d705fa20f5ca6e';
  const query = `"iphone" price pakistan`;
  
  console.log("Testing API KEY", apiKey);
  
  try {
    const response = await fetch(`https://serpapi.com/search?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}&gl=pk&hl=en&num=15`);
    console.log("Status:", response.status);
    
    if (!response.ok) {
      console.log('Error', await response.text());
      return;
    }

    const data = await response.json();
    console.log("Organic Results length:", data.organic_results?.length);
    if (data.organic_results && data.organic_results.length > 0) {
        console.log("First result:", data.organic_results[0].title, data.organic_results[0].link);
    }
  } catch(e) {
    console.error("Exception:", e);
  }
}

testSerp();
