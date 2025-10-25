'use client'

import { useEffect, useState, useCallback } from 'react'
import { getOfflineQueue } from '@/lib/offline-queue'

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
  recentEvents: any[]
}

const FLAG_LABELS: Record<string, string> = {
  is_goal_from_play: 'G z gry',
  is_goal_from_center: 'G z 2m',
  is_goal_5m: 'G 5m',
  is_assist: 'Asysty',
  is_excl_drawn: 'Sprow. wykl.',
  is_excl_committed: 'Wykl. spowod.',
  is_penalty_drawn: 'Sprow. karny',
  is_penalty_committed: 'Karny spowod.',
  is_turnover_1v1: 'Strata 1:1',
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
  // Phase-specific labels
  is_goal_from_play_positional: 'G z gry (poz.)',
  is_goal_from_play_man_up: 'G z gry (przew.)',
  is_goal_from_center_positional: 'G z 2m (poz.)',
  is_goal_from_center_man_up: 'G z 2m (przew.)',
  is_goal_5m_positional: 'G 5m (poz.)',
  is_goal_5m_man_up: 'G 5m (przew.)',
  is_assist_positional: 'Asysty (poz.)',
  is_assist_man_up: 'Asysty (przew.)',
  is_excl_drawn_positional: 'Sprow. wykl. (poz.)',
  is_excl_drawn_man_up: 'Sprow. wykl. (przew.)',
  is_excl_committed_positional: 'Wykl. spowod. (poz.)',
  is_excl_committed_man_up: 'Wykl. spowod. (przew.)',
  is_penalty_drawn_positional: 'Sprow. karny (poz.)',
  is_penalty_drawn_man_up: 'Sprow. karny (przew.)',
  is_penalty_committed_positional: 'Karny spowod. (poz.)',
  is_penalty_committed_man_up: 'Karny spowod. (przew.)',
  is_turnover_1v1_positional: 'Strata 1:1 (poz.)',
  is_turnover_1v1_man_up: 'Strata 1:1 (przew.)',
  is_bad_pass_turnover_positional: 'Złe podanie str. (poz.)',
  is_bad_pass_turnover_man_up: 'Złe podanie str. (przew.)',
  is_bad_pass_no_turnover_positional: 'Złe podanie bez str. (poz.)',
  is_bad_pass_no_turnover_man_up: 'Złe podanie bez str. (przew.)',
  is_shot_clock_violation_positional: 'Koniec czasu (poz.)',
  is_shot_clock_violation_man_up: 'Koniec czasu (przew.)',
  is_shot_saved_gk_positional: 'Obrona GK (poz.)',
  is_shot_saved_gk_man_up: 'Obrona GK (przew.)',
  is_shot_miss_turnover_positional: 'Rzut niecelny str. (poz.)',
  is_shot_miss_turnover_man_up: 'Rzut niecelny str. (przew.)',
  is_shot_miss_reset30_positional: 'Rzut niecelny 30s (poz.)',
  is_shot_miss_reset30_man_up: 'Rzut niecelny 30s (przew.)',
  is_steal_positional: 'Przejęcie (poz.)',
  is_steal_man_up: 'Przejęcie (przew.)',
  is_block_hand_positional: 'Blok (poz.)',
  is_block_hand_man_up: 'Blok (przew.)',
  is_no_block_positional: 'Brak bloku (poz.)',
  is_no_block_man_up: 'Brak bloku (przew.)',
  is_no_return_positional: 'Brak powrotu (poz.)',
  is_no_return_man_up: 'Brak powrotu (przew.)',
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
    recentEvents: [],
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
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online')
  const [queuedRequests, setQueuedRequests] = useState(0)
  const [localQuarter, setLocalQuarter] = useState<number>(1)
  const [wasOffline, setWasOffline] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1400)
  }, [])

  const getActionLabel = useCallback((def: any, attackMode: string) => {
    const act = def?.action || def
    const isManUp = attackMode === 'man_up'
    const phase = def?.phase || 'positional'

    switch (act) {
      case 'goal_play_pos': 
        return phase === 'counter' ? 'G z kontrataku' : 'G z akcji (poz.)'
      case 'goal_center_manup': 
        return isManUp ? 'G z centra (przew.)' : 'G z centra (poz.)'
      case 'goal_5m': return 'G z 5m (przew.)'
      case 'goal_penalty': return 'G z karnego'
      case 'assist': 
        return isManUp ? 'Asysta (przew.)' : 'Asysta (poz.)'
      case 'shot_saved': 
        return isManUp ? 'Obrona GK (przew.)' : 'Obrona GK (poz.)'
      case 'miss_turnover': 
        return isManUp ? 'Niecelny rzut - strata (przew.)' : 'Niecelny rzut - strata (poz.)'
      case 'miss_reset': 
        return isManUp ? 'Niecelny rzut - 30s (przew.)' : 'Niecelny rzut - 30s (poz.)'
      case 'bad_pass_turnover': 
        return isManUp ? 'Złe podanie - strata (przew.)' : 'Złe podanie - strata (poz.)'
      case 'bad_pass_no': 
        return isManUp ? 'Złe podanie - bez straty (przew.)' : 'Złe podanie - bez straty (poz.)'
      case 'turnover_1v1': 
        return isManUp ? 'Strata 1:1 (przew.)' : 'Strata 1:1 (poz.)'
      case 'shot_clock': 
        return isManUp ? 'Koniec czasu (przew.)' : 'Koniec czasu (poz.)'
      case 'excl_drawn_field': return 'Sprow. wykl. - w polu (poz.)'
      case 'excl_drawn_center': return 'Sprow. wykl. - z centra (poz.)'
      case 'penalty_drawn_field': return 'Sprow. karny - w polu (poz.)'
      case 'penalty_drawn_center': return 'Sprow. karny - z centra (poz.)'
      case 'no_return': 
        return isManUp ? 'Brak powrotu (przew.)' : 'Brak powrotu (poz.)'
      case 'excl_comm_field': 
        return isManUp ? 'Wykl. spowod. - w polu (przew.)' : 'Wykl. spowod. - w polu (poz.)'
      case 'excl_comm_center': 
        return isManUp ? 'Wykl. spowod. - z centra (przew.)' : 'Wykl. spowod. - z centra (poz.)'
      case 'pen_comm_field': 
        return isManUp ? 'Karny spowod. - w polu (przew.)' : 'Karny spowod. - w polu (poz.)'
      case 'pen_comm_center': 
        return isManUp ? 'Karny spowod. - z centra (przew.)' : 'Karny spowod. - z centra (poz.)'
      case 'shot_saved_def':
        return isManUp ? 'Obrona GK def (przew.)' : 'Obrona GK def (poz.)'
      case 'steal': 
        return isManUp ? 'Przejęcie (przew.)' : 'Przejęcie (poz.)'
      case 'block': 
        return isManUp ? 'Blok (przew.)' : 'Blok (poz.)'
      case 'no_block': 
        return isManUp ? 'Brak bloku (przew.)' : 'Brak bloku (poz.)'
      default: return 'Nieznana akcja'
    }
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
    const queue = getOfflineQueue()
    
    try {
      const res = await queue.fetch(endpoint, {
        ...options,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          ...options?.headers
        }
      })
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || 'API Error')
      }
      
      // Success - update status
      setConnectionStatus(queue.getConnectionStatus())
      setQueuedRequests(queue.getQueueLength())
      
      return res.json()
    } catch (error: any) {
      // Update connection status and queue length
      setConnectionStatus(queue.getConnectionStatus())
      setQueuedRequests(queue.getQueueLength())
      
      // Check if request was queued (from network error)
      if (error?.queued) {
        if (endpoint.includes('/api/events')) {
          showToast('Brak zasięgu - zdarzenie zapisane w kolejce')
          return { ok: true, queued: true }
        } else if (endpoint.includes('/api/stats/score')) {
          showToast('Brak zasięgu - wynik zapisany w kolejce')
          return { ok: true, queued: true }
        } else if (endpoint.includes('/api/settings/quarter')) {
          showToast('Brak zasięgu - zmiana kwarty zapisana w kolejce')
          return { ok: true, queued: true }
        } else if (endpoint.includes('/api/matches/end')) {
          showToast('Brak zasięgu - zakończenie meczu zapisane w kolejce')
          return { ok: true, queued: true }
        } else {
          showToast('Brak zasięgu - żądanie zapisane w kolejce')
          return { ok: true, queued: true }
        }
      }
      
      throw error
    }
  }, [showToast])

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
      
      // Initialize local quarter from server
      if (data.settings?.Quarter) {
        setLocalQuarter(data.settings.Quarter)
      }
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

  const loadRecentEvents = useCallback(async () => {
    const matchId = state.settings?.ActiveMatch
    if (!matchId) return
    
    try {
      const events = await callApi(`/api/events/${matchId}?limit=20`)
      setState(prev => ({ ...prev, recentEvents: events }))
      
      // Save to localStorage for offline fallback
      try {
        localStorage.setItem(`events_${matchId}`, JSON.stringify(events))
      } catch (e) {
        console.warn('Failed to save events to localStorage:', e)
      }
    } catch (e: any) {
      console.error('Error loading events:', e)
      
      // Try to load from localStorage as fallback
      try {
        const cachedEvents = localStorage.getItem(`events_${matchId}`)
        if (cachedEvents) {
          const events = JSON.parse(cachedEvents)
          setState(prev => ({ ...prev, recentEvents: events }))
          showToast('Ładowanie z pamięci lokalnej (offline)')
          return
        }
      } catch (cacheError) {
        console.warn('Failed to load events from localStorage:', cacheError)
      }
      
      showToast(e.message || 'Błąd ładowania eventów')
    }
  }, [state.settings, callApi, showToast])

  const deleteEvent = useCallback(async (eventId: string) => {
    if (!isMatchActive()) {
      return showToast('Mecz jest zakończony - edycja zablokowana')
    }
    
    // Check if we're offline
    if (connectionStatus === 'offline') {
      // For offline mode, remove from local state, localStorage AND from offline queue
      const matchId = state.settings?.ActiveMatch
      if (matchId) {
        // Remove from offline queue first
        const queue = getOfflineQueue()
        queue.removeFromQueue(eventId)
        
        // Remove event from local state immediately
        setState(prev => ({
          ...prev,
          recentEvents: prev.recentEvents.filter(event => event.id !== eventId)
        }))
        
        // Update localStorage
        try {
          const updatedEvents = state.recentEvents.filter(event => event.id !== eventId)
          localStorage.setItem(`events_${matchId}`, JSON.stringify(updatedEvents))
        } catch (cacheError) {
          console.warn('Failed to update localStorage:', cacheError)
        }
        
        showToast('Event usunięty (offline)')
        return
      }
    }
    
    // Online mode - use API
    try {
      await callApi('/api/events/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      
      showToast('Event usunięty')
      // Refresh events list
      await loadRecentEvents()
      // Refresh stats if in stats mode
      if (mode === 'stats' && state.stats) {
        refreshStats()
      }
    } catch (e: any) {
      showToast(e.message || 'Błąd usuwania eventu')
    }
  }, [isMatchActive, connectionStatus, callApi, showToast, loadRecentEvents, mode, state.stats, refreshStats, state.settings, state.recentEvents])

  useEffect(() => {
    bootstrap()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Monitor connection status and queue
  useEffect(() => {
    const queue = getOfflineQueue()
    
    const updateStatus = () => {
      const status = queue.getConnectionStatus()
      const queueLength = queue.getQueueLength()
      
      console.log(`[${new Date().toISOString()}] 🔄 UI UPDATE: Status=${status}, Queue=${queueLength}`)
      
      setConnectionStatus(status)
      setQueuedRequests(queueLength)
      
      // Track if we were offline
      if (status === 'offline') {
        setWasOffline(true)
      }
    }
    
    // Initial update
    updateStatus()
    
    // Update every 2 seconds
    const interval = setInterval(updateStatus, 2000)
    
    // Listen for queue processed events
    const handleQueueProcessed = async () => {
      updateStatus()
      showToast('Zsynchronizowano wszystkie żądania')
      
      // Refresh data after sync
      await bootstrap()
      
      // Refresh events list after sync
      if (mode === 'score') {
        await loadRecentEvents()
      }
      
      // Reset local quarter to server value after sync only if we were offline
      if (wasOffline) {
        setLocalQuarter(state.settings?.Quarter || 1)
        setWasOffline(false)
      }
    }
    
    window.addEventListener('queueProcessed', handleQueueProcessed)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('queueProcessed', handleQueueProcessed)
    }
  }, [showToast])

  // Warning before page refresh when offline
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const queue = getOfflineQueue()
      const isOffline = queue.getConnectionStatus() === 'offline'
      
      if (isOffline) {
        const message = 'Aplikacja jest w trybie offline. Odświeżenie strony może spowodować utratę danych. Czy na pewno chcesz odświeżyć?'
        
        // Standard way to show browser warning
        event.preventDefault()
        event.returnValue = message
        
        // For older browsers
        return message
      }
    }
    
    // Safari-specific handling for iOS/iPad
    const handlePageHide = (event: PageTransitionEvent) => {
      const queue = getOfflineQueue()
      const isOffline = queue.getConnectionStatus() === 'offline'
      
      if (isOffline && !event.persisted) {
        // Safari on iOS doesn't always respect beforeunload
        // This provides additional protection
        event.preventDefault()
        return false
      }
    }
    
    // Handle Safari-specific events
    const handleVisibilityChange = () => {
      const queue = getOfflineQueue()
      const isOffline = queue.getConnectionStatus() === 'offline'
      
      if (isOffline && document.hidden) {
        // Show warning when tab becomes hidden (Safari behavior)
        alert('⚠️ Aplikacja jest w trybie offline. Nie zamykaj karty!')
      }
    }
    
    // Detect if we're on Safari/iOS
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Add Safari/iOS specific listeners
    if (isSafari || isIOS) {
      window.addEventListener('pagehide', handlePageHide)
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (isSafari || isIOS) {
        window.removeEventListener('pagehide', handlePageHide)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  const setQuarter = async (q: number, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) addButtonPressEffect(event.currentTarget)
    if (!isMatchActive()) {
      return showToast('Mecz jest zakończony - edycja zablokowana')
    }
    
    // Use local quarter when offline, server quarter when online
    const currentQuarter = connectionStatus === 'offline' ? localQuarter : (state.settings?.Quarter || 1)
    
    // Show popup to enter score for CURRENT quarter (the one we're leaving)
    setQuarterScorePopup({
      show: true,
      quarter: currentQuarter, // Score for current quarter
      myScore: '',
      oppScore: ''
    })
    
    // Store the target quarter to switch to after saving score
    setTargetQuarter(q)
    
    // If offline, immediately update local quarter (without score popup)
    if (connectionStatus === 'offline') {
      setLocalQuarter(q)
      showToast(`Przełączono na Q${q} (offline)`)
    }
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
    // Use local quarter when offline, server quarter when online
    const currentQuarter = connectionStatus === 'offline' ? localQuarter : (state.settings?.Quarter || 1)
    
    // Generate local event ID for offline tracking
    const localEventId = `temp_${Date.now()}`
    
    const base: any = {
      match_id: state.settings?.ActiveMatch,
      quarter: currentQuarter,
      team: 'my',
      player_id: state.selected.player_id,
      player_name: state.selected.name,
      note,
    }

    const flags: any = {}
    const act = def?.action || def
    const isManUp = attackMode === 'man_up'

    switch (act) {
      // ATAK POZYCYJNY
      case 'goal_play_pos': 
        if (phase === 'counter') {
          flags.is_goal_from_play_counter = 1
        } else {
          flags.is_goal_from_play_positional = 1
        }
        break
      case 'goal_center_manup': 
        if (isManUp) {
          flags.is_goal_from_center_man_up = 1
        } else {
          flags.is_goal_from_center_positional = 1
        }
        break
      case 'goal_5m': flags.is_goal_5m_man_up = 1; break
      case 'assist': 
        if (isManUp) {
          flags.is_assist_man_up = 1
        } else {
          flags.is_assist_positional = 1
        }
        break
      case 'shot_saved': 
        if (isManUp) {
          flags.is_shot_saved_gk_man_up = 1
        } else {
          flags.is_shot_saved_gk_positional = 1
        }
        break
      case 'miss_turnover': 
        if (isManUp) {
          flags.is_shot_miss_turnover_man_up = 1
        } else {
          flags.is_shot_miss_turnover_positional = 1
        }
        break
      case 'miss_reset': 
        if (isManUp) {
          flags.is_shot_miss_reset30_man_up = 1
        } else {
          flags.is_shot_miss_reset30_positional = 1
        }
        break
      case 'bad_pass_turnover': 
        if (isManUp) {
          flags.is_bad_pass_turnover_man_up = 1
        } else {
          flags.is_bad_pass_turnover_positional = 1
        }
        break
      case 'bad_pass_no': 
        if (isManUp) {
          flags.is_bad_pass_no_turnover_man_up = 1
        } else {
          flags.is_bad_pass_no_turnover_positional = 1
        }
        break
      case 'turnover_1v1': 
        if (isManUp) {
          flags.is_turnover_1v1_man_up = 1
        } else {
          flags.is_turnover_1v1_positional = 1
        }
        break
      case 'shot_clock': 
        if (isManUp) {
          flags.is_shot_clock_violation_man_up = 1
        } else {
          flags.is_shot_clock_violation_positional = 1
        }
        break
      case 'excl_drawn_field': flags.is_excl_drawn_field_positional = 1; break
      case 'excl_drawn_center': flags.is_excl_drawn_center_positional = 1; break
      case 'penalty_drawn_field': flags.is_penalty_drawn_field_positional = 1; break
      case 'penalty_drawn_center': flags.is_penalty_drawn_center_positional = 1; break
      
      // RZUTY KARNE
      case 'goal_penalty': flags.is_goal_5m_penalty = 1; break
      
      // OBRONA (przyciski bez phase, ale zapisujemy z podziałem na fazy)
      case 'no_return': 
        if (isManUp) {
          flags.is_no_return_man_up = 1
        } else {
          flags.is_no_return_positional = 1
        }
        break
      case 'excl_comm_field': 
        if (isManUp) {
          flags.is_excl_committed_field_man_up = 1
        } else {
          flags.is_excl_committed_field_positional = 1
        }
        break
      case 'excl_comm_center': 
        if (isManUp) {
          flags.is_excl_committed_center_man_up = 1
        } else {
          flags.is_excl_committed_center_positional = 1
        }
        break
      case 'pen_comm_field': 
        if (isManUp) {
          flags.is_penalty_committed_field_man_up = 1
        } else {
          flags.is_penalty_committed_field_positional = 1
        }
        break
      case 'pen_comm_center': 
        if (isManUp) {
          flags.is_penalty_committed_center_man_up = 1
        } else {
          flags.is_penalty_committed_center_positional = 1
        }
        break
      case 'shot_saved_def':
        if (isManUp) {
          flags.is_shot_saved_gk_def_man_up = 1
        } else {
          flags.is_shot_saved_gk_def_positional = 1
        }
        break
      case 'steal': 
        if (isManUp) {
          flags.is_steal_man_up = 1
        } else {
          flags.is_steal_positional = 1
        }
        break
      case 'block': 
        if (isManUp) {
          flags.is_block_hand_man_up = 1
        } else {
          flags.is_block_hand_positional = 1
        }
        break
      case 'no_block': 
        if (isManUp) {
          flags.is_no_block_man_up = 1
        } else {
          flags.is_no_block_positional = 1
        }
        break
      default: break
    }

    const payload = { ...base, ...flags }

    try {
      let result
      
      // If offline, use special method to track the request
      if (connectionStatus === 'offline') {
        const queue = getOfflineQueue()
        try {
          // Try to add to queue with local ID
          queue.addToQueueWithLocalId('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: [payload] }),
          }, localEventId)
          
          result = { ok: true, queued: true }
        } catch (error: any) {
          // If queueing fails, throw error
          throw error
        }
      } else {
        // Online mode - use normal API
        result = await callApi('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: [payload] }),
        })
      }
      
      setNote('')
      
      // If request was queued, don't refresh stats (will sync later)
      if (result?.queued) {
        // Don't show "Zapisano" toast - already shown by callApi
        // But we can simulate adding the event to local state for immediate feedback
        const matchId = state.settings?.ActiveMatch
        if (matchId && state.selected) {
          // Create a temporary event object for immediate display with proper action
          const tempEvent = {
            id: localEventId, // Use the same ID as in the queue
            timestamp: new Date().toISOString(),
            quarter: connectionStatus === 'offline' ? localQuarter : (state.settings?.Quarter || 1),
            playerName: state.selected.name,
            playerNumber: state.selected.number, // Add player number for display
            eventType: '',
            note: note,
            action: getActionLabel(def, attackMode) // Show proper action label
          }
          
          // Add to local state immediately
          setState(prev => ({
            ...prev,
            recentEvents: [tempEvent, ...prev.recentEvents.slice(0, 19)] // Keep only 20 events
          }))
          
          // Update localStorage
          try {
            const currentEvents = state.recentEvents
            const updatedEvents = [tempEvent, ...currentEvents.slice(0, 19)]
            localStorage.setItem(`events_${matchId}`, JSON.stringify(updatedEvents))
          } catch (cacheError) {
            console.warn('Failed to update localStorage:', cacheError)
          }
        }
        return
      }
      
      showToast('Zapisano')
      // Refresh events list
      await loadRecentEvents()
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
      
      // If score was queued, don't update state yet
      if (!scores?.queued) {
        setState(prev => ({
          ...prev,
          stats: { ...(prev.stats || {}), scores },
        }))
      }
      
      // Now update the quarter to target quarter (the one we want to switch to)
      const targetQ = targetQuarter || quarterScorePopup.quarter
      const s = await callApi('/api/settings/quarter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quarter: targetQ }),
      })
      
      // If quarter change was queued, don't update state yet
      if (!s?.queued) {
        setState(prev => ({ ...prev, settings: s }))
      } else {
        // Update local quarter when offline
        setLocalQuarter(targetQ)
      }
      
      setQuarterScorePopup({ show: false, quarter: 1, myScore: '', oppScore: '' })
      setTargetQuarter(null)
      
      // Show appropriate toast
      if (scores?.queued || s?.queued) {
        showToast(`Wynik Q${quarterScorePopup.quarter} i zmiana na Q${targetQ} zapisane w kolejce`)
      } else {
        showToast(`Zapisano wynik Q${quarterScorePopup.quarter} i przełączono na Q${targetQ}`)
      }
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
      const result = await callApi('/api/matches/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      })
      
      setEndMatchPopup(false)
      
      // If request was queued, show appropriate message
      if (result?.queued) {
        showToast('Brak zasięgu - zakończenie meczu zapisane w kolejce')
      } else {
        showToast('Mecz zakończony - edycja zablokowana')
        // Refresh data to show updated status
        bootstrap()
      }
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
    } else if (mode === 'score') {
      loadRecentEvents()
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load events when match changes
  useEffect(() => {
    if (state.settings?.ActiveMatch && mode === 'score') {
      loadRecentEvents()
    }
  }, [state.settings?.ActiveMatch, mode, loadRecentEvents])

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
              Kwarta: <span>{connectionStatus === 'offline' ? localQuarter : (state.settings?.Quarter || '—')}</span>
            </div>
            {[1, 2, 3, 4].map(q => {
              const currentQ = connectionStatus === 'offline' ? localQuarter : (state.settings?.Quarter || 1)
              return (
                <button
                  key={q}
                  className={'qbtn' + (currentQ === q ? ' selected' : '')}
                  onClick={(e) => setQuarter(q, e)}
                  disabled={!isMatchActive()}
                >
                  Q{q}
                </button>
              )
            })}
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
        
        {/* Connection Status Indicator */}
        <div className="tag" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          backgroundColor: connectionStatus === 'online' ? '#0d290d' : '#2d1b1b',
          borderColor: connectionStatus === 'online' ? '#51cf66' : '#ff6b6b'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: connectionStatus === 'online' ? '#51cf66' : '#ff6b6b',
            boxShadow: connectionStatus === 'online' ? '0 0 8px rgba(81, 207, 102, 0.6)' : '0 0 8px rgba(255, 107, 107, 0.6)',
            animation: connectionStatus === 'online' ? 'pulse 2s ease-in-out infinite' : 'none'
          }} />
          <span className="small">
            {connectionStatus === 'online' ? 'Online' : 'Offline'}
            {queuedRequests > 0 && ` (${queuedRequests})`}
          </span>
          {queuedRequests > 0 && connectionStatus === 'online' && (
            <button 
              className="btn small" 
              onClick={() => {
                const queue = getOfflineQueue();
                console.log('🔄 MANUAL SYNC: Triggering queue processing');
                // Force process queue
                (queue as any).processQueue();
              }}
              style={{ 
                padding: '2px 6px', 
                fontSize: '10px',
                backgroundColor: '#4cc9f0',
                borderColor: '#4cc9f0',
                color: 'white'
              }}
            >
              Sync
            </button>
          )}
        </div>
        
        {/* Offline Warning */}
        {connectionStatus === 'offline' && (
          <div className="tag" style={{
            backgroundColor: '#2d1b00',
            borderColor: '#d4a574',
            color: '#d4a574',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <span style={{ fontSize: '14px' }}>⚠️</span>
            <span className="small">
              Offline - Nie odświeżaj strony!{queuedRequests > 0 && ` (${queuedRequests} żądań w kolejce)`}
            </span>
          </div>
        )}
        
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
                  <button className="btn" onClick={(e) => submitEvent('shot_saved_def', e)}>
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

          {/* Recent Events - moved to bottom */}
          <div className="panel" style={{ marginTop: '20px' }}>
            <div className="subhead">Ostatnie eventy</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="muted small">
                Ostatnie {state.recentEvents.length} eventów
              </div>
              <button 
                className="btn small" 
                onClick={loadRecentEvents}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                Odśwież
              </button>
            </div>
            
            {state.recentEvents.length === 0 ? (
              <div className="muted small" style={{ padding: '12px', textAlign: 'center' }}>
                Brak eventów dla tego meczu
              </div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {state.recentEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="card" 
                    style={{ 
                      marginBottom: '8px', 
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        #{event.playerNumber || (() => {
                          // Find player number from rosterActive for events from server
                          const player = state.rosterActive.find(p => p.name === event.playerName)
                          return player?.number || '?'
                        })()} {event.playerName}
                      </div>
                      <div className="muted small" style={{ marginTop: '2px' }}>
                        Q{event.quarter} • {new Date(event.timestamp).toLocaleTimeString('pl-PL', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>
                        {event.action}
                      </div>
                      {event.note && (
                        <div className="muted small" style={{ marginTop: '4px', fontStyle: 'italic' }}>
                          "{event.note}"
                        </div>
                      )}
                    </div>
                    <button
                      className="btn danger small"
                      onClick={() => {
                        if (confirm('Czy na pewno chcesz usunąć ten event?')) {
                          deleteEvent(event.id)
                        }
                      }}
                      disabled={!isMatchActive()}
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '11px',
                        marginLeft: '8px'
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                      
                      // If request was queued, don't update state yet
                      if (!s?.queued) {
                        setState(prev => ({ ...prev, settings: s }))
                        showToast(`Przełączono na Q${targetQuarter}`)
                      } else {
                        // Update local quarter when offline
                        setLocalQuarter(targetQuarter)
                        showToast(`Przełączono na Q${targetQuarter} (offline)`)
                      }
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
    const keys = [
      'is_goal_from_play_positional',
      'is_goal_from_play_counter', 
      'is_goal_from_center_positional',
      'is_goal_from_center_man_up',
      'is_goal_5m_man_up',
      'is_goal_5m_penalty'
    ]
    return keys.reduce((a, k) => a + (Number(obj?.[k] || 0)), 0)
  }

  const buildTable = (rows: any[], title: string, totalsObj: any, flags: string[]) => {
    if (!rows.length) return <div className="muted">Brak danych</div>

    // Create player lookup
    const playersById = Object.fromEntries(stats.players.map((p: any) => [p.player_id, p]))
    
    // Define stats exactly as they appear in assistant - grouped by phase
    const statGroups = [
      {
        title: '🏐 ATAK POZYCYJNY',
        stats: [
          { key: 'is_goal_from_play_positional', label: 'G z akcji' },
          { key: 'is_goal_from_play_counter', label: 'G z kontrataku' },
          { key: 'is_goal_from_center_positional', label: 'G z centra' },
          { key: 'is_assist_positional', label: 'Asysty' },
          { key: 'is_shot_saved_gk_positional', label: 'Obrona bramkarza' },
          { key: 'is_shot_miss_turnover_positional', label: 'Niecelny rzut – strata' },
          { key: 'is_shot_miss_reset30_positional', label: 'Niecelny rzut – 30s' },
          { key: 'is_bad_pass_turnover_positional', label: 'Niecelne podanie – strata' },
          { key: 'is_bad_pass_no_turnover_positional', label: 'Niecelne podanie – bez straty' },
          { key: 'is_turnover_1v1_positional', label: 'Strata 1:1' },
          { key: 'is_shot_clock_violation_positional', label: 'Koniec czasu' },
          { key: 'is_excl_drawn_field_positional', label: 'Sprow. wykl. – w polu' },
          { key: 'is_excl_drawn_center_positional', label: 'Sprow. wykl. – z centra' },
          { key: 'is_penalty_drawn_field_positional', label: 'Sprow. karny – w polu' },
          { key: 'is_penalty_drawn_center_positional', label: 'Sprow. karny – z centra' },
        ]
      },
      {
        title: '⚡ ATAK PRZEWAGA',
        stats: [
          { key: 'is_goal_from_center_man_up', label: 'G z 2 metra' },
          { key: 'is_goal_5m_man_up', label: 'G z 5 metra' },
          { key: 'is_assist_man_up', label: 'Asysty' },
          { key: 'is_shot_saved_gk_man_up', label: 'Obrona bramkarza' },
          { key: 'is_shot_miss_turnover_man_up', label: 'Niecelny rzut – strata' },
          { key: 'is_shot_miss_reset30_man_up', label: 'Niecelny rzut – 30s' },
          { key: 'is_bad_pass_turnover_man_up', label: 'Niecelne podanie – strata' },
          { key: 'is_bad_pass_no_turnover_man_up', label: 'Niecelne podanie – bez straty' },
          { key: 'is_turnover_1v1_man_up', label: 'Strata 1:1' },
          { key: 'is_shot_clock_violation_man_up', label: 'Koniec czasu' },
        ]
      },
      {
        title: '🎯 RZUTY KARNE',
        stats: [
          { key: 'is_goal_5m_penalty', label: 'Bramka z karnego' },
        ]
      },
      {
        title: '🛡️ OBRONA POZYCYJNA',
        stats: [
          { key: 'is_no_return_positional', label: 'Brak powrotu' },
          { key: 'is_excl_committed_field_positional', label: 'Wykl. spowod. – w polu' },
          { key: 'is_excl_committed_center_positional', label: 'Wykl. spowod. – z centra' },
          { key: 'is_penalty_committed_field_positional', label: 'Karny spowod. – w polu' },
          { key: 'is_penalty_committed_center_positional', label: 'Karny spowod. – z centra' },
          { key: 'is_shot_saved_gk_def_positional', label: 'Obrona bramkarza' },
          { key: 'is_steal_positional', label: 'Przejęcie piłki' },
          { key: 'is_block_hand_positional', label: 'Blok' },
          { key: 'is_no_block_positional', label: 'Brak bloku' },
        ]
      },
      {
        title: '🛡️ OBRONA PRZEWAGA',
        stats: [
          { key: 'is_no_return_man_up', label: 'Brak powrotu' },
          { key: 'is_excl_committed_field_man_up', label: 'Wykl. spowod. – w polu' },
          { key: 'is_excl_committed_center_man_up', label: 'Wykl. spowod. – z centra' },
          { key: 'is_penalty_committed_field_man_up', label: 'Karny spowod. – w polu' },
          { key: 'is_penalty_committed_center_man_up', label: 'Karny spowod. – z centra' },
          { key: 'is_shot_saved_gk_def_man_up', label: 'Obrona bramkarza' },
          { key: 'is_steal_man_up', label: 'Przejęcie piłki' },
          { key: 'is_block_hand_man_up', label: 'Blok' },
          { key: 'is_no_block_man_up', label: 'Brak bloku' },
        ]
      }
    ]

    // Build all stat rows with group headers
    const allStatRows: any[] = []
    
    statGroups.forEach(group => {
      // Add group header row
      allStatRows.push({ isGroupHeader: true, groupTitle: group.title })
      
      group.stats.forEach(stat => {
        const row: any = { stat: stat.label, flag: stat.key }
        rows.forEach(playerRow => {
          const playerKey = playerRow.name
          row[playerKey] = playerRow[stat.key] || 0
        })
        row._total = totalsObj ? (totalsObj[stat.key] || 0) : 0
        allStatRows.push(row)
      })
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
            {allStatRows.map((row, i) => {
              if (row.isGroupHeader) {
                return (
                  <tr key={`group-${i}`} style={{ backgroundColor: '#1f2e40', color: 'white' }}>
                    <td colSpan={2 + rows.length} style={{ fontWeight: 700, padding: '8px', fontSize: '14px' }}>
                      {row.groupTitle}
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={row.flag}>
                  <td>{row.stat}</td>
                  <td style={{ fontWeight: 600 }}>{row._total}</td>
                  {rows.map(playerRow => (
                    <td key={playerRow.name}>{row[playerRow.name]}</td>
                  ))}
                </tr>
              )
            })}
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

