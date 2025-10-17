'use client'

import { useEffect, useState, useCallback } from 'react'

type Player = {
  player_id: string
  number: number
  name: string
  team: string
}

type Match = {
  match_id: string
  date: string
  opponent: string
  place: string
  ageCategory: string
  status: string
}

type Settings = {
  ActiveMatch: string
  Quarter: number
}

type State = {
  settings: Settings | null
  players: Player[]
  matches: Match[]
  selected: Player | null
  stats: any
  user: any
  viewMatchId: string | null
  rosterActive: Player[]
}

const FLAG_LABELS: Record<string, string> = {
  is_goal_from_play: 'G z gry',
  is_goal_from_center: 'G z 2m',
  is_goal_putback: 'Dobitka',
  is_goal_5m: 'G 5m',
  is_goal5m: 'G 5m', // Dodatkowe tłumaczenie dla klucza bez podkreślnika
  is_assist: 'Asysty',
  is_excl_drawn: 'Sprow. wykl.',
  is_excl_committed: 'Wykl. spowod.',
  is_penalty_drawn: 'Sprow. karny',
  is_penalty_committed: 'Karny spowod.',
  is_turnover: 'Strata',
  is_turnover_1v1: 'Strata 1:1',
  is_turnover1v1: 'Strata 1:1', // Dodatkowe tłumaczenie dla klucza bez podkreślnika
  is_bad_pass_turnover: 'Złe podanie (strata)',
  is_bad_pass_no_turnover: 'Złe podanie (bez straty)',
  is_shot_clock_violation: 'Koniec czasu',
  is_shot_saved_gk: 'Obrona GK',
  is_shot_miss_turnover: 'Rzut niecelny (strata)',
  is_shot_miss_reset30: 'Rzut niecelny (30s)',
  is_steal: 'Przejęcie',
  is_block_hand: 'Blok',
  is_no_block: 'Brak bloku',
  is_no_return: 'Brak powrotu',
  is_goal_counter: 'G kontra',
  is_shot_out: 'Strzał poza',
  is_bad_pass_2m: 'Zła piłka 2m',
  is_bad_pass2m: 'Zła piłka 2m', // Dodatkowe tłumaczenie dla klucza bez podkreślnika
  is_press_win: 'Wygrany pressing',
  is_interception: 'Przechwyt (podanie)',
}

