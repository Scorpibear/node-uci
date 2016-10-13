import _ from 'lodash'
import Promise from 'bluebird'

function pairwise(arr, fn) {
	const result = []
	for( let i=0; i<arr.length-1; i++) {
		result.push(fn(arr[i], arr[i+1], i))
	}
	return result
}

export async function annotate(engine, moves, {reverse=true, depth=14} = {}) {
	await engine.ucinewgame()
	const chain = engine.chain()
	const positions = _.clone(moves)
	//add starting position (empty move)
	positions.unshift('')
	let evals = await Promise.mapSeries(positions, (pos, i) => {
		const index = reverse ? positions.length-i : i+1
		return chain
		.position('startpos', positions.slice(0, index))
		.go({depth})
	})
	const annotations = _(evals)
	//reverse array if required
	.thru(arr => reverse ? arr.reverse() : arr)
	//change the sign of evals for black
	//because score is relative to the side to play
	//we want to fix the eval to white's perspective (+ white, - black)
	.map((evall, i) => {
		//last info line containing score
		const info = _(evall.info)
		.findLast(e => e.score)
		//if black
		if( i % 2 === 1 ) {
			info.score.value *= -1
		}
		return _.pick(info, 'score', 'pv')
	})
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
	.map(pos => {
		if( pos.before.unit === 'cp' && pos.after.unit === 'mate' ) {
			pos.annotations.push('walked into mate')
		}

		if( pos.before.unit === 'mate' && pos.after.unit === 'cp' ) {
			pos.annotations.push('missed mate')
		}
		return pos
	})
	.map(pos => {
		if( pos.delta > 300 ) {
			pos.annotations.push('blunder')
		} else if( pos.delta > 150 ) {
			pos.annotations.push('mistake')
		} else if( pos.delta > 50 ) {
			pos.annotations.push('inaccuracy')
		}
		return pos
	})
	.value()
	return annotations
}
