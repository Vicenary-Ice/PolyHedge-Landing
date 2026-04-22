
async function testSearch() {
  const query = "Strait of Hormuz traffic returns to normal by end of April?";
  const searchUrl = `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=10&order=volume&dir=desc&term=${encodeURIComponent(query)}`;
  
  console.log(`Searching with: ${searchUrl}`);
  
  try {
    const res = await fetch(searchUrl);
    const data = await res.json();
    console.log(`Full Query Results: ${data.length}`);
    if (data.length > 0) {
      console.log(`Top result: ${data[0].question}`);
    } else {
      // Try fallback
      const fallbackQuery = "Strait of Hormuz";
      const fallbackUrl = `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=10&order=volume&dir=desc&term=${encodeURIComponent(fallbackQuery)}`;
      console.log(`Trying fallback: ${fallbackUrl}`);
      const res2 = await fetch(fallbackUrl);
      const data2 = await res2.json();
      console.log(`Fallback Results: ${data2.length}`);
      if (data2.length > 0) {
        console.log(`Top fallback result: ${data2[0].question}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

testSearch();
