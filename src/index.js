const { simpleSitemapAndIndex } = require("sitemap");
const path = require("path");

async function fetchCharacters({ cursor = 1, limit = 1000 }) {
	const res = await fetch("https://indexer.crossbell.io/v1/graphql", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: `{"query":"{ characters(cursor: { characterId: ${cursor} }, take: ${limit}) { handle } }"}`,
	}).then((res) => res.json());

	return {
		characters: res.data.characters,
		cursor: cursor + limit - 1,
	};
}

async function main() {
	const limit = 1000;
	let cursor = 1;
	let handleUrls = [];
	while (true) {
		const res = await fetchCharacters({ cursor, limit });
		handleUrls = handleUrls.concat(res.characters.map((c) => `/@${c.handle}`));
		cursor = res.cursor;
		if (res.characters.length < limit) {
			break;
		}
	}

	simpleSitemapAndIndex({
		hostname: "https://crossbell.io",
		destinationDir: path.resolve(__dirname, "..", "sitemaps"),
		sourceData: handleUrls,
		publicBasePath: "/sitemaps",
		gzip: false,
	});
}

main().catch((e) => console.error(e));
