async function test() {
  const r = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      api_key: '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',
      query: 'Samsung Galaxy S24 price',
      include_domains: ['daraz.pk', 'ishopping.pk', 'symbios.pk', 'telemart.pk', 'khaadi.com'],
      search_depth: 'basic'
    })
  });
  const json = await r.json();
  console.log(json);
}
test();
