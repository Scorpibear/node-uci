import _ from 'lodash'
import Promise from 'bluebird'

function pairwise(arr, fn) {
	const result = []
	for( let i=0; i<arr.length-1; i++) {
		result.push(fn(arr[i], arr[i+1], i))
	}
	return result
}

export async function blundercheck(engine, moves, {reverse=true} = {}, goOptions) {
	await engine.ucinewgame()
	const chain = engine.chain()
	const positions = _.clone(moves)
	//add starting position (empty move)
	positions.unshift('')
	//collect engine output for moves
	let evals = await Promise.mapSeries(positions, (pos, i) => {
		const index = reverse ? positions.length-i : i+1
		return chain
		.position('startpos', positions.slice(0, index))
		.go(goOptions)
	})
	//preparing the annotations
	const annotations = _(evals)
	//reverse array if required
	.thru(arr => reverse ? arr.reverse() : arr)
	//normalize scores
	.map(normalizeEval)
	//pairwise (sliding window 2) loop through
	//and assign move info
	.thru(_.partialRight(pairwise, (prev, cur, i) => {
		return {
			before: prev.score,
			after: cur.score,
			pv: prev.pv,
			ply: i+1,
			move: positions[i+1],
			delta: Math.abs(prev.score.value - cur.score.value),
			annotations: []
		}
	}))
	.map(mateAnnotations)
	.map(evalAnnotations)
	.value()
	return annotations
}

//change the sign of evals for black
//because score is relative to the side to play
//we want to fix the eval to white's perspective (+ white, - black)
function normalizeEval(evall, i) {
	//last info line containing score
	const info = _(evall.info)
	.findLast(e => e.score)
	info.score.relative = info.score.value
	//if black
	if( i % 2 === 1 ) {
		info.score.value *= -1
	}
	return _.pick(info, 'score', 'pv')
}

function mateAnnotations(pos) {
	const hasMateBefore = pos.before.unit === 'mate'
	const hasMateAfter = pos.after.unit === 'mate'
	//bitwise xor to check before/after evals have the same sign
	const sameSign = (pos.before.value >= 0) ^ (pos.after.value < 0)
	//after.relative is in opponents perspective!
	//winning = opponent losing
	const isWinning = pos.after.relative < 0
	const isLosing = pos.after.relative > 0
	//gone from non-mate to mating position
	if( ! hasMateBefore && hasMateAfter ) {
		pos.annotations.push('WALKED_INTO_MATE')
	}
	//missed forced mate
	if( hasMateBefore && ! hasMateAfter ) {
		pos.annotations.push('MISSED_MATE')
	}
	//mate opportunity for the same side
	if( hasMateBefore && hasMateAfter && sameSign ) {
		//longer mate
		if( pos.before.value <= pos.after.value && isWinning ) {
			pos.annotations.push('LONGER_MATE')
		}
		//not the best defense
		if( pos.before.value > pos.after.value && isLosing ) {
			pos.annotations.push('NOT_BEST_DEFENSE')
		}
	}
	return pos
}

function evalAnnotations(pos) {
	if( pos.delta > 300 ) {
		pos.annotations.push('BLUNDER')
	} else if( pos.delta > 150 ) {
		pos.annotations.push('MISTAKE')
	} else if( pos.delta > 50 ) {
		pos.annotations.push('INACCURACY')
	}
	return pos
}
