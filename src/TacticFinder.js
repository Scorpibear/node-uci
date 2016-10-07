/* eslint-disable */
import _ from 'lodash'
import Promise from 'bluebird'

export async function mapMateTree(engine, fen, moves = []) {
	const depth = 11
	const chain = engine.chain()
	const {bestmove, info} = await chain
	.setoption('MultiPV', 50)
	.position(fen, moves)
	.go({depth})

	// console.log('bitt');

	const candidatePositions = _(info)
	.filter(inf => {
		return inf.depth > depth-1 && _.get(inf, 'score.unit') === 'mate'
	})
	.groupBy('multipv')
	.map(group => _.last(group))
	.sortBy('score.value')
	.value()

	if( ! candidatePositions.length ) return {solution: true};
	const threshold = candidatePositions[0].score.value// + 1

	const fil = candidatePositions.filter(pos => pos.score.value <= threshold)

	// console.log('moves', moves.join(' '));
	// console.log('bestmove', bestmove)
	// console.log('infos', info.length)
	// console.log('candidates', fil);
	// console.log('------------------------');
	// console.log('------------------------');
	// console.log('------------------------');

	return Promise.mapSeries(fil, f => {
		const nextMoves = moves.concat(f.pv.split(' ')[0])
		return mapMateTree(engine, fen, nextMoves)
		.then(tree => {
			return {
				moves: nextMoves,
				tree
			}
		})
	})

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
