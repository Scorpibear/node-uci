/* eslint-disable */
import _ from 'lodash'
import Promise from 'bluebird'
import {Chess} from 'chess.js'

import {Engine} from '../src'
import {evaluate} from '../src/Evaluator'
import {mapMateTree} from '../src/TacticFinder'
import {annotate} from '../src/annotate'

const enginePath = '/home/derp/stockfish-7-linux/Linux/stockfish'
// const enginePath = '/Users/derp/Downloads/stockfish-7-win/Windows/stockfish.exe'
// const enginePath = '/Users/bugrafirat/Downloads/stockfish-7-mac/Mac/stockfish-7-64'

const moves = ['e2e4', 'e7e5', 'b1c3', 'b8c6', 'd2d3', 'd7d6']
const game1 = `[Event "Casual game"]
[Site "https://lichess.org/YJW98QbR"]
[Date "2016.09.03"]
[White "bnhsy"]
[Black "Ingvar80"]
[Result "1-0"]
[WhiteElo "1500"]
[BlackElo "1529"]
[PlyCount "41"]
[Variant "Standard"]
[TimeControl "600+0"]
[ECO "B46"]
[Opening "Sicilian Defense: Paulsen Variation"]
[Termination "Normal"]
[Annotator "lichess.org"]

1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. Nc3 Nc6 { B46 Sicilian Defense: Paulsen Variation } 6. Bc4 Qf6?! { (0.17 → 0.85) Inaccuracy. Best move was Qc7. } (6... Qc7 7. O-O Nf6 8. Be2 Bd6 9. Nf3 O-O 10. h3 Ne5 11. Nd4 Nc6 12. Nf3 Ne5 13. Bg5) 7. Be3 Be7 8. O-O Bd6?? { (1.13 → 4.48) Blunder. Best move was b5. } (8... b5 9. Be2 Bb7 10. a3 Nxd4 11. Bxd4 e5 12. Be3 Qc6 13. Nd5 Nf6 14. Nxe7 Kxe7 15. f3) 9. f4? { (4.48 → 1.85) Mistake. Best move was Nxc6. } (9. Nxc6 Bc7 10. Nd4 b5 11. Bd3 Bb7 12. f4 Qh6 13. Qe2 Ne7 14. a4 b4 15. Na2 O-O) 9... h5?? { (1.85 → 5.22) Blunder. Best move was Bc5. } (9... Bc5 10. e5 Nxe5 11. fxe5 Qxe5 12. Qd2 Nf6 13. Be2 d5 14. Rad1 Qc7 15. Nb3 Bd6 16. Bf4) 10. e5? { (5.22 → 3.56) Mistake. Best move was Nxc6. } (10. Nxc6 Bc7 11. e5 Qg6 12. Nd4 Ne7 13. Bd3 f5 14. exf6 Qxf6 15. Ne4 Qh6 16. Qf3 Nd5) 10... Nxe5? { (3.56 → 5.20) Mistake. Best move was Bxe5. } (10... Bxe5 11. fxe5 Qxe5 12. Bf2 Nf6 13. Nxc6 bxc6 14. Bd4 Qc7 15. Bxf6 gxf6 16. Ne4 d5 17. Nxf6+) 11. fxe5 Qxe5 12. Bf4 Qc5?? { (4.53 → 9.43) Blunder. Best move was Qxf4. } (12... Qxf4 13. Rxf4) 13. Bxd6?? { (9.43 → 5.71) Blunder. Best move was Ne4. } (13. Ne4 Nf6 14. Nxc5 Bxc5 15. c3 d5 16. Bd3 Ne4 17. Qf3 Bd7 18. Be3 f6 19. Rae1 O-O-O) 13... Qxd6 14. Ne4? { (5.70 → 2.86) Mistake. Best move was Nxe6. } (14. Nxe6 Qb6+ 15. Qd4 Qxd4+ 16. Nxd4 Nf6 17. Rae1+ Kd8 18. Nf5 b5 19. Bxf7 Rb8 20. Nxg7 Rb6) 14... Qb4? { (2.86 → 4.64) Mistake. Best move was Qb6. } (14... Qb6 15. Qd3 Ne7 16. Bb3 f6 17. Qe3 O-O 18. Rae1 a5 19. c3 a4 20. Bc2 Qxb2 21. Qg3) 15. c3 Qxb2?? { (3.95 → 17.97) Blunder. Best move was Qb6. } (15... Qb6) 16. Nd6+ Ke7?! { (16.11 → Mate in 7) Checkmate is now unavoidable. Best move was Kd8. } (16... Kd8 17. Nxf7+ Ke7 18. Nxh8 Qb6 19. Qxh5 Nf6 20. Qg5 Kf8 21. Qg6 Ke7 22. Qg5 Kf8 23. Qg6) 17. Rxf7+ Kxd6 18. Nb5+ Kc5 19. Qd6+?! { (Mate in 2 → Mate in 4) Not the best checkmate sequence. Best move was Qd4+. } (19. Qd4+ Kc6 20. Qd6#) 19... Kxc4 20. Na3+?! { (Mate in 4 → Mate in 4) Not the best checkmate sequence. Best move was Rf4+. } (20. Rf4+ Kxb5 21. a4+ Ka5 22. Qc5+ b5 23. Qc7#) 20... Kxc3 21. Rf3# { Black is checkmated } 1-0`
const game2 = `[Event "Casual game"]
[Site "https://lichess.org/uVqYjDha"]
[Date "2016.10.13"]
[White "bnhsy"]
[Black "DanielSG"]
[Result "0-1"]
[WhiteElo "1824"]
[BlackElo "1807"]
[PlyCount "26"]
[Variant "Standard"]
[TimeControl "600+0"]
[ECO "C60"]
[Opening "Ruy Lopez"]
[Termination "Normal"]
[Annotator "lichess.org"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 { C60 Ruy Lopez } Qf6?! { (0.29 → 0.79) Inaccuracy. Best move was Nf6. } (3... Nf6 4. O-O Bc5 5. c3 O-O 6. d4 Bb6 7. Bg5 exd4 8. cxd4 h6 9. Bxf6 Qxf6 10. e5) 4. c3 a6 5. Ba4 Nge7 6. d4 d5? { (0.70 → 1.70) Mistake. Best move was exd4. } (6... exd4 7. cxd4 d5 8. exd5 Nxd5 9. O-O Bg4 10. Qe1+ Be7 11. Ne5 Bf5 12. Nc3 Nb4 13. d5) 7. dxe5?! { (1.70 → 0.79) Inaccuracy. Best move was exd5. } (7. exd5 Nxd5 8. dxe5 Qe6 9. O-O Nb6 10. Nd4 Qg4 11. Bxc6+ bxc6 12. Nxc6 Qd7 13. Na5 Be7) 7... Qe6 8. exd5 Nxd5?! { (1.00 → 1.75) Inaccuracy. Best move was Qxd5. } (8... Qxd5 9. O-O Be6 10. Qe2 Qc4 11. Qxc4 Bxc4 12. Re1 O-O-O 13. Nbd2 Bd5 14. c4 Be6 15. Ng5) 9. Bb3? { (1.75 → 0.45) Mistake. Best move was O-O. } (9. O-O Nb6 10. Nd4 Qg4 11. Bxc6+ bxc6 12. Nxc6 Qd7 13. Na5 Qxd1 14. Rxd1 Be6 15. a4 Be7) 9... Nce7? { (0.45 → 2.47) Mistake. Best move was Nxe5. } (9... Nxe5 10. O-O) 10. c4? { (2.47 → 1.47) Mistake. Best move was O-O. } (10. O-O Qc6 11. c4 Nb6 12. c5 Qxc5 13. Ng5 Be6 14. Bxe6 fxe6 15. Qf3 Nf5 16. Rd1 c6) 10... Nf6? { (1.47 → 3.52) Mistake. Best move was Nb4. } (10... Nb4 11. O-O Qg6 12. Ba4+ Nbc6 13. Nc3 Be6 14. b3 Rd8 15. Qe2 Qd3 16. Bb2 Qxe2 17. Nxe2) 11. O-O Ng4 12. Ng5? { (3.18 → 1.34) Mistake. Best move was Nc3. } (12. Nc3 Bd7 13. c5 Qg6 14. h3 O-O-O 15. Nh4 Qh5 16. e6 Bxe6 17. Bxe6+ fxe6 18. Qxg4 Qxg4) 12... Qxe5 13. c5?? { (1.52 → Mate in 1) Checkmate is now unavoidable. Best move was Nf3. } (13. Nf3 Qc5 14. h3 Nf6 15. Be3 Qh5 16. Bf4 Nc6 17. Nc3 Bc5 18. Na4 Ba7 19. Re1+ Be6) 13... Qxh2# { White is checkmated } 0-1`

