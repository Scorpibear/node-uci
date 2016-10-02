import Promise from 'bluebird'
import _ from 'lodash'

export async function evaluate(engine, moves, {reverse=true, depth=12} = {}) {
	const chain = engine.chain()
	await chain
	.init()
	.ucinewgame()
	.exec()
	//add startpos
	moves.unshift('')
	const evals = await Promise.mapSeries(moves, (move, i) => {
		const sliceIndex = reverse ? moves.length-i : i+1
		return chain
		.position('startpos', moves.slice(0, sliceIndex))
		.go({nodes: 3500000})
	})
	//annotations
	const annotations = evals
	//extract & normalize scores
	.map((moveEval, i) => {
		const info = _.findLast(moveEval.info, inf => inf.score)
		//change the sign of evals for black
		//because score comes relative to the side to play
		//we want to fix eval to white's perspective (+ white, - black)
		if( i % 2 === 1 ) {
			info.score.value *= -1
		}
		if( info.score.unit === 'mate' ) {
			info.score.value *= 1000
		}
		return _.pick(info, 'score', 'pv')
	})
	//associate evals with moves
	.map((moveEval, i, arr) => {
		if( i === 0 ) return
		const prev = arr[i-1]
		return {
			beforeEval: prev.score,
			afterEval: moveEval.score,
			move: moves[i],
			pv: prev.pv,
			delta: Math.abs(prev.score.value - moveEval.score.value),
		}
	})
	.filter((el, i) => i !== 0)
	.map((moveEval, i) => {
		const moveNum = (i+1)/2
		if( moveEval.delta > 300 ) {
			console.log('BLUNDER', moveNum);
			console.log(moveEval);
			console.log('-------');
		} else if( moveEval.delta > 150 ) {
			console.log('MISTAKE', moveNum);
			console.log(moveEval);
			console.log('-------');
		} else if( moveEval.delta > 50 ) {
			console.log('INACCURACY', moveNum);
			console.log(moveEval);
			console.log('-------');
		}
		return moveEval
	})
	//remove startpos
	// moves.shift()
	// const final = _.zipWith(moves, annotations, (m, e) => ({
	// 	...e,
	// 	move: m,
	// }))
	await engine.quit()
	return annotations
}
