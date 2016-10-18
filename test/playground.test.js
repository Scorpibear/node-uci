/* eslint-disable */
import _ from 'lodash'
import Promise from 'bluebird'
import {Chess} from 'chess.js'

import {Engine} from '../src'
import {mapMateTree} from '../src/TacticFinder'
import {blundercheck} from '../src/blundercheck'

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
[Site "https://lichess.org/DW2gu00D"]
[Date "2016.10.14"]
[White "bnhsy"]
[Black "b2das"]
[Result "1-0"]
[WhiteElo "1824"]
[BlackElo "1500"]
[PlyCount "73"]
[Variant "Standard"]
[TimeControl "600+0"]
[ECO "C60"]
[Opening "Ruy Lopez: Vinogradov Variation"]
[Termination "Normal"]
[Annotator "lichess.org"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 Qe7 { C60 Ruy Lopez: Vinogradov Variation } 4. O-O a6 5. Ba4 b5 6. Bb3 Bb7 7. c3 Na5 8. Bc2 Nc4 9. d3 Nd6?! { (1.25 → 2.01) Inaccuracy. Best move was Nb6. } (9... Nb6 10. a4 d6 11. axb5 axb5 12. Rxa8+ Bxa8 13. Na3 c6 14. Be3 Nd7 15. Bd2 Nb6 16. c4) 10. Re1 O-O-O?! { (1.83 → 2.43) Inaccuracy. Best move was Nc8. } (10... Nc8 11. Nbd2 Nb6 12. a4 bxa4 13. Bxa4 Nf6 14. Bc2 a5 15. d4 d6 16. b3 h6 17. Bb2) 11. d4 exd4 12. Nxd4 f6 13. Bf4?! { (2.41 → 1.49) Inaccuracy. Best move was a4. } (13. a4 Qe5 14. axb5 axb5 15. Nd2 Ne7 16. N2f3 Qc5 17. Nb3 Qh5 18. Na5 Nc6 19. Nxb7 Kxb7) 13... Nc4?! { (1.49 → 2.09) Inaccuracy. Best move was g5. } (13... g5 14. Bxd6 Qxd6 15. b4 h5 16. a4 c6 17. Nd2 Qc7 18. N2b3 Bd6 19. h3 Ne7 20. axb5) 14. b3 Ne5 15. Nf5?! { (2.00 → 1.19) Inaccuracy. Best move was b4. } (15. b4) 15... Qe6 16. a4 Bc5?! { (1.27 → 2.23) Inaccuracy. Best move was b4. } (16... b4 17. cxb4 Bxb4 18. Bd2 Bxd2 19. Nxd2 g6 20. Ne3 h5 21. Ndc4 Ne7 22. Qd2 h4 23. h3) 17. Nxg7?! { (2.23 → 1.68) Inaccuracy. Best move was axb5. } (17. axb5 axb5 18. b4 Bb6 19. Nxg7 Qg4 20. Qxg4 Nxg4 21. Re2 Ne7 22. Nh5 d5 23. h3 Nxf2) 17... Qb6 18. Be3?! { (1.64 → 0.93) Inaccuracy. Best move was Rf1. } (18. Rf1 b4 19. a5 Qc6 20. cxb4 Bxb4 21. Ra4 Bc5 22. b4 Ba7 23. Nd2 Ne7 24. Bb3 d5) 18... Bxe3 19. Rxe3 Nh6 20. axb5? { (1.55 → 0.35) Mistake. Best move was Rg3. } (20. Rg3 d5 21. Qh5 Nhf7 22. a5 Qc6 23. Nf5 Kb8 24. Nd2 Qe8 25. Re1 Ng6 26. b4 Ng5) 20... Nhg4 21. Re2 Qxb5? { (0.45 → 2.47) Mistake. Best move was Rhg8. } (21... Rhg8 22. bxa6 Ba8 23. Qd4 c5 24. Qd2 Rxg7 25. Qf4 c4 26. Nd2 Rdg8 27. g3 Rg5 28. Nxc4) 22. c4?! { (2.47 → 1.60) Inaccuracy. Best move was Nf5. } (22. Nf5 Ng6 23. Bd3 Qb6 24. Rea2 N6e5 25. Bxa6 Bxa6 26. Ne7+ Kb8 27. Nd5 Qa7 28. Rxa6 Qxf2+) 22... Qc5 23. Nc3?? { (1.62 → -1.43) Blunder. Best move was b4. } (23. b4 Qxc4 24. Nd2 Qc3 25. h3 Nh6 26. Re3 Qd4 27. Ra4 Qd6 28. Nh5 Nhf7 29. Qe2 Qb6) 23... Rhg8 24. Nf5 Qf8?? { (-0.95 → 3.88) Blunder. Best move was Nf3+. } (24... Nf3+ 25. Kh1 Qe5 26. g3 Qxc3 27. h3 Ng5 28. hxg4 Qf3+ 29. Kh2 Rde8 30. Ra5 Kb8 31. Nh4) 25. f4? { (3.88 → 2.42) Mistake. Best move was Nd5. } (25. Nd5 Nf3+ 26. Kh1 Qc5 27. Nde7+ Kb8 28. gxf3 Nxf2+ 29. Rxf2 Qxf2 30. Nxg8 Rxg8 31. Ng3 f5) 25... Ng6? { (2.42 → 3.53) Mistake. Best move was Qc5+. } (25... Qc5+ 26. Qd4 Qxd4+ 27. Nxd4 Ng6 28. g3 h5 29. Nf5 Rde8 30. h3 Nxf4 31. gxf4 Ne3+ 32. Kf2) 26. g3?? { (3.53 → -0.39) Blunder. Best move was Qd2. } (26. Qd2 Ne7 27. Nxe7+ Qxe7 28. Nd5 Qe6 29. Qa5 Bxd5 30. exd5 Qb6+ 31. Qxb6 cxb6 32. Rxa6 Kb7) 26... Nxh2?? { (-0.39 → 5.11) Blunder. Best move was Nxf4. } (26... Nxf4 27. Nd5 Nxe2+ 28. Qxe2 Re8 29. b4 Rg5 30. Qf1 Kb8 31. Rb1 Re6 32. Bd3 Re8 33. Bc2) 27. Kxh2 h5 28. Qd4 h4 29. Nxh4?? { (5.26 → -1.88) Blunder. Best move was Nd5. } (29. Nd5 hxg3+ 30. Kg1 Kb8 31. Bd1 Re8 32. Nxf6 Rd8 33. Nxg8 Qxg8 34. Qe3 Qe6 35. Ra4 Rg8) 29... Nxh4 30. gxh4 Qh6 31. Qf2?? { (-0.38 → -3.91) Blunder. Best move was Kh3. } (31. Kh3 Qxf4 32. Rg1 Qf3+ 33. Kh2 Qf4+ 34. Kh3 Qf3+ 35. Kh2 Rxg1 36. Qxg1 Qxc3 37. Qg3 Qa1) 31... Rh8?? { (-3.91 → 4.63) Blunder. Best move was Rg4. } (31... Rg4 32. Rg1 Rxh4+ 33. Kg2 Rg4+ 34. Kf1 Rxf4 35. Nd1 Re8 36. Ke1 Rxf2 37. Nxf2 Qc1+ 38. Bd1) 32. Kh3?! { (4.63 → 3.83) Inaccuracy. Best move was Re3. } (32. Re3 Qxh4+ 33. Qxh4 Rxh4+ 34. Rh3 Rxh3+ 35. Kxh3 Rh8+ 36. Kg3 Rg8+ 37. Kf3 Rh8 38. Nd5 Rh6) 32... Rdg8 33. Nd5?? { (4.03 → -1.21) Blunder. Best move was Ree1. } (33. Ree1 f5 34. Rg1 fxe4 35. Rxg8+ Rxg8 36. Rg1 Rh8 37. Rg4 Re8 38. Qe3 Qb6 39. Qxb6 cxb6) 33... Bxd5 34. exd5? { (-0.17 → -2.85) Mistake. Best move was Ree1. } (34. Ree1 f5 35. Rg1 Bc6 36. Rae1 Rxg1 37. Rxg1 fxe4 38. Re1 Qf6 39. Bd1 a5 40. Bg4 Kb8) 34... d6?? { (-2.85 → 13.62) Blunder. Best move was Qh5. } (34... Qh5 35. Rg1 Rxg1 36. Qxg1 Qxh4+ 37. Kg2 Rg8+ 38. Kf1 Rxg1+ 39. Kxg1 Qxf4 40. Rf2 Qe3 41. Kf1) 35. Rxa6?? { (13.62 → 6.64) Blunder. Best move was Bf5+. } (35. Bf5+ Kb7 36. Ra4 Qxh4+ 37. Qxh4 Rxh4+ 38. Kxh4 Kb6 39. Rb4+ Kc5 40. Rb7 Kd4 41. Rxc7 Rd8) 35... Rg7?? { (6.64 → Mate in 2) Checkmate is now unavoidable. Best move was Qh5. } (35... Qh5 36. Ra8+ Kd7 37. Rxg8 Rxg8 38. Re3 Qg4+ 39. Kh2 Rh8 40. Rh3 Ke8 41. Bd3 f5 42. Be2) 36. Ra8+ Kb7 37. Qa7# { Black is checkmated } 1-0`
// describe.skip('playground', () => {
describe.only('playground', () => {
	const engine = new Engine(enginePath)

	before(async () => {
		await engine.init()
	})

	after(async () => {
		await engine.quit()
	})

	it('playground', annotation).timeout(500000)

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
		game.load_pgn(game1)
		let gmoves = game.history({verbose: true})
		.map(move => {
			let str = `${move.from}${move.to}`
			if( move.promotion ) str += move.promotion
			return str
		})
		const wat = await blundercheck(engine, gmoves, {reverse:true}, {depth: 13})
		// console.log(wat);
		wat.map((hm, i) => {
			console.log('---');
			// console.log((i+2)/2, hm);
			console.log(hm);
		})
	}
})