// describe.skip('playground', () => {
describe.only('playground', () => {
	const engine = new Engine(enginePath)

	before(async () => {
		await engine.init()
	})

	after(async () => {
		await engine.quit()
	})

	it('playground', annotation).timeout(50000)

	async function mate() {
		// const fen = 'B7/K1B1p1Q1/5r2/7p/1P1kp1bR/3P3R/1P1NP3/2n5 w - - 0 1' //mate in 2 simplest case
		const fen = '8/6K1/1p1B1RB1/8/2Q5/2n1kP1N/3b4/4n3 w - - 0 1' //mate in 2
		// const fen = 'r1b3nr/1p1pkpp1/p2Np3/7p/2BN4/2P5/Pq4PP/R2Q1RK1 w - - 2 17'
		console.time('mapMateTree')
		const map = await mapMateTree(engine, fen)
		console.timeEnd('mapMateTree')
		console.log('results', JSON.stringify(map, null, 2));
	}

	async function annotation() {
		const game = new Chess()
		game.load_pgn(game2)
		let gmoves = game.history({verbose: true})
		.map(move => {
			let str = `${move.from}${move.to}`
			if( move.promotion ) str += move.promotion
			return str
		})
		const wat = await annotate(engine, gmoves, {reverse:true, depth:12})
		// console.log(wat);
		wat.map((hm, i) => {
			console.log('---');
			// console.log((i+2)/2, hm);
			console.log(hm);
		})
	}
})
