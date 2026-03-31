import { useState, useRef, useEffect } from 'react'
import './App.css'

interface GameRecord {
  word: string
  player: 1 | 2 | 'ai'
  timestamp: number
}

interface GameState {
  mode: 'menu' | 'solo' | 'versus'
  currentPlayer: 1 | 2
  lastChar: string
  records: GameRecord[]
  scores: { player1: number; player2: number }
  gameOver: boolean
  winner: 1 | 2 | null
  aiThinking: boolean
  timer: number
  timerEnabled: boolean
  timeLeft: number
}

const COMMON_WORDS = [
  '水果', '蘋果', '果實', '書店', '院子', '子彈', '蛋黃', '黃色', '色差', '差異',
  '異議', '意見', '見面', '面積', '積極', '極速', '速食', '食指', '指尖', '膠帶',
  '待會', '會議', '議論', '論文', '文本', '本人', '人生', '生命', '活力', '力量',
  '量詞', '詞典', '典禮', '禮物', '物體', '體育', '育樂', '樂趣', '趣事', '事實',
  '實驗', '驗收', '收據', '距離', '狐狸', '理工', '工作', '作坊', 'fang', '方圓',
  '原創', '行動', '動漫', '漫畫', '畫廊', '廊道', '道路', '路燈', '燈光', '光纖',
  '鮮花', '花園', '園丁', '丁寧', '定論', '論點', '點心', '心情', '情境', '境界',
  '格外', '外送', '送信', '信件', '間接', '接觸', '觸摸', '摸索', '索馬', '馬力',
  '力氣', '氣球', '球迷', '球場', '場面', '面粉', '粉末', '末梢', '梢頭', '頭腦',
  '鬧鐘', '鐘聲', '聲音', '音樂', '樂隊', '隊友', '友好', '好朋友', '友誼', '議論',
  '論文', '文化', '化妝', '妝容', '容貌', '茂密', '密度', '度假', '假定', '定型',
  '行動', '動力', '力學', '學院', '院校', '校内', '校外', '外送', '送信', '信件',
  '見面', '面膜', '膜拜', '拜訪', '紡織', '織布', '布丁', '丁香', '香菇', '菇類',
  '類別', '別針', '針灸', '灸法', '法律', '法規', '規模', '模組', '組織', '紙巾',
  '巾幗', '國手', '手機', '機場', '場地', '地下', '下水道', '道路', '路標', '標本',
  '本壘', '壘球', '球棒', '棒球', '球員', '員工', '工作', '作坊', '坊間', '間諜',
  '碟仙', '仙女', '女孩', '孩提', '提問', '問題', '題目', '目的', '的話', '話語',
  '語文', '文字', '字符', '符合', '合格', '格蘭', '蘭花', '花費', '費心', '心安',
  '燈塔', '塔防', '防盜', '盜賊', '賊頭', '頭獎', '獎金', '金額', '兒童', '童話',
  '話劇', '劇場', '場景', '景色', '色彩', '彩妝', '妝點', '點滴', '滴滴', '的速度',
  '度過', '過年', '年假', '假的', '的确', '確實', '實在', '在外', '外包', '包裝',
  '裝置', '置換', '換句', '句型', '型男', '男女', '孩子', '子曰', '曰：', '孔子',
  '子孫', '孫文', '文具', '具備', '備註', '註冊', '冊子', '子彈', '彈弓', '弓箭',
  '劍道', '道別', '別人', '人才', '才女', '女子', '子女', '孩子', '子曰', '孔子',
  '子彈', '彈跳', '跳躍', '躍動', '動物', '物種', '種花', '花茶', '茶道', '道地',
  '地球', '球迷', '球棒', '棒球', '球場', '場面', '面粉', '粉末', '末梢', '梢頭',
]

