/* eslint-disable */
export async function mapMateTree(engine, fen) {
	const chain = engine.chain()
	const {bestmove, info} = await chain
	.init()
	.setoption('MultiPV', 50)
	.position(fen)
	.go({depth: 3})

	const candidatePositions = info
	.filter(inf => {
		return inf.depth < 2
	})

	console.log('bestmove', bestmove)
	console.log('infos', info.length)
	console.log('candidates', candidatePositions.length);
	await engine.quit()
}