export default function Home() {
  const [state, setState] = useState<State>({
    settings: null,
    players: [],
    matches: [],
    selected: null,
    stats: null,
    user: null,
    viewMatchId: null,
    rosterActive: [],
  })
  
  const [mode, setMode] = useState<'score' | 'stats' | 'admin' | 'players' | 'matches'>('score')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [note, setNote] = useState('')
  const [attackMode, setAttackMode] = useState<'positional' | 'man_up'>('positional')
  const [statsQuarter, setStatsQuarter] = useState('all')
  const [scoreQuarter, setScoreQuarter] = useState('1')
  const [scoreMy, setScoreMy] = useState('')
  const [scoreOpp, setScoreOpp] = useState('')
  const [rosterForm, setRosterForm] = useState<any[]>([])
  const [matchForm, setMatchForm] = useState({
    date: '',
    opponent: '',
    place: '',
    ageCategory: 'Seniorzy',
  })
  
  // Player management states
  const [playerForm, setPlayerForm] = useState({
    number: '',
    name: '',
  })
  const [playerSearch, setPlayerSearch] = useState('')
  const [selectedRosterPlayers, setSelectedRosterPlayers] = useState<Set<string>>(new Set())
  const [quarterScorePopup, setQuarterScorePopup] = useState<{
    show: boolean
    quarter: number
    myScore: string
    oppScore: string
  }>({ show: false, quarter: 1, myScore: '', oppScore: '' })
  const [endMatchPopup, setEndMatchPopup] = useState(false)
  const [targetQuarter, setTargetQuarter] = useState<number | null>(null)
  const [editMatchPopup, setEditMatchPopup] = useState<{
    show: boolean
    match: Match | null
  }>({ show: false, match: null })
  const [editMatchForm, setEditMatchForm] = useState({
    date: '',
    opponent: '',
    place: '',
    ageCategory: 'Seniorzy',
  })

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1400)
  }, [])

  const isMatchActive = useCallback(() => {
    const currentMatch = state.matches.find(m => m.match_id === state.settings?.ActiveMatch)
    return currentMatch?.status === 'active'
  }, [state.matches, state.settings])

  const addButtonPressEffect = useCallback((element: HTMLElement) => {
    element.classList.add('button-press')
    setTimeout(() => {
      element.classList.remove('button-press')
    }, 150)
  }, [])

  const callApi = useCallback(async (endpoint: string, options?: RequestInit) => {
    const res = await fetch(endpoint, {
      ...options,
      cache: 'no-store', // Disable caching
      headers: {
        'Cache-Control': 'no-cache',
        ...options?.headers
      }
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error || 'API Error')
    }
    return res.json()
  }, [])

  const bootstrap = useCallback(async () => {
    setLoading(true)
    try {
      const timestamp = Date.now()
      const data = await callApi(`/api/bootstrap?t=${timestamp}`)
      setState(prev => ({
        ...prev,
        settings: data.settings,
        players: data.players,
        matches: data.matches,
        user: data.user,
        rosterActive: data.rosterActive && data.rosterActive.length ? data.rosterActive : [],
      }))
      if (data.rosterActive?.length) {
        setState(prev => ({ ...prev, selected: data.rosterActive[0] }))
      }
    } catch (e: any) {
      alert(e.message || 'Błąd ładowania')
    } finally {
      setLoading(false)
    }
  }, [callApi])

  const refreshStats = useCallback(async () => {
    const matchId = state.viewMatchId || state.settings?.ActiveMatch
    if (!matchId) return
    setLoading(true)
    try {
      // Add timestamp to force fresh data
      const timestamp = Date.now()
      const stats = await callApi(`/api/stats/${matchId}?t=${timestamp}`)
      setState(prev => ({ ...prev, stats }))
    } catch (e: any) {
      console.error('Error loading stats:', e) // Debug log
      showToast(e.message || 'Błąd statystyk')
    } finally {
      setLoading(false)
    }
  }, [state.viewMatchId, state.settings, callApi, showToast])

  useEffect(() => {
    bootstrap()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setQuarter = async (q: number, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) addButtonPressEffect(event.currentTarget)
    if (!isMatchActive()) {
      return showToast('Mecz jest zakończony - edycja zablokowana')
    }
    
    const currentQuarter = state.settings?.Quarter || 1
    // Show popup to enter score for CURRENT quarter (the one we're leaving)
    setQuarterScorePopup({
      show: true,
      quarter: currentQuarter, // Score for current quarter
      myScore: '',
      oppScore: ''
    })
    
    // Store the target quarter to switch to after saving score
    setTargetQuarter(q)
  }

  const setMatch = async (mId: string) => {
    setLoading(true) // Show loading immediately
    try {
      // Clear all data first
      setState(prev => ({ 
        ...prev, 
        stats: null, // Clear stats immediately
        rosterActive: [], // Clear roster
        players: [] // Clear players
      }))
      
      const s = await callApi('/api/settings/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: mId }),
      })
      setState(prev => ({ ...prev, settings: s }))
      
      // Fetch roster for new match
      const rosterTimestamp = Date.now()
      const roster = await callApi(`/api/roster/${mId}?t=${rosterTimestamp}`)
      setState(prev => ({ ...prev, rosterActive: roster, players: roster }))
      
      // Load fresh stats for new match
      if (mId) {
        const statsTimestamp = Date.now()
        const stats = await callApi(`/api/stats/${mId}?t=${statsTimestamp}`)
        setState(prev => ({ ...prev, stats }))
      }
      
      showToast(`Przełączono na mecz: ${mId}`)
    } catch (e: any) {
      console.error('Error setting match:', e) // Debug log
      showToast(e.message || 'Błąd')
    } finally {
      setLoading(false) // Hide loading
    }
  }

  const undoLast = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) addButtonPressEffect(event.currentTarget)
    if (!isMatchActive()) {
      return showToast('Mecz jest zakończony - edycja zablokowana')
    }
    try {
      const res = await callApi('/api/events/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowMinutes: 3 }),
      })
      showToast(res.ok ? 'Cofnięto' : (res.reason || 'Brak do cofnięcia'))
      // Refresh stats if successfully undone
      if (res.ok && mode === 'stats' && state.stats) {
        refreshStats()
      }
    } catch (e: any) {
      showToast(e.message || 'Błąd')
    }
  }

  const submitEvent = async (def: any, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) addButtonPressEffect(event.currentTarget)
    if (!state.selected) return showToast('Wybierz zawodnika')
    if (!isMatchActive()) return showToast('Mecz jest zakończony - edycja zablokowana')

    const phase = def?.phase || 'positional'
    const base: any = {
      match_id: state.settings?.ActiveMatch,
      quarter: state.settings?.Quarter,
      team: 'my',
      player_id: state.selected.player_id,
      player_name: state.selected.name,
      note,
      phase,
    }

    const flags: any = {}
    const act = def?.action || def

    switch (act) {
      case 'goal_play_pos': flags.is_goal_from_play = 1; break
      case 'goal_center_manup': flags.is_goal_from_center = 1; break
      case 'goal_5m': flags.is_goal_5m = 1; break
      case 'assist': flags.is_assist = 1; break
      case 'shot_saved': flags.is_shot_saved_gk = 1; break
      case 'miss_turnover': flags.is_shot_miss_turnover = 1; break
      case 'miss_reset': flags.is_shot_miss_reset30 = 1; break
      case 'bad_pass_turnover': flags.is_bad_pass_turnover = 1; break
      case 'bad_pass_no': flags.is_bad_pass_no_turnover = 1; break
      case 'turnover_1v1': flags.is_turnover_1v1 = 1; break
      case 'shot_clock': flags.is_shot_clock_violation = 1; break
      case 'penalty_drawn_field': flags.is_penalty_drawn = 1; base.penalty_drawn_location = 'field'; break
      case 'penalty_drawn_center': flags.is_penalty_drawn = 1; base.penalty_drawn_location = 'center'; break
      case 'excl_drawn_field': flags.is_excl_drawn = 1; base.excl_drawn_location = 'field'; break
      case 'excl_drawn_center': flags.is_excl_drawn = 1; base.excl_drawn_location = 'center'; break
      case 'excl_comm_field': flags.is_excl_committed = 1; base.excl_committed_location = 'field'; break
      case 'excl_comm_center': flags.is_excl_committed = 1; base.excl_committed_location = 'center'; break
      case 'pen_comm_field': flags.is_penalty_committed = 1; base.penalty_committed_location = 'field'; break
      case 'pen_comm_center': flags.is_penalty_committed = 1; base.penalty_committed_location = 'center'; break
      case 'no_return': flags.is_no_return = 1; break
      case 'steal': flags.is_steal = 1; break
      case 'block': flags.is_block_hand = 1; break
      case 'no_block': flags.is_no_block = 1; break
      case 'goal_penalty': flags.is_goal_5m = 1; base.phase = 'penalty'; break
      default: break
    }

    const payload = { ...base, ...flags }

    try {
      await callApi('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [payload] }),
      })
      setNote('')
      showToast('Zapisano')
      // Refresh stats if in stats mode
      if (mode === 'stats' && state.stats) {
        refreshStats()
      }
    } catch (e: any) {
      showToast(e.message || 'Błąd zapisu')
    }
  }

  const saveScore = async () => {
    const matchId = state.settings?.ActiveMatch
    if (!matchId) return

    setLoading(true)
    try {
      const scores = await callApi('/api/stats/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          quarter: scoreQuarter,
          myScore: Number(scoreMy || 0),
          oppScore: Number(scoreOpp || 0),
        }),
      })
      setState(prev => ({
        ...prev,
        stats: { ...(prev.stats || {}), scores },
      }))
      showToast('Zapisano wynik')
    } catch (e: any) {
      showToast(e.message || 'Błąd')
    } finally {
      setLoading(false)
    }
  }

  const buildRosterForm = async () => {
    setLoading(true)
    try {
      const players = await callApi('/api/players')
      setRosterForm(players.map((p: Player) => ({ ...p, number: '' })))
    } catch (e) {
      setRosterForm(state.players.map(p => ({ ...p, number: '' })))
    } finally {
      setLoading(false)
    }
  }

  const saveMatchWithRoster = async () => {
    const roster = rosterForm
      .filter(p => String(p.number || '').trim() !== '')
      .map(p => ({
        player_id: p.player_id,
        number: p.number,
        name: p.name,
        team: p.team || 'my',
      }))
    
    if (!roster.length) return showToast('Wybierz zawodników i numery')

    setLoading(true)
    try {
      const res = await callApi('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match: matchForm, roster }),
      })
      showToast('Zapisano mecz i skład')
      setState(prev => ({
        ...prev,
        matches: res.matches,
        rosterActive: res.roster,
        players: res.roster,
        settings: { ...prev.settings!, ActiveMatch: res.matchId },
      }))
      // Reset form
      setMatchForm({ date: '', opponent: '', place: '', ageCategory: 'Seniorzy' })
    } catch (e: any) {
      showToast(e.message || 'Błąd zapisu')
    } finally {
      setLoading(false)
    }
  }

  // Player management functions
  const addPlayer = async () => {
    if (!playerForm.number || !playerForm.name) {
      showToast('Wprowadź numer i nazwisko zawodnika')
      return
    }

    setLoading(true)
    try {
      const newPlayer = await callApi('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: parseInt(playerForm.number),
          name: playerForm.name,
          team: 'my',
        }),
      })
      
      setState(prev => ({
        ...prev,
        players: [...prev.players, newPlayer].sort((a, b) => a.number - b.number),
      }))
      
      setPlayerForm({ number: '', name: '' })
      showToast('Dodano zawodnika')
    } catch (e: any) {
      showToast(e.message || 'Błąd dodawania zawodnika')
    } finally {
      setLoading(false)
    }
  }

  const deletePlayer = async (playerId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego zawodnika?')) return

    setLoading(true)
    try {
      await callApi('/api/players', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId }),
      })
      
      setState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.player_id !== playerId),
      }))
      
      showToast('Usunięto zawodnika')
    } catch (e: any) {
      showToast(e.message || 'Błąd usuwania zawodnika')
    } finally {
      setLoading(false)
    }
  }

  const copyRosterFromPrevious = async () => {
    if (state.matches.length < 2) {
      showToast('Brak poprzedniego meczu')
      return
    }

    const previousMatch = state.matches[1] // Second match (first is current)
    setLoading(true)
    try {
      const roster = await callApi(`/api/roster/${previousMatch.match_id}`)
      
      // Set selected players from previous match
      const selectedIds = new Set<string>(roster.map((p: any) => p.player_id as string))
      setSelectedRosterPlayers(selectedIds)
      
      // Build roster form with previous players
      setRosterForm(roster.map((p: any) => ({
        player_id: p.player_id,
        number: p.number,
        name: p.name,
        team: p.team,
      })))
      
      showToast('Skopiowano skład z poprzedniego meczu')
    } catch (e: any) {
      showToast('Błąd kopiowania składu')
    } finally {
      setLoading(false)
    }
  }


  const saveQuarterScore = async () => {
    const matchId = state.settings?.ActiveMatch
    if (!matchId) return

    setLoading(true)
    try {
      const scores = await callApi('/api/stats/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          quarter: quarterScorePopup.quarter,
          myScore: Number(quarterScorePopup.myScore || 0),
          oppScore: Number(quarterScorePopup.oppScore || 0),
        }),
      })
      setState(prev => ({
        ...prev,
        stats: { ...(prev.stats || {}), scores },
      }))
      
      // Now update the quarter to target quarter (the one we want to switch to)
      const targetQ = targetQuarter || quarterScorePopup.quarter
      const s = await callApi('/api/settings/quarter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quarter: targetQ }),
      })
      setState(prev => ({ ...prev, settings: s }))
      
      setQuarterScorePopup({ show: false, quarter: 1, myScore: '', oppScore: '' })
      setTargetQuarter(null)
      showToast(`Zapisano wynik Q${quarterScorePopup.quarter} i przełączono na Q${targetQ}`)
    } catch (e: any) {
      showToast(e.message || 'Błąd')
    } finally {
      setLoading(false)
    }
  }

  const endMatch = async () => {
    const matchId = state.settings?.ActiveMatch
    if (!matchId) return

    setLoading(true)
    try {
      // Update match status to ended
      await callApi('/api/matches/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      })
      
      setEndMatchPopup(false)
      showToast('Mecz zakończony - edycja zablokowana')
      
      // Refresh data to show updated status
      bootstrap()
    } catch (e: any) {
      showToast(e.message || 'Błąd')
    } finally {
      setLoading(false)
    }
  }

  const archiveMatch = async (matchId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten mecz? Mecz zostanie zarchiwizowany.')) return

    setLoading(true)
    try {
      await callApi('/api/matches/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      })
      
      showToast('Mecz zarchiwizowany')
      
      // Refresh data
      bootstrap()
    } catch (e: any) {
      showToast(e.message || 'Błąd')
    } finally {
      setLoading(false)
    }
  }

  const editMatch = async () => {
    const match = editMatchPopup.match
    if (!match) return

    setLoading(true)
    try {
      await callApi('/api/matches/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.match_id,
          date: editMatchForm.date,
          opponent: editMatchForm.opponent,
          place: editMatchForm.place,
          ageCategory: editMatchForm.ageCategory,
        }),
      })
      
      setEditMatchPopup({ show: false, match: null })
      showToast('Mecz zaktualizowany')
      
      // Refresh data
      bootstrap()
    } catch (e: any) {
      showToast(e.message || 'Błąd')
    } finally {
      setLoading(false)
    }
  }

  const openEditMatch = (match: Match) => {
    setEditMatchForm({
      date: match.date,
      opponent: match.opponent,
      place: match.place,
      ageCategory: match.ageCategory,
    })
    setEditMatchPopup({ show: true, match })
  }

  useEffect(() => {
    if (mode === 'admin') {
      buildRosterForm()
    } else if (mode === 'stats') {
      refreshStats()
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <header>
        <div className="tag">
          Mecz:
          <select
            value={state.settings?.ActiveMatch || ''}
            onChange={e => setMatch(e.target.value)}
          >
            {state.matches.map(m => (
              <option key={m.match_id} value={m.match_id}>
                {m.opponent ? `vs ${m.opponent} (${m.ageCategory}) ${m.place}` : m.match_id}
              </option>
            ))}
          </select>
        </div>

        {mode === 'score' && (
          <div className="navbar" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="tag">
              Kwarta: <span>{state.settings?.Quarter || '—'}</span>
            </div>
            {[1, 2, 3, 4].map(q => (
              <button
                key={q}
                className={'qbtn' + (state.settings?.Quarter === q ? ' selected' : '')}
                onClick={(e) => setQuarter(q, e)}
                disabled={!isMatchActive()}
              >
                Q{q}
              </button>
            ))}
            {/* <button className="danger" onClick={(e) => undoLast(e)} disabled={!isMatchActive()}>
              Cofnij ostatnią akcję
            </button> */}
            {state.settings?.ActiveMatch && isMatchActive() && (
              <button 
                className="primary" 
                onClick={(e) => {
                  addButtonPressEffect(e.currentTarget)
                  setEndMatchPopup(true)
                }}
                style={{ marginLeft: '12px' }}
              >
                Zakończ mecz
              </button>
            )}
            {state.settings?.ActiveMatch && !isMatchActive() && (
              <div className="tag" style={{ marginLeft: '12px', backgroundColor: '#2d1b00', borderColor: '#d4a574' }}>
                Mecz zakończony
              </div>
            )}
          </div>
        )}

        <div style={{ marginLeft: 'auto' }} />
        <button onClick={() => setDrawerOpen(true)}>☰</button>
      </header>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer open">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="muted">Menu</div>
              <button onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            <button
              className={'btn menu-btn' + (mode === 'score' ? ' primary' : '')}
              onClick={(e) => { addButtonPressEffect(e.currentTarget); setMode('score'); setDrawerOpen(false) }}
            >
              Asystent
            </button>
            <button
              className={'btn menu-btn' + (mode === 'stats' ? ' primary' : '')}
              onClick={(e) => { addButtonPressEffect(e.currentTarget); setMode('stats'); setDrawerOpen(false) }}
            >
              Statystyki
            </button>
            <button
              className={'btn menu-btn' + (mode === 'players' ? ' primary' : '')}
              onClick={(e) => { addButtonPressEffect(e.currentTarget); setMode('players'); setDrawerOpen(false) }}
            >
              Zawodnicy
            </button>
            <button
              className={'btn menu-btn' + (mode === 'matches' ? ' primary' : '')}
              onClick={(e) => { addButtonPressEffect(e.currentTarget); setMode('matches'); setDrawerOpen(false) }}
            >
              Mecze
            </button>
            <button
              className={'btn menu-btn' + (mode === 'admin' ? ' primary' : '')}
              onClick={(e) => { addButtonPressEffect(e.currentTarget); setMode('admin'); setDrawerOpen(false) }}
            >
              Dodaj nowy mecz
            </button>
            
            <div style={{ marginTop: 'auto', paddingTop: '20px', textAlign: 'center' }}>
              <div className="muted small">Powered by CEBO.TECH</div>
            </div>
          </div>
        </>
      )}

      {/* SCOREKEEPER */}
      {mode === 'score' && (
        <div className="wrap">
          <div className="main-layout">
            <div className="players-sidebar">
              <div className="players">
                {state.rosterActive.length === 0 ? (
                  <div className="muted" style={{ padding: '12px' }}>Brak składu dla wybranego meczu</div>
                ) : (
                  state.rosterActive.map(p => (
                    <div
                      key={p.player_id}
                      className={'player' + (state.selected?.player_id === p.player_id ? ' active' : '') + (!isMatchActive() ? ' disabled' : '')}
                      onClick={() => isMatchActive() && setState(prev => ({ ...prev, selected: p }))}
                    >
                      <div className="num">{p.number || ''}</div>
                      <div className="name">{p.name}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="actions-main">
            <div className="panel">
              <div className="muted">
                Wybrany: <span>{state.selected ? `#${state.selected.number} ${state.selected.name}` : '—'}</span>
              </div>

              {/* Toggle Switch */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="attack-mode-toggle"
                    checked={attackMode === 'man_up'}
                    onChange={(e) => setAttackMode(e.target.checked ? 'man_up' : 'positional')}
                  />
                  <label htmlFor="attack-mode-toggle">
                    <span className="toggle-label">Pozycyjny</span>
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Przewaga</span>
                  </label>
                </div>
              </div>

              <div className={`card ${attackMode === 'man_up' ? 'man-up-mode' : ''}`}>
                <div className="subhead">Atak</div>

                {attackMode === 'positional' ? (
                  <>
                    <div className="subhead">Bramki</div>
                    <div className="grid">
                      <button className="btn" onClick={(e) => submitEvent({ action: 'goal_play_pos', phase: 'positional' }, e)}>
                        z akcji
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'goal_play_pos', phase: 'counter' }, e)}>
                        z kontrataku
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'goal_center_manup', phase: 'positional' }, e)}>
                        z centra
                      </button>
                    </div>
                    <div className="subhead">Asysta</div>
                    <div className="grid">
                      <button className="btn" onClick={(e) => submitEvent({ action: 'assist', phase: 'positional' }, e)}>
                        Asysta
                      </button>
                    </div>
                    <div className="subhead">Strata piłki</div>
                    <div className="grid">
                      <button className="btn" onClick={(e) => submitEvent({ action: 'shot_saved', phase: 'positional' }, e)}>
                        Obrona bramkarza
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'miss_turnover', phase: 'positional' }, e)}>
                        Niecelny rzut – strata
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'miss_reset', phase: 'positional' }, e)}>
                        Niecelny rzut – 30s
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'bad_pass_turnover', phase: 'positional' }, e)}>
                        Niecelne podanie – strata
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'bad_pass_no', phase: 'positional' }, e)}>
                        Niecelne podanie – bez straty
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'turnover_1v1', phase: 'positional' }, e)}>
                        Strata 1:1
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'shot_clock', phase: 'positional' }, e)}>
                        Koniec czasu
                      </button>
                    </div>
                    <div className="subhead">Sprowokowanie</div>
                    <div className="grid">
                      <button className="btn" onClick={(e) => submitEvent({ action: 'excl_drawn_field', phase: 'positional' }, e)}>
                        Wykluczenie – w polu
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'excl_drawn_center', phase: 'positional' }, e)}>
                        Wykluczenie – z centra
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'penalty_drawn_field', phase: 'positional' }, e)}>
                        Karny – w polu
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'penalty_drawn_center', phase: 'positional' }, e)}>
                        Karny – z centra
                      </button>
                    </div>
                    <div className="subhead">Rzuty karne</div>
                    <div className="grid">
                      <button className="btn primary" onClick={(e) => submitEvent({ action: 'goal_penalty', phase: 'penalty' }, e)}>
                        Bramka z karnego
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="subhead">Bramki</div>
                    <div className="grid">
                      <button className="btn primary" onClick={(e) => submitEvent({ action: 'goal_center_manup', phase: 'man_up' }, e)}>
                        z 2 metra
                      </button>
                      <button className="btn primary" onClick={(e) => submitEvent({ action: 'goal_5m', phase: 'man_up' }, e)}>
                        z 5 metra
                      </button>
                    </div>
                    <div className="subhead">Asysta</div>
                    <div className="grid">
                      <button className="btn" onClick={(e) => submitEvent({ action: 'assist', phase: 'man_up' }, e)}>
                        Asysta
                      </button>
                    </div>
                    <div className="subhead">Strata piłki</div>
                    <div className="grid">
                      <button className="btn" onClick={(e) => submitEvent({ action: 'shot_saved', phase: 'man_up' }, e)}>
                        Obrona bramkarza
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'miss_turnover', phase: 'man_up' }, e)}>
                        Niecelny rzut – strata
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'miss_reset', phase: 'man_up' }, e)}>
                        Niecelny rzut – 30s
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'bad_pass_turnover', phase: 'man_up' }, e)}>
                        Niecelne podanie – strata
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'bad_pass_no', phase: 'man_up' }, e)}>
                        Niecelne podanie – bez straty
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'turnover_1v1', phase: 'man_up' }, e)}>
                        Strata 1:1
                      </button>
                      <button className="btn" onClick={(e) => submitEvent({ action: 'shot_clock', phase: 'man_up' }, e)}>
                        Koniec czasu
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className={`card ${attackMode === 'man_up' ? 'man-up-mode' : ''}`}>
                <div className="subhead">Obrona</div>
                <div className="grid">
                  <button className="btn" onClick={(e) => submitEvent('no_return', e)}>
                    Brak powrotu
                  </button>
                  <button className="btn" onClick={(e) => submitEvent('excl_comm_field', e)}>
                    Wykluczenie – w polu
                  </button>
                  <button className="btn" onClick={(e) => submitEvent('excl_comm_center', e)}>
                    Wykluczenie – z centra
                  </button>
                  <button className="btn" onClick={(e) => submitEvent('pen_comm_field', e)}>
                    Karny – w polu
                  </button>
                  <button className="btn" onClick={(e) => submitEvent('pen_comm_center', e)}>
                    Karny – z centra
                  </button>
                  <button className="btn" onClick={(e) => submitEvent('shot_saved', e)}>
                    Obrona bramkarza
                  </button>
                  <button className="btn" onClick={(e) => submitEvent('steal', e)}>
                    Przejęcie piłki
                  </button>
                  <button className="btn" onClick={(e) => submitEvent('block', e)}>
                    Blok
                  </button>
                  <button className="btn" onClick={(e) => submitEvent('no_block', e)}>
                    Brak bloku
                  </button>
                </div>
              </div>

              <input
                className="input"
                placeholder="Notatka (opcjonalnie)"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      {mode === 'stats' && <StatsPanel state={state} statsQuarter={statsQuarter} setStatsQuarter={setStatsQuarter} scoreQuarter={scoreQuarter} setScoreQuarter={setScoreQuarter} scoreMy={scoreMy} setScoreMy={setScoreMy} scoreOpp={scoreOpp} setScoreOpp={setScoreOpp} saveScore={saveScore} />}

      {/* ADMIN */}
      {mode === 'admin' && <AdminPanel 
        matchForm={matchForm} 
        setMatchForm={setMatchForm} 
        rosterForm={rosterForm} 
        setRosterForm={setRosterForm} 
        saveMatchWithRoster={saveMatchWithRoster} 
        copyRosterFromPrevious={copyRosterFromPrevious}
        players={state.players}
        playerSearch={playerSearch}
        setPlayerSearch={setPlayerSearch}
        selectedRosterPlayers={selectedRosterPlayers}
        setSelectedRosterPlayers={setSelectedRosterPlayers}
      />}

      {/* PLAYERS */}
      {mode === 'players' && <PlayersPanel 
        players={state.players}
        playerForm={playerForm}
        setPlayerForm={setPlayerForm}
        addPlayer={addPlayer}
        deletePlayer={deletePlayer}
        loading={loading}
      />}

      {/* MATCHES */}
      {mode === 'matches' && <MatchesPanel 
        matches={state.matches}
        archiveMatch={archiveMatch}
        openEditMatch={openEditMatch}
        loading={loading}
      />}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Quarter Score Popup */}
      {quarterScorePopup.show && (
        <div className="loading-overlay">
          <div className="loader-box" style={{ minWidth: '300px' }}>
            <h4 style={{ margin: '0 0 16px', color: '#cde' }}>Wynik Q{quarterScorePopup.quarter}</h4>
            <div className="small muted" style={{ marginBottom: '12px' }}>
              Wpisz wynik kwarty {quarterScorePopup.quarter}, po zapisaniu przełączysz się na {targetQuarter ? `Q${targetQuarter}` : 'następną kwartę'}
            </div>
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="small muted">My</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={quarterScorePopup.myScore}
                  onChange={e => setQuarterScorePopup(prev => ({ ...prev, myScore: e.target.value }))}
                />
              </div>
              <div>
                <label className="small muted">Opponent</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={quarterScorePopup.oppScore}
                  onChange={e => setQuarterScorePopup(prev => ({ ...prev, oppScore: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button 
                className="btn" 
                onClick={async () => {
                  setQuarterScorePopup({ show: false, quarter: 1, myScore: '', oppScore: '' })
                  
                  // Switch to target quarter even when canceling
                  if (targetQuarter) {
                    try {
                      const s = await callApi('/api/settings/quarter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quarter: targetQuarter }),
                      })
                      setState(prev => ({ ...prev, settings: s }))
                      showToast(`Przełączono na Q${targetQuarter}`)
                    } catch (e: any) {
                      showToast(e.message || 'Błąd')
                    }
                  }
                  
                  setTargetQuarter(null)
                }}
              >
                Anuluj
              </button>
              <button 
                className="primary" 
                onClick={saveQuarterScore}
                disabled={loading}
              >
                Zapisz wynik Q{quarterScorePopup.quarter}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Match Popup */}
      {endMatchPopup && (
        <div className="loading-overlay">
          <div className="loader-box" style={{ minWidth: '300px' }}>
            <h4 style={{ margin: '0 0 16px', color: '#cde' }}>Zakończ mecz</h4>
            <p className="muted" style={{ margin: '0 0 16px' }}>
              Czy na pewno chcesz zakończyć mecz? Dalsza edycja będzie niemożliwa.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn" 
                onClick={() => setEndMatchPopup(false)}
              >
                Odrzuć
              </button>
              <button 
                className="danger" 
                onClick={endMatch}
                disabled={loading}
              >
                Tak, zakończ mecz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Match Popup */}
      {editMatchPopup.show && (
        <div className="loading-overlay">
          <div className="loader-box" style={{ minWidth: '400px' }}>
            <h4 style={{ margin: '0 0 16px', color: '#cde' }}>Edytuj mecz</h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <input
                className="input"
                placeholder="Data (np. 2025-10-05)"
                value={editMatchForm.date}
                onChange={e => setEditMatchForm({ ...editMatchForm, date: e.target.value })}
              />
              <div className="two">
                <input
                  className="input"
                  placeholder="Przeciwnik"
                  value={editMatchForm.opponent}
                  onChange={e => setEditMatchForm({ ...editMatchForm, opponent: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Miejsce"
                  value={editMatchForm.place}
                  onChange={e => setEditMatchForm({ ...editMatchForm, place: e.target.value })}
                />
              </div>
              <select
                className="input"
                value={editMatchForm.ageCategory}
                onChange={e => setEditMatchForm({ ...editMatchForm, ageCategory: e.target.value })}
              >
                <option value="U17">U17</option>
                <option value="U19">U19</option>
                <option value="Seniorzy">Seniorzy</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button 
                className="btn" 
                onClick={() => setEditMatchPopup({ show: false, match: null })}
              >
                Anuluj
              </button>
              <button 
                className="primary" 
                onClick={editMatch}
                disabled={loading}
              >
                Zapisz zmiany
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-overlay">
          <div className="loader-box">
            <div className="spinner" />
            <div className="muted">Ładowanie…</div>
          </div>
        </div>
      )}
    </>
  )
}

function StatsPanel({ state, statsQuarter, setStatsQuarter, scoreQuarter, setScoreQuarter, scoreMy, setScoreMy, scoreOpp, setScoreOpp, saveScore }: any) {
  const stats = state.stats

  if (!stats) {
    return (
      <div className="wrap">
        <div className="col">
          <h3>Statystyki</h3>
          <div className="panel">
            <div className="muted">Wybierz mecz aby zobaczyć statystyki</div>
          </div>
        </div>
      </div>
    )
  }

  const playersById = Object.fromEntries(stats.players.map((p: any) => [p.player_id, p]))
  const s = stats.scores
  
  // Calculate final score from quarters if not set
  const finalScore = s.final.my > 0 || s.final.opp > 0 
    ? `${s.final.my}:${s.final.opp}` 
    : `${s['1'].my + s['2'].my + s['3'].my + s['4'].my}:${s['1'].opp + s['2'].opp + s['3'].opp + s['4'].opp}`
  
  const scoreText = `Q1 ${s['1'].my}:${s['1'].opp} • Q2 ${s['2'].my}:${s['2'].opp} • Q3 ${s['3'].my}:${s['3'].opp} • Q4 ${s['4'].my}:${s['4'].opp} • F ${finalScore}`

  const sumGoals = (obj: any) => {
    const keys = ['is_goal_from_play', 'is_goal_5m', 'is_goal_from_center', 'is_goal_counter', 'is_goal_putback']
    return keys.reduce((a, k) => a + (Number(obj?.[k] || 0)), 0)
  }

  const buildTable = (rows: any[], title: string, totalsObj: any, flags: string[]) => {
    if (!rows.length) return <div className="muted">Brak danych</div>

    // Create player lookup
    const playersById = Object.fromEntries(stats.players.map((p: any) => [p.player_id, p]))
    
    // Transpose: rows = stats, columns = players
    const statRows = flags.map(flag => {
      const row: any = { stat: FLAG_LABELS[flag] || flag, flag }
      rows.forEach(playerRow => {
        const playerKey = playerRow.name // Use name as key
        row[playerKey] = playerRow[flag] || 0
      })
      // Add totals column
      row._total = totalsObj ? (totalsObj[flag] || 0) : 0
      return row
    })

    // Add goals sum row
    const goalsRow: any = { stat: 'Bramki (suma)', flag: '_goals' }
    rows.forEach(playerRow => {
      const playerKey = playerRow.name
      goalsRow[playerKey] = sumGoals(playerRow)
    })
    goalsRow._total = totalsObj ? sumGoals(totalsObj) : 0

    return (
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Statystyka</th>
              <th>Razem</th>
              {rows.map(playerRow => {
                const playerName = playerRow.name
                // Extract just the number from "#1 Jan Kowalski"
                const playerNumber = playerName.match(/^#(\d+)/)?.[1] || '?'
                return (
                  <th key={playerName} title={playerName}>
                    #{playerNumber}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {statRows.map((row, i) => (
              <tr key={row.flag}>
                <td>{row.stat}</td>
                <td style={{ fontWeight: 600 }}>{row._total}</td>
                {rows.map(playerRow => (
                  <td key={playerRow.name}>{row[playerRow.name]}</td>
                ))}
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #1f2e40', fontWeight: 700 }}>
              <td>{goalsRow.stat}</td>
              <td>{goalsRow._total}</td>
              {rows.map(playerRow => (
                <td key={playerRow.name}>{goalsRow[playerRow.name]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  let content: any = null
  if (statsQuarter === 'split') {
    content = ['1', '2', '3', '4'].map(q => {
      const byPid = stats.perPlayerByQ[q] || {}
      const rows = Object.entries(byPid).map(([pid, vals]: any) => {
        const p = playersById[pid] || { name: '?' }
        return { name: `#${p.number || ''} ${p.name || pid}`, ...vals }
      }).sort((a: any, b: any) => sumGoals(b) - sumGoals(a))
      const totalsQ = stats.totalsByQ[q] || {}
      return (
        <div key={q}>
          <div className="muted" style={{ marginTop: '16px' }}>Kwarta {q}</div>
          {buildTable(rows, 'Zawodnik', totalsQ, stats.flags)}
        </div>
      )
    })
  } else {
    const byPid = (statsQuarter === 'all') ? stats.perPlayerAll : (stats.perPlayerByQ[statsQuarter] || {})
    const totals = (statsQuarter === 'all') ? (stats.totalsAll || {}) : (stats.totalsByQ[statsQuarter] || {})
    const rows = Object.entries(byPid).map(([pid, vals]: any) => {
      const p = playersById[pid] || { name: '?' }
      return { name: `#${p.number || ''} ${p.name || pid}`, ...vals }
    }).sort((a: any, b: any) => sumGoals(b) - sumGoals(a))
    content = buildTable(rows, 'Zawodnik', totals, stats.flags)
  }

  return (
    <div className="wrap">
      <div className="col">
        <h3>Filtry i Wynik</h3>
        <div className="panel">
          <div className="muted small" style={{ marginBottom: '12px' }}>
            {(() => {
              const currentMatch = state.matches.find((m: Match) => m.match_id === state.settings?.ActiveMatch)
              if (!currentMatch) return 'Brak wybranego meczu'
              const matchInfo = [
                currentMatch.opponent && `vs ${currentMatch.opponent}`,
                currentMatch.ageCategory && `(${currentMatch.ageCategory})`,
                currentMatch.place && currentMatch.place,
                currentMatch.date && currentMatch.date
              ].filter(Boolean).join(' ')
              return `Aktualny mecz: ${matchInfo || currentMatch.match_id}`
            })()}
          </div>
          <label>
            Zakres:
            <select value={statsQuarter} onChange={e => setStatsQuarter(e.target.value)}>
              <option value="all">Cały mecz</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
              <option value="split">Podział na kwarty</option>
            </select>
          </label>

          <div>
            <div className="muted">Wynik meczu</div>
            <div className="small">{scoreText}</div>
            <div className="small muted" style={{ marginTop: '4px', fontSize: '11px' }}>
              Dane dla meczu: {state.settings?.ActiveMatch}
            </div>
          </div>
        </div>
      </div>

      <div className="col">
        <h3>Statystyki</h3>
        <div className="panel stats-scroll">
          {content}
        </div>
      </div>
    </div>
  )
}

function AdminPanel({ matchForm, setMatchForm, rosterForm, setRosterForm, saveMatchWithRoster, copyRosterFromPrevious, players, playerSearch, setPlayerSearch, selectedRosterPlayers, setSelectedRosterPlayers }: any) {
  const picked = rosterForm.filter((p: any) => String(p.number || '').trim() !== '').sort((a: any, b: any) => Number(a.number) - Number(b.number))

  return (
    <div className="wrap">
      <div className="col">
        <h3>Nowy mecz</h3>
        <div className="panel">
          <div className="muted small" style={{ marginBottom: '8px' }}>ID meczu zostanie wygenerowane automatycznie</div>
          <input
            className="input"
            placeholder="data (np. 2025-10-05)"
            value={matchForm.date}
            onChange={e => setMatchForm({ ...matchForm, date: e.target.value })}
          />
          <div className="two">
            <input
              className="input"
              placeholder="przeciwnik"
              value={matchForm.opponent}
              onChange={e => setMatchForm({ ...matchForm, opponent: e.target.value })}
            />
            <input
              className="input"
              placeholder="miejsce"
              value={matchForm.place}
              onChange={e => setMatchForm({ ...matchForm, place: e.target.value })}
            />
          </div>
          <select
            className="input"
            value={matchForm.ageCategory}
            onChange={e => setMatchForm({ ...matchForm, ageCategory: e.target.value })}
          >
            <option value="U17">U17</option>
            <option value="U19">U19</option>
            <option value="Seniorzy">Seniorzy</option>
          </select>
          {/* Player Search */}
          <input
            className="input"
            placeholder="🔍 Wyszukaj zawodników..."
            value={playerSearch}
            onChange={e => setPlayerSearch(e.target.value)}
            style={{ marginTop: '16px' }}
          />
          
          <div className="muted">Wybierz skład i przypisz numery:</div>
          <div className="grid">
            {rosterForm
              .filter((p: any) => 
                !playerSearch || 
                p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                p.number.toString().includes(playerSearch)
              )
              .map((p: any, idx: number) => {
                const isSelected = selectedRosterPlayers.has(p.player_id)
                return (
                  <div key={p.player_id} className={`card ${isSelected ? 'selected' : ''}`}>
                    <div style={{ marginBottom: '6px' }}>#{p.number || '?'} {p.name}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        className="input"
                        placeholder="#"
                        style={{ width: '80px' }}
                        value={p.number}
                        onChange={e => {
                          const updated = [...rosterForm]
                          updated[idx].number = e.target.value
                          setRosterForm(updated)
                        }}
                      />
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          const newSelected = new Set(selectedRosterPlayers)
                          if (e.target.checked) {
                            newSelected.add(p.player_id)
                          } else {
                            newSelected.delete(p.player_id)
                          }
                          setSelectedRosterPlayers(newSelected)
                          
                          // Update roster form
                          const updated = [...rosterForm]
                          updated[idx].number = e.target.checked ? (updated[idx].number || '') : ''
                          setRosterForm(updated)
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
          <button className="primary" onClick={saveMatchWithRoster}>
            Utwórz/Zapisz mecz
          </button>
        </div>
      </div>

      <div className="col">
        <h3>Podgląd listy</h3>
        <div className="panel">
          {picked.length === 0 ? (
            <div>Brak zawodników w składzie</div>
          ) : (
            <ul style={{ paddingLeft: '20px' }}>
              {picked.map((p: any) => (
                <li key={p.player_id}>
                  #{p.number} {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function PlayersPanel({ players, playerForm, setPlayerForm, addPlayer, deletePlayer, loading }: any) {
  return (
    <div className="wrap">
      <div className="col">
        <h3>Zarządzanie zawodnikami</h3>
        
        {/* Add Player Form */}
        <div className="panel">
          <h4>Dodaj nowego zawodnika</h4>
          <div className="two">
            <input
              className="input"
              placeholder="Numer zawodnika"
              value={playerForm.number}
              onChange={e => setPlayerForm({ ...playerForm, number: e.target.value })}
            />
            <input
              className="input"
              placeholder="Imię i nazwisko"
              value={playerForm.name}
              onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })}
            />
          </div>
          <button 
            className="btn primary" 
            onClick={addPlayer}
            disabled={loading || !playerForm.number || !playerForm.name}
          >
            Dodaj zawodnika
          </button>
        </div>

        {/* Players List */}
        <div className="panel">
          <h4>Lista zawodników ({players.length})</h4>
          {players.length === 0 ? (
            <div className="muted">Brak zawodników w bazie</div>
          ) : (
            <div className="grid">
              {players.map((player: Player) => (
                <div key={player.player_id} className="card">
                  <div style={{ fontWeight: 'bold', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    #{player.number} {player.name}
                  </div>
                  <div className="muted small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ID: {player.player_id}
                  </div>
                  <button
                    className="btn danger small"
                    onClick={() => deletePlayer(player.player_id)}
                    disabled={loading}
                    style={{ marginTop: '8px', width: '100%' }}
                  >
                    Usuń
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchesPanel({ matches, archiveMatch, openEditMatch, loading }: any) {
  return (
    <div className="wrap">
      <div className="col">
        <h3>Zarządzanie meczami</h3>
        
        <div className="panel">
          <h4>Lista meczów ({matches.length})</h4>
          {matches.length === 0 ? (
            <div className="muted">Brak meczów w bazie</div>
          ) : (
            <div className="grid">
              {matches.map((match: Match) => (
                <div key={match.match_id} className="card">
                  <div style={{ fontWeight: 'bold', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {match.opponent ? `vs ${match.opponent}` : match.match_id}
                  </div>
                  <div className="muted small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {match.date && `${match.date} • `}{match.ageCategory}{match.place && ` • ${match.place}`}
                  </div>
                  <div className="muted small" style={{ marginTop: '4px' }}>
                    Status: <span style={{ color: match.status === 'active' ? '#51cf66' : '#ff6b6b' }}>
                      {match.status === 'active' ? 'Aktywny' : 'Zakończony'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="btn small"
                      onClick={() => openEditMatch(match)}
                      disabled={loading}
                      style={{ flex: 1 }}
                    >
                      Edytuj
                    </button>
                    <button
                      className="btn danger small"
                      onClick={() => archiveMatch(match.match_id)}
                      disabled={loading}
                      style={{ flex: 1 }}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

