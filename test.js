const cheerio = require('cheerio');

async function test() {
  try {
    const r = await fetch('https://www.symbios.pk/search.php?q=samsung');
    const html = await r.text();
    const $ = cheerio.load(html);
    const links = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href) links.push(href);
    });
    console.log('Symbios Links:', links.filter(l => !l.includes('search') && !l.includes('category') && l.includes('.html')).slice(0, 5));
  } catch(e) {}
}

test();
