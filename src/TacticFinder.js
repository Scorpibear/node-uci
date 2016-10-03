/* eslint-disable */
export async function mapMateTree(engine, fen) {
	const chain = engine.chain()
	const {bestmove, info} = await chain
	.init()
	.setoption('MultiPV', 50)
	.position(fen)
	.go({depth: 14})

	console.log(bestmove)
	console.log(info.length)
}