function App() {
  const [gameState, setGameState] = useState<GameState>({
    mode: 'menu',
    currentPlayer: 1,
    lastChar: '',
    records: [],
    scores: { player1: 0, player2: 0 },
    gameOver: false,
    winner: null,
    aiThinking: false,
    timer: 30,
    timerEnabled: false,
    timeLeft: 30,
  })

  const [inputWord, setInputWord] = useState('')
  const [message, setMessage] = useState('')
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (gameState.mode === 'menu') return
    if (gameState.gameOver) return
    
    if (gameState.timerEnabled && gameState.timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
    } else if (gameState.timerEnabled && gameState.timeLeft === 0) {
      handleTimeout()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [gameState.mode, gameState.gameOver, gameState.timeLeft, gameState.timerEnabled])

  useEffect(() => {
    if ((gameState.mode === 'solo' || gameState.mode === 'versus') && !gameState.gameOver) {
      inputRef.current?.focus()
    }
  }, [gameState.mode, gameState.currentPlayer, gameState.gameOver])

  const handleTimeout = () => {
    const current = gameState.currentPlayer
    const nextPlayer = current === 1 ? 2 : 1
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      winner: nextPlayer,
    }))
    setMessage(`⏰ 時間到！玩家 ${nextPlayer} 獲勝！`)
  }

  const resetGame = () => {
    setGameState({
      mode: 'menu',
      currentPlayer: 1,
      lastChar: '',
      records: [],
      scores: { player1: 0, player2: 0 },
      gameOver: false,
      winner: null,
      aiThinking: false,
      timer: 30,
      timerEnabled: false,
      timeLeft: 30,
    })
    setInputWord('')
    setMessage('')
    setUsedWords(new Set())
  }

  const startSolo = (withTimer: boolean) => {
    setGameState(prev => ({
      ...prev,
      mode: 'solo',
      currentPlayer: 1,
      lastChar: '',
      records: [],
      gameOver: false,
      winner: null,
      aiThinking: false,
      timerEnabled: withTimer,
      timeLeft: withTimer ? 30 : 0,
    }))
    setInputWord('')
    setMessage('🎮 單人模式：輸入第一個詞開始遊戲！')
    setUsedWords(new Set())
  }

  const startVersus = (withTimer: boolean) => {
    setGameState(prev => ({
      ...prev,
      mode: 'versus',
      currentPlayer: 1,
      lastChar: '',
      records: [],
      gameOver: false,
      winner: null,
      aiThinking: false,
      timerEnabled: withTimer,
      timeLeft: withTimer ? 30 : 0,
    }))
    setInputWord('')
    setMessage('👥 雙人模式：玩家 1 先開始！')
    setUsedWords(new Set())
  }

  const findAiWord = (lastChar: string, used: Set<string>): string | null => {
    const candidates = COMMON_WORDS.filter(
      w => w.startsWith(lastChar) && !used.has(w) && w.length >= 2
    )
    if (candidates.length === 0) return null
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  const submitWord = () => {
    const word = inputWord.trim()
    
    if (!word) {
      setMessage('❌ 請輸入詞彙！')
      return
    }

    if (word.length < 2) {
      setMessage('❌ 詞彙至少需要 2 個字！')
      return
    }

    if (usedWords.has(word)) {
      setMessage('❌ 這個詞已經用過了！')
      return
    }

    if (gameState.lastChar && word[0] !== gameState.lastChar) {
      setMessage(`❌ 必須以「${gameState.lastChar}」開頭！`)
      return
    }

    const newUsedWords = new Set(usedWords)
    newUsedWords.add(word)

    const newRecord: GameRecord = {
      word,
      player: gameState.mode === 'solo' ? 1 : gameState.currentPlayer,
      timestamp: Date.now(),
    }

    const lastChar = word[word.length - 1]
    const nextPlayer = gameState.currentPlayer === 1 ? 2 : 1

    setUsedWords(newUsedWords)
    setGameState(prev => ({
      ...prev,
      lastChar,
      currentPlayer: nextPlayer,
      records: [...prev.records, newRecord],
      timeLeft: prev.timerEnabled ? prev.timer : 0,
    }))
    setInputWord('')

    if (gameState.mode === 'solo') {
      setMessage(`✅ 「${word}」結尾：「${lastChar}」`)
      setGameState(prev => ({ ...prev, aiThinking: true }))
      
      setTimeout(() => {
        const aiWord = findAiWord(lastChar, newUsedWords)
        if (!aiWord) {
          setGameState(prev => ({
            ...prev,
            gameOver: true,
            winner: 1,
            aiThinking: false,
          }))
          setMessage(`🤖 AI 找不到合適的詞！玩家 1 獲勝！🎉`)
        } else {
          newUsedWords.add(aiWord)
          setUsedWords(new Set(newUsedWords))
          const aiLastChar = aiWord[aiWord.length - 1]
          const aiRecord: GameRecord = {
            word: aiWord,
            player: 'ai',
            timestamp: Date.now(),
          }
          setGameState(prev => ({
            ...prev,
            lastChar: aiLastChar,
            records: [...prev.records, aiRecord],
            aiThinking: false,
            timeLeft: prev.timerEnabled ? prev.timer : 0,
          }))
          setMessage(`✅ AI 說：「${aiWord}」結尾：「${aiLastChar}」`)
        }
      }, 1500)
    } else {
      const aiWord = findAiWord(lastChar, newUsedWords)
      if (!aiWord) {
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          winner: gameState.currentPlayer,
        }))
        setMessage(`🤖 玩家 ${gameState.currentPlayer} 獲勝！對手找不到詞了！🎉`)
      } else {
        setMessage(`✅ 「${word}」結尾：「${lastChar}」 - 等待玩家 ${nextPlayer} 回應`)
      }
    }
  }

  const handleGiveUp = () => {
    const winner = gameState.currentPlayer === 1 ? 2 : 1
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      winner,
    }))
    setMessage(`🏳️ 玩家 ${gameState.currentPlayer} 放棄！玩家 ${winner} 獲勝！🎉`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitWord()
    }
  }

  if (gameState.mode === 'menu') {
    return (
      <div className="app menu">
        <div className="menu-container">
          <h1>🎮 文字接龍</h1>
          <p className="subtitle">Word Chain Game</p>
          
          <div className="menu-buttons">
            <h2>選擇模式</h2>
            
            <button className="menu-btn primary" onClick={() => startSolo(false)}>
              <span className="icon">🎲</span>
              <span className="text">單人模式</span>
              <span className="desc">與 AI 對戰</span>
            </button>
            
            <button className="menu-btn secondary" onClick={() => startVersus(false)}>
              <span className="icon">👥</span>
              <span className="text">雙人對戰</span>
              <span className="desc">兩位玩家輪流</span>
            </button>
            
            <button className="menu-btn primary" onClick={() => startSolo(true)}>
              <span className="icon">⏱️</span>
              <span className="text">單人計時模式</span>
              <span className="desc">限時挑戰</span>
            </button>
            
            <button className="menu-btn secondary" onClick={() => startVersus(true)}>
              <span className="icon">⏱️👥</span>
              <span className="text">雙人計時模式</span>
              <span className="desc">限時對戰</span>
            </button>
          </div>
          
          <div className="rules">
            <h3>📖 遊戲規則</h3>
            <ul>
              <li>輸入以指定字開頭的詞彙</li>
              <li>每個詞不能重複使用</li>
              <li>找不到詞時可以認輸</li>
              <li>計時模式有時間限制</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app game">
      <div className="game-header">
        <button className="back-btn" onClick={resetGame}>← 返回</button>
        <h1>🎮 文字接龍</h1>
        <div className="header-info">
          {gameState.timerEnabled && (
            <span className={`timer ${gameState.timeLeft <= 10 ? 'warning' : ''}`}>
              ⏱️ {gameState.timeLeft}s
            </span>
          )}
        </div>
      </div>

      <div className="game-mode-badge">
        {gameState.mode === 'solo' ? '🎲 單人模式' : '👥 雙人對戰'}
        {gameState.timerEnabled && ' ⏱️'}
      </div>

      <div className="game-status">
        {gameState.gameOver ? (
          <div className="game-over">
            <h2>🏆 遊戲結束！</h2>
            <p className="winner">
              {gameState.winner === 1 && '🎉 玩家 1 獲勝！'}
              {gameState.winner === 2 && '🎉 玩家 2 獲勝！'}
              {gameState.winner === null && '🤝 平手！'}
            </p>
            <button className="play-again" onClick={resetGame}>再玩一次</button>
          </div>
        ) : (
          <div className="current-turn">
            <p>
              {gameState.mode === 'solo' ? (
                gameState.aiThinking ? (
                  <span className="ai-thinking">🤖 AI 正在思考...</span>
                ) : (
                  <span>🎯 請輸入以「<strong>{gameState.lastChar || '?'}</strong>」開頭的詞</span>
                )
              ) : (
                <span>👤 玩家 {gameState.currentPlayer} 的回合 {gameState.lastChar && `(需要以「${gameState.lastChar}」開頭)`}</span>
              )}
            </p>
          </div>
        )}
      </div>

      {message && <div className="message">{message}</div>}

      {!gameState.gameOver && !gameState.aiThinking && (
        <div className="input-area">
          <input
            ref={inputRef}
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={gameState.lastChar ? `以「${gameState.lastChar}」開頭...` : '輸入第一個詞...'}
            disabled={gameState.aiThinking}
          />
          <button className="submit-btn" onClick={submitWord}>送出</button>
          <button className="giveup-btn" onClick={handleGiveUp}>認輸</button>
        </div>
      )}

      {gameState.aiThinking && (
        <div className="input-area">
          <input
            type="text"
            placeholder="AI 思考中..."
            disabled
          />
          <button className="submit-btn" disabled>送出</button>
        </div>
      )}

      <div className="records">
        <h3>📜 接龍記錄 ({gameState.records.length} 詞)</h3>
        <div className="records-list">
          {gameState.records.map((record, index) => (
            <div key={index} className={`record-item ${record.player === 'ai' ? 'ai' : `player${record.player}`}`}>
              <span className="record-word">{record.word}</span>
              <span className="record-player">
                {record.player === 'ai' ? '🤖' : `P${record.player}`}
              </span>
              {index < gameState.records.length - 1 && (
                <span className="record-arrow">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="used-count">
        已使用詞彙：{usedWords.size} 個
      </div>
    </div>
  )
}

export default App
