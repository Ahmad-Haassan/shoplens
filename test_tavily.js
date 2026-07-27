async function test() {
  const r = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      api_key: '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',
      query: '"Samsung Galaxy S24" price (site:daraz.pk OR site:ishopping.pk OR site:symbios.pk OR site:telemart.pk OR site:telemart.com.pk OR site:khaadi.com)',
      search_depth: 'basic'
    })
  });
  const json = await r.json();
  console.log('Results:', json.results ? json.results.length : 0);
  console.log(json);
}
test();
