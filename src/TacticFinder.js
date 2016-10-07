/* eslint-disable */
import _ from 'lodash'

export async function mapMateTree(engine, fen) {
	const depth = 11
	const chain = engine.chain()
	const {bestmove, info} = await chain
	.init()
	.setoption('MultiPV', 50)
	.position(fen)
	.go({depth})

	console.log('bitt');

	const candidatePositions = _(info)
	.filter(inf => {
		return inf.depth > depth-1 && _.get(inf, 'score.unit') === 'mate'
	})
	.groupBy('multipv')
	.map(group => _.last(group))
	.sortBy('score.value')
	.value()

	if( ! candidatePositions.length ) return;
	const threshold = candidatePositions[0].score.value + 1

	const fil = candidatePositions.filter(pos => pos.score.value <= threshold)

	console.log('bestmove', bestmove)
	console.log('infos', info.length)
	console.log('candidates', fil);

	// let res = await chain
	// .position(fen, [candidatePositions[0].pv.split(' ')[0]])
	// .go({depth})
	//
	// console.log('bitt');
	//
	// const candidatePositions1 = _(res.info)
	// .filter(inf => {
	// 	return inf.depth > depth-1 && _.get(inf, 'score.unit') === 'mate'
	// })
	// .groupBy('multipv')
	// .map(group => _.last(group))
	// .sortBy('score.value')
	// .value()
	//
	// console.log('bestmove', res.bestmove)
	// console.log('infos', res.info.length)
	// console.log('candidates', candidatePositions1);



	await engine.quit()
}
