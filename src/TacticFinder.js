/* eslint-disable */
import _ from 'lodash'
import Promise from 'bluebird'

export async function mapMateTree(engine, fen) {
	const ress = {}
	const moves = [await getMatingMoves(engine, fen)]
	;debugger

	while( moves.length ) {
		const nextMoves = (await getMatingMoves(engine, fen, moves[0])).map(e => [e])
		;debugger
		moves.push(...nextMoves)
		moves.shift()
	}
}

async function getMatingMoves(engine, fen, moves = [], threshold) {
	;debugger
	const depth = 11
	const {bestmove, info} = await engine
	.chain()
	.setoption('MultiPV', 50)
	.position(fen, moves)
	.go({depth})

	const candidateMoves = _(info)
	.filter(inf => {
		return inf.depth > depth-1 && _.get(inf, 'score.unit') === 'mate'
	})
	.groupBy('multipv')
	.map(group => _.last(group))
	.sortBy('score.value')
	.value()

	if( ! threshold )
		threshold = _.minBy(candidateMoves, 'score.value').score.value

	const filtered = candidateMoves
	.filter(c => c.score.value <= threshold)
	.map(c => c.pv.split(' ')[0])

	return filtered
}

export async function fa(engine, fen, moves = []) {
	const depth = 11
	const chain = engine.chain()
	const {bestmove, info} = await chain
	.setoption('MultiPV', 50)
	.position(fen, moves)
	.go({depth})

	const candidatePositions = _(info)
	.filter(inf => {
		return inf.depth > depth-1 && _.get(inf, 'score.unit') === 'mate'
	})
	.groupBy('multipv')
	.map(group => _.last(group))
	.sortBy('score.value')
	.value()

	if( ! candidatePositions.length ) return 'end';
	const threshold = candidatePositions[0].score.value// + 1

	const fil = candidatePositions.filter(pos => pos.score.value <= threshold)

	const keko = await Promise.mapSeries(fil, async f => {
		const nextMoves = moves.concat(f.pv.split(' ')[0])
		const tree = await mapMateTree(engine, fen, nextMoves)
		return {
			[_.last(nextMoves)]: tree
		}
	})

	return keko
}
