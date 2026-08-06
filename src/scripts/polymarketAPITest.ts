
async function main(): Promise<void> {
  const response = await fetch("https://gamma-api.polymarket.com/markets?limit=5");
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })

