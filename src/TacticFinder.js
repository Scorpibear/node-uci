/* eslint-disable */
import _ from 'lodash'
import Promise from 'bluebird'

export async function mapMateTree(engine, fen) {
	const ress = {}
	const moves = [await getMatingMoves(engine, fen)]
	;debugger

	while( moves.length ) {
		console.log('---------');
		console.log('analysing');
		console.log('moves', moves[0].join(' '));
		console.log('isWhite', isWhite(fen, moves[0].length));
		const curMove = moves[0]
		const result = (await getMatingMoves(engine, fen, curMove))
		if( result.solution ) {
			console.log('SOLUTION');
			ress[moves[0].join(' ')] = true
			moves.shift()
			continue;
		}
		const nextMoves = result.map(e => [...curMove, e])
		;debugger
		moves.push(...nextMoves)
		moves.shift()
		console.log('---------');
		console.log();
	}

	return ress
}

function isWhite(fen, numMoves) {
	if( !/w/.test(fen) ) {
		return numMoves % 2 === 0
	} else {
		return numMoves % 2 === 1
	}
}

async function getMatingMoves(engine, fen, moves = [], threshold) {
	const depth = 11
	const {bestmove, info} = await engine
	.chain()
	.setoption('MultiPV', 50)
	.position(fen, moves)
	.go({depth})

	console.log('  bestmove', bestmove);
	console.log('  infos', info.length);

	if( bestmove === '(none)' ) {
		return {solution: true}
	}

	const candidateMoves = _(info)
	.filter(inf => {
		return inf.depth > depth-1 && _.get(inf, 'score.unit') === 'mate'
	})
	.groupBy('multipv')
	.map(group => _.last(group))
	.sortBy('score.value')
	.value()

	console.log('  sorted candidates', _.take(candidateMoves, 3).map(c => ({pv: c.pv, score: c.score})));

	if( ! candidateMoves.length ) {
		return []
	}

	if( ! threshold )
		threshold = _.minBy(candidateMoves, 'score.value').score.value

	console.log('  threshold', threshold);

	const filtered = candidateMoves
	.filter(c => {
		if( isWhite(fen, moves.length) ) {
			return c.score.value <= threshold
		} else {
			return c.score.value >= threshold * -1
		}
	})
	.map(c => c.pv.split(' ')[0])
	;debugger

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
