import { useEffect, useMemo, useState } from 'react'
import { EVENT_CONFIG } from './config/eventConfig.js'
import { supabase } from './lib/supabase.js'

const SAKE_OPTIONS = EVENT_CONFIG.items.map(item => item.id)
const FLAVOR_AMOUNTS = EVENT_CONFIG.flavorAmounts
const BASE_AMOUNT = EVENT_CONFIG.baseAmount
const TOTAL_AMOUNT = EVENT_CONFIG.totalAmount
const MAX_TICKETS = 30
const STORAGE_KEY = 'event-blend-answers-v1'

function loadAnswers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const ITEM_NAMES = Object.fromEntries(
  EVENT_CONFIG.items.map(item => [item.id, `${item.id} ${item.name}`])
)

function sakeName(number) {
  return ITEM_NAMES[number] || `${number}`
}

function rowToAnswer(row) {
  return {
    ticket: Number(row.ticket_number),
    base: Number(row.base_sake),
    second: Number(row.flavor1_sake),
    secondAmount: Number(row.flavor1_amount),
    third: Number(row.flavor2_sake),
    thirdAmount: Number(row.flavor2_amount),
    createdAt: row.created_at,
  }
}

function formatDateTime(value) {
  if (!value) return '未読み込み'
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(value))
}

function GroupCard({ title, groups, emptyText }) {
  return (
    <section className="card group-card">
      <h2>{title}</h2>
      {groups.length === 0 ? <p className="muted">{emptyText}</p> : groups.map(group => (
        <div className="group" key={group.key}>
          <p className="group-label">{group.label}</p>
          <div className="ticket-list">
            {group.tickets.map(ticket => <span className="ticket-chip" key={ticket}>{ticket}</span>)}
          </div>
        </div>
      ))}
    </section>
  )
}

export default function App() {
  const [tab, setTab] = useState('entry')
  const [answers, setAnswers] = useState(loadAnswers)
  const [form, setForm] = useState({ ticket: '', base: '1', second: '2', secondAmount: '10', third: '3' })
  const [ticketLocked, setTicketLocked] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingAnswer, setExistingAnswer] = useState(null)
  const [checkingAnswer, setCheckingAnswer] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState(false)
  const [answerLoadError, setAnswerLoadError] = useState('')
  const [loadingAnswers, setLoadingAnswers] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [lastFetchedAt, setLastFetchedAt] = useState(null)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')
  const [presentationMode, setPresentationMode] = useState(false)
  const [presentationStep, setPresentationStep] = useState(0)
  const [presentationRevealed, setPresentationRevealed] = useState(false)
  const [presentationData, setPresentationData] = useState(null)
  const [participantCount, setParticipantCount] = useState(EVENT_CONFIG.totalTickets)
  const [participantCountInput, setParticipantCountInput] = useState(String(EVENT_CONFIG.totalTickets))
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')

  const applyAnswerToForm = answer => {
    setForm({
      ticket: String(answer.ticket),
      base: String(answer.base),
      second: String(answer.second),
      secondAmount: String(answer.secondAmount),
      third: String(answer.third),
    })
  }

  useEffect(() => {
    const loadEventSettings = async () => {
      if (!supabase) {
        setSettingsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('event_settings')
        .select('participant_count, organizer_ticket')
        .eq('id', 1)
        .maybeSingle()

      if (error) {
        console.error('イベント設定取得エラー:', error)
        setAnswerLoadError('参加人数の設定を確認できませんでした。')
      } else if (data) {
        setParticipantCount(data.participant_count)
        setParticipantCountInput(String(data.participant_count))
      }

      setSettingsLoading(false)
    }

    loadEventSettings()
  }, [])

  useEffect(() => {
    if (settingsLoading) return

    const loadParticipantAnswer = async () => {
      const params = new URLSearchParams(window.location.search)
      const ticket = Number(params.get('ticket'))
      if (!Number.isInteger(ticket) || ticket < 1 || ticket > participantCount) return

      setForm(prev => ({ ...prev, ticket: String(ticket) }))
      setTicketLocked(true)
      if (!supabase) {
        setAnswerLoadError('データベース接続設定を確認してください。')
        return
      }

      setCheckingAnswer(true)
      setAnswerLoadError('')
      const { data, error } = await supabase
        .from('answers')
        .select('ticket_number, base_sake, flavor1_sake, flavor1_amount, flavor2_sake, flavor2_amount, created_at')
        .eq('ticket_number', ticket)
        .maybeSingle()
      setCheckingAnswer(false)

      if (error) {
        console.error('回答状況取得エラー:', error)
        setAnswerLoadError(`回答状況を確認できませんでした。${error.message || ''}`)
        return
      }
      if (data) {
        const loaded = rowToAnswer(data)
        setExistingAnswer(loaded)
        applyAnswerToForm(loaded)
        setCompleted(true)
      }
    }

    loadParticipantAnswer()
  }, [settingsLoading, participantCount])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const fetchAnswers = async () => {
    if (!supabase) {
      setLoadError('データベース接続設定を確認してください。')
      return
    }
    setLoadingAnswers(true)
    setLoadError('')
    const { data, error } = await supabase
      .from('answers')
      .select('ticket_number, base_sake, flavor1_sake, flavor1_amount, flavor2_sake, flavor2_amount, created_at')
      .order('ticket_number', { ascending: true })
    setLoadingAnswers(false)
    if (error) {
      console.error('回答一覧取得エラー:', error)
      setLoadError(`回答一覧を読み込めませんでした。${error.message || ''}`)
      return
    }
    setAnswers((data || []).map(rowToAnswer))
    setLastFetchedAt(new Date().toISOString())
  }

  useEffect(() => {
    if (tab === 'admin' && session) fetchAnswers()
  }, [tab, session])

  const saveParticipantCount = async () => {
    const nextCount = Number(participantCountInput)
    if (!Number.isInteger(nextCount) || nextCount < 1 || nextCount > MAX_TICKETS) {
      setSettingsMessage('参加人数は1～30名で入力してください。')
      return
    }
    if (!supabase || !session) {
      setSettingsMessage('集計者としてログインしてください。')
      return
    }

    const excludedTickets = answers
      .filter(answer => answer.ticket > nextCount)
      .map(answer => answer.ticket)
      .sort((a, b) => a - b)

    if (excludedTickets.length > 0) {
      const proceed = window.confirm(
        `札番号${excludedTickets.join('、')}に回答があります。参加人数を${nextCount}名に変更すると集計対象外になります。変更しますか？`
      )
      if (!proceed) return
    }

    setSettingsSaving(true)
    setSettingsMessage('')
    const { error } = await supabase
      .from('event_settings')
      .update({
        participant_count: nextCount,
        organizer_ticket: nextCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
    setSettingsSaving(false)

    if (error) {
      console.error('参加人数設定エラー:', error)
      setSettingsMessage(`参加人数を保存できませんでした。${error.message || ''}`)
      return
    }

    setParticipantCount(nextCount)
    setParticipantCountInput(String(nextCount))
    setSettingsMessage(`参加人数を${nextCount}名に設定しました。主催者番号も${nextCount}番です。`)
  }

  const login = async event => {
    event.preventDefault()
    if (!supabase) return setLoginError('データベース接続設定を確認してください。')
    setLoggingIn(true)
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email.trim(), password: loginForm.password,
    })
    setLoggingIn(false)
    if (error) return setLoginError('メールアドレスまたはパスワードが正しくありません。')
    setLoginForm(prev => ({ ...prev, password: '' }))
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
    setAnswers([])
    setLastFetchedAt(null)
  }

  const deleteAllAnswers = async () => {
    if (!supabase || !session) return setDeleteMessage('集計者としてログインしてください。')
    if (deleteConfirmText !== '削除') return setDeleteMessage('確認欄に「削除」と入力してください。')
    setDeleting(true)
    setDeleteMessage('')
    const { error } = await supabase.from('answers').delete().gte('id', 1)
    setDeleting(false)
    if (error) {
      console.error('削除エラー:', error)
      return setDeleteMessage(`回答を削除できませんでした。${error.message || ''}`)
    }
    setAnswers([])
    setDeleteConfirmText('')
    setDeleteDialogOpen(false)
    setDeleteMessage('全回答を削除しました。')
    setLastFetchedAt(new Date().toISOString())
  }

  const secondAmount = Number(form.secondAmount)
  const thirdAmount = TOTAL_AMOUNT - BASE_AMOUNT - secondAmount
  const totalAmount = BASE_AMOUNT + secondAmount + thirdAmount
  const selectedSakes = [Number(form.base), Number(form.second), Number(form.third)]
  const duplicateSake = new Set(selectedSakes).size !== 3
  const ticketNumber = Number(form.ticket)
  const ticketValid = Number.isInteger(ticketNumber) && ticketNumber >= 1 && ticketNumber <= participantCount
  const amountsValid = FLAVOR_AMOUNTS.includes(secondAmount) && FLAVOR_AMOUNTS.includes(thirdAmount)
  const valid = ticketValid && !duplicateSake && amountsValid && totalAmount === TOTAL_AMOUNT

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setConfirming(false)
    setMessage('')
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (!valid) return setMessage('入力内容を確認してください。札番号、日本酒の重複、配合量をご確認ください。')
    if (!confirming) {
      setConfirming(true)
      return
    }
    if (!supabase) return setMessage('データベース接続設定を確認してください。')

    setSubmitting(true)
    setMessage('')
    const answerRow = {
      ticket_number: ticketNumber,
      base_sake: Number(form.base),
      flavor1_sake: Number(form.second),
      flavor1_amount: secondAmount,
      flavor2_sake: Number(form.third),
      flavor2_amount: thirdAmount,
    }

    const query = editingAnswer
      ? supabase.from('answers').update(answerRow).eq('ticket_number', ticketNumber).select('ticket_number')
      : supabase.from('answers').insert(answerRow).select('ticket_number')
    const { data, error } = await query
    setSubmitting(false)

    if (error) {
      console.error('回答保存エラー:', error)
      setMessage(`回答を保存できませんでした。${error.message || ''}（コード: ${error.code || '不明'}）`)
      return
    }
    if (!data || data.length === 0) {
      setMessage('回答を保存できませんでした。更新対象が見つからないか、データベース権限が不足しています。')
      return
    }

    const saved = {
      ticket: ticketNumber,
      base: Number(form.base),
      second: Number(form.second),
      secondAmount,
      third: Number(form.third),
      thirdAmount,
      createdAt: existingAnswer?.createdAt || new Date().toISOString(),
    }
    setExistingAnswer(saved)
    setAnswers(prev => [...prev.filter(a => a.ticket !== ticketNumber), saved].sort((a, b) => a.ticket - b.ticket))
    setConfirming(false)
    setEditingAnswer(false)
    setCompleted(true)
  }

  const startEditing = () => {
    if (!existingAnswer) return
    applyAnswerToForm(existingAnswer)
    setMessage('')
    setConfirming(false)
    setEditingAnswer(true)
    setCompleted(false)
    setTab('entry')
  }

  const cancelEditing = () => {
    setMessage('')
    setConfirming(false)
    setEditingAnswer(false)
    setCompleted(true)
  }

  const activeAnswers = useMemo(
    () => answers.filter(answer => answer.ticket >= 1 && answer.ticket <= participantCount),
    [answers, participantCount]
  )

  const excludedAnswers = useMemo(
    () => answers.filter(answer => answer.ticket > participantCount).map(answer => answer.ticket).sort((a, b) => a - b),
    [answers, participantCount]
  )

  const baseGroups = useMemo(() => SAKE_OPTIONS.map(base => ({
    key: String(base), label: `${sakeName(base)} 20ml`,
    tickets: activeAnswers.filter(a => a.base === base).map(a => a.ticket).sort((a, b) => a - b),
  })).filter(group => group.tickets.length), [activeAnswers])

  const sakeGroups = useMemo(() => {
    const map = new Map()
    activeAnswers.forEach(answer => {
      const types = [answer.base, answer.second, answer.third].sort((a, b) => a - b)
      const key = types.join('-')
      if (!map.has(key)) map.set(key, { key, label: types.map(sakeName).join('・'), tickets: [] })
      map.get(key).tickets.push(answer.ticket)
    })
    return [...map.values()].filter(group => group.tickets.length >= 2)
  }, [activeAnswers])

  const exactGroups = useMemo(() => {
    const map = new Map()
    activeAnswers.forEach(answer => {
      const ingredients = [[answer.base, BASE_AMOUNT], [answer.second, answer.secondAmount], [answer.third, answer.thirdAmount]].sort((a, b) => a[0] - b[0])
      const key = ingredients.map(([type, amount]) => `${type}:${amount}`).join('|')
      const label = ingredients.map(([type, amount]) => `${sakeName(type)} ${amount}ml`).join('、')
      if (!map.has(key)) map.set(key, { key, label, tickets: [] })
      map.get(key).tickets.push(answer.ticket)
    })
    return [...map.values()].filter(group => group.tickets.length >= 2)
  }, [activeAnswers])

  const basePopularity = useMemo(() => {
    if (activeAnswers.length === 0) return { winners: [], votes: 0 }

    const counts = new Map()
    activeAnswers.forEach(answer => {
      counts.set(answer.base, (counts.get(answer.base) || 0) + 1)
    })

    const votes = Math.max(...counts.values())
    const winners = [...counts.entries()]
      .filter(([, count]) => count === votes)
      .map(([number]) => Number(number))
      .sort((a, b) => a - b)

    return { winners, votes }
  }, [activeAnswers])

  const flavorPopularity = useMemo(() => {
    if (activeAnswers.length === 0) return { winners: [], votes: 0 }

    const counts = new Map()
    activeAnswers.forEach(answer => {
      ;[answer.second, answer.third].forEach(number => {
        counts.set(number, (counts.get(number) || 0) + 1)
      })
    })

    const votes = Math.max(...counts.values())
    const winners = [...counts.entries()]
      .filter(([, count]) => count === votes)
      .map(([number]) => Number(number))
      .sort((a, b) => a - b)

    return { winners, votes }
  }, [activeAnswers])

  const unansweredTickets = useMemo(() => {
    const answered = new Set(activeAnswers.map(answer => Number(answer.ticket)))
    return Array.from({ length: participantCount }, (_, i) => i + 1).filter(ticket => !answered.has(ticket))
  }, [activeAnswers])

  const openPresentation = () => {
    setPresentationData({
      answeredCount: activeAnswers.length,
      basePopularity,
      flavorPopularity,
      sakeGroups: sakeGroups.map(group => ({ ...group, tickets: [...group.tickets] })),
      exactGroups: exactGroups.map(group => ({ ...group, tickets: [...group.tickets] })),
    })
    setPresentationStep(0)
    setPresentationRevealed(false)
    setPresentationMode(true)
  }

  const closePresentation = () => {
    setPresentationMode(false)
    setPresentationStep(0)
    setPresentationRevealed(false)
  }

  const nextPresentationStep = () => {
    setPresentationStep(step => step + 1)
    setPresentationRevealed(false)
  }

  const previousPresentationStep = () => {
    setPresentationStep(step => Math.max(0, step - 1))
    setPresentationRevealed(false)
  }

  if (presentationMode && presentationData) {
    const slides = [
      { type: 'title' },
      { type: 'base-result', reveal: true },
      { type: 'move' },
      { type: 'flavor-result', reveal: true },
      { type: 'match-summary', reveal: true },
      ...presentationData.sakeGroups.map((group, index) => ({ type: 'match-group', group, index })),
      { type: 'exact-summary', reveal: true },
      ...presentationData.exactGroups.map((group, index) => ({ type: 'exact-group', group, index })),
      { type: 'finish' },
    ]
    const safeStep = Math.min(presentationStep, slides.length - 1)
    const slide = slides[safeStep]
    const winners = popularity => popularity.winners.map(sakeName)

    const renderSlide = () => {
      switch (slide.type) {
        case 'title':
          return <><p className="presentation-kicker">日本酒ブレンド</p><h1>結果発表</h1><p>{presentationData.answeredCount}名のブレンドから、偶然の一致を探します</p></>
        case 'base-result':
          return presentationRevealed ? <><p className="presentation-kicker presentation-ribbon">人気No.1ベース</p><h1>{winners(presentationData.basePopularity).join(' ／ ')}</h1><p className="presentation-votes">{presentationData.basePopularity.votes}票{presentationData.basePopularity.winners.length > 1 ? '・同率1位' : ''}</p></> : <><p className="presentation-kicker">人気No.1ベース</p><h1>最も選ばれた<br />ベースは？</h1></>
        case 'move':
          return <><p className="presentation-kicker">参加者のみなさんへ</p><h1>選んだベースごとに<br />移動してください</h1><p>リーフレットの番号と同じエリアへ。荷物と椅子はそのままで構いません。</p></>
        case 'flavor-result':
          return presentationRevealed ? <><p className="presentation-kicker presentation-ribbon">人気No.1フレーバー</p><h1>{winners(presentationData.flavorPopularity).join(' ／ ')}</h1><p className="presentation-votes">{presentationData.flavorPopularity.votes}票{presentationData.flavorPopularity.winners.length > 1 ? '・同率1位' : ''}</p></> : <><p className="presentation-kicker">人気No.1フレーバー</p><h1>最も選ばれた<br />フレーバーは？</h1></>
        case 'match-summary':
          if (!presentationRevealed) return <><p className="presentation-kicker">3種類マッチ</p><h1>選んだ3種類が<br />一致した組は？</h1></>
          return <><p className="presentation-kicker">3種類マッチ</p><h1>{presentationData.sakeGroups.length === 0 ? '該当グループなし' : `${presentationData.sakeGroups.length}グループ成立`}</h1><p>{presentationData.sakeGroups.length === 0 ? '今回は全員が異なる組み合わせでした' : '札番号を順番に発表します'}</p></>
        case 'match-group':
          return <><p className="presentation-kicker presentation-ribbon">3種類マッチ {slide.index + 1}/{presentationData.sakeGroups.length}</p><h1 className="presentation-combination">{slide.group.label}</h1><p className="presentation-label">一致した札番号</p><div className="presentation-tickets">{slide.group.tickets.map(ticket => <span key={ticket}>{ticket}</span>)}</div></>
        case 'exact-summary':
          if (!presentationRevealed) return <><p className="presentation-kicker">完全一致</p><h1>種類と配合量まで<br />一致した組は？</h1></>
          return <><p className="presentation-kicker">完全一致</p><h1>{presentationData.exactGroups.length === 0 ? '今回は成立せず' : `${presentationData.exactGroups.length}グループ成立`}</h1><p>{presentationData.exactGroups.length === 0 ? '3種類マッチした皆さんに拍手！' : '完全一致した組を発表します'}</p></>
        case 'exact-group':
          return <><p className="presentation-kicker presentation-ribbon">完全一致 {slide.index + 1}/{presentationData.exactGroups.length}</p><h1 className="presentation-combination">{slide.group.label}</h1><p className="presentation-label">完全一致した札番号</p><div className="presentation-tickets">{slide.group.tickets.map(ticket => <span key={ticket}>{ticket}</span>)}</div></>
        default:
          return <><p className="presentation-kicker">日本酒ブレンド</p><h1>結果発表<br />終了</h1><p>偶然生まれた組み合わせと、新しい出会いに乾杯</p></>
      }
    }

    const theme = slide.type.startsWith('exact')
      ? 'exact'
      : slide.type.startsWith('match')
        ? 'match'
        : 'ranking'

    return (
      <main className={`presentation-shell presentation-theme-${theme}`}>
        <div className="presentation-glow presentation-glow-one" aria-hidden="true" />
        <div className="presentation-glow presentation-glow-two" aria-hidden="true" />
        <button className="presentation-close" type="button" onClick={closePresentation}>発表モードを終了</button>
        <section className="presentation-stage">{renderSlide()}</section>
        <nav className="presentation-controls" aria-label="発表画面操作">
          <button type="button" onClick={previousPresentationStep} disabled={safeStep === 0}>前へ</button>
          {slide.reveal && !presentationRevealed ? (
            <button className="reveal" type="button" onClick={() => setPresentationRevealed(true)}>結果を表示</button>
          ) : (
            <button className="next" type="button" onClick={nextPresentationStep} disabled={safeStep === slides.length - 1}>次へ</button>
          )}
        </nav>
        <p className="presentation-progress">{safeStep + 1} / {slides.length}</p>
      </main>
    )
  }

  if (settingsLoading || checkingAnswer) return <main className="app-shell center-screen"><section className="card success-card"><h1>回答状況を確認しています</h1><p className="muted">少しお待ちください。</p></section></main>

  if (completed && existingAnswer) {
    return (
      <main className="app-shell center-screen">
        <section className="card success-card">
          <div className="success-icon">✓</div>
          <h1>回答済みです</h1>
          <p>札番号 <strong>{existingAnswer.ticket}</strong></p>
          <section className="confirmation">
            <h3>現在の回答</h3>
            <p>ベース：{sakeName(existingAnswer.base)} {BASE_AMOUNT}ml</p>
            <p>フレーバー1：{sakeName(existingAnswer.second)} {existingAnswer.secondAmount}ml</p>
            <p>フレーバー2：{sakeName(existingAnswer.third)} {existingAnswer.thirdAmount}ml</p>
          </section>
          <p className="notice">回答はSupabaseデータベースに保存されています。</p>
          <button className="primary" type="button" onClick={startEditing}>回答を修正する</button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="hero"><div className="logo">酒</div><div><h1>{EVENT_CONFIG.eventName}</h1><p>合計40mlのブレンドを作ろう</p></div></header>
      <nav className="tabs" aria-label="画面切り替え">
        <button type="button" className={tab === 'entry' ? 'active' : ''} onClick={() => setTab('entry')}>参加者</button>
        <button type="button" className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>集計者</button>
      </nav>

      {tab === 'entry' ? (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h2>{editingAnswer ? '回答を修正' : 'あなたのブレンドを入力'}</h2>
          {answerLoadError && <p className="error panel">{answerLoadError}</p>}
          <div className="field">
            <label htmlFor="ticket">札番号</label>
            {ticketLocked ? <div className="locked-ticket"><span>固有QRから読み取りました</span><strong>{form.ticket}</strong><small>手元の札と同じ番号か確認してください</small></div> : <><p className="helper">マスターQRから開いた場合は、札番号を手入力してください。</p><input id="ticket" type="number" inputMode="numeric" min="1" max={participantCount} value={form.ticket} onChange={e => update('ticket', e.target.value)} placeholder={`1から${participantCount}`} /></>}
          </div>

          <div className="blend-grid">
            <div className="blend-box base-box"><label>ベース</label><select value={form.base} onChange={e => update('base', e.target.value)}>{SAKE_OPTIONS.map(n => <option key={n} value={n}>{sakeName(n)}</option>)}</select><strong>20ml 固定</strong></div>
            <div className="blend-box flavor1-box"><label>フレーバー1</label><select value={form.second} onChange={e => update('second', e.target.value)}>{SAKE_OPTIONS.map(n => <option key={n} value={n}>{sakeName(n)}</option>)}</select><select value={form.secondAmount} onChange={e => update('secondAmount', e.target.value)}>{FLAVOR_AMOUNTS.map(amount => <option key={amount} value={amount}>{amount}ml</option>)}</select></div>
            <div className="blend-box flavor2-box"><label>フレーバー2</label><select value={form.third} onChange={e => update('third', e.target.value)}>{SAKE_OPTIONS.map(n => <option key={n} value={n}>{sakeName(n)}</option>)}</select><strong>{thirdAmount}ml 自動</strong></div>
          </div>

          <div className="total-box"><span>合計量</span><strong>{totalAmount}ml</strong><small>20ml ＋ {secondAmount}ml ＋ {thirdAmount}ml</small></div>
          {duplicateSake && <p className="error panel">3種類は異なる日本酒を選んでください。</p>}
          {confirming && valid && <section className="confirmation"><h3>{editingAnswer ? '修正内容を確認してください' : '回答内容を確認してください'}</h3><p>札番号：<strong>{form.ticket}</strong></p><p>ベース：{sakeName(Number(form.base))} 20ml</p><p>フレーバー1：{sakeName(Number(form.second))} {secondAmount}ml</p><p>フレーバー2：{sakeName(Number(form.third))} {thirdAmount}ml</p><button type="button" className="secondary" onClick={() => setConfirming(false)}>戻って修正</button></section>}
          {message && <p className="message">{message}</p>}
          <button className="primary" type="submit" disabled={!valid || submitting}>{submitting ? '保存中...' : confirming ? (editingAnswer ? '回答を更新する' : '回答を確定する') : (editingAnswer ? '修正内容を確認する' : '回答内容を確認する')}</button>
          {editingAnswer && <button className="secondary" type="button" disabled={submitting} onClick={cancelEditing}>修正をキャンセル</button>}
        </form>
      ) : authLoading ? (
        <section className="card auth-card"><h2>認証状態を確認しています</h2><p className="muted">少しお待ちください。</p></section>
      ) : !session ? (
        <form className="card auth-card" onSubmit={login}>
          <h2>集計者ログイン</h2><p className="muted">集計結果は、登録済みの集計者だけが閲覧できます。</p>
          <div className="field"><label htmlFor="admin-email">メールアドレス</label><input id="admin-email" type="email" autoComplete="username" required value={loginForm.email} onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))} /></div>
          <div className="field"><label htmlFor="admin-password">パスワード</label><input id="admin-password" type="password" autoComplete="current-password" required value={loginForm.password} onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))} /></div>
          {loginError && <p className="error panel">{loginError}</p>}
          <button className="primary" type="submit" disabled={loggingIn}>{loggingIn ? 'ログイン中...' : 'ログインする'}</button>
        </form>
      ) : (
        <div className="admin-area">
          <div className="admin-header-actions"><p className="admin-user">集計者としてログイン中</p><button className="secondary compact" type="button" onClick={logout}>ログアウト</button></div>
          <section className="card group-card">
            <h2>イベント設定</h2>
            <p className="muted">最大30名。主催者番号は参加人数と同じ番号に自動設定されます。</p>
            <div className="field">
              <label htmlFor="participant-count">今回の参加人数</label>
              <input
                id="participant-count"
                type="number"
                inputMode="numeric"
                min="1"
                max={MAX_TICKETS}
                value={participantCountInput}
                onChange={event => {
                  setParticipantCountInput(event.target.value)
                  setSettingsMessage('')
                }}
              />
            </div>
            <button className="primary" type="button" onClick={saveParticipantCount} disabled={settingsSaving}>
              {settingsSaving ? '保存中...' : '参加人数を保存'}
            </button>
            {settingsMessage && <p className="message">{settingsMessage}</p>}
            {excludedAnswers.length > 0 && <p className="error panel">集計対象外の回答：札番号 {excludedAnswers.join('、')}</p>}
          </section>
          <section className="stats"><div className="stat-card"><strong>{participantCount}</strong><span>全札数</span></div><div className="stat-card"><strong>{activeAnswers.length}</strong><span>回答済み</span></div><div className="stat-card"><strong>{unansweredTickets.length}</strong><span>未回答</span></div></section>
          <div className="summary-actions"><div><p className="notice">Supabaseに保存された全端末の回答を表示します。</p><p className="muted">最終読み込み：{formatDateTime(lastFetchedAt)}</p></div><button className="secondary compact" type="button" onClick={fetchAnswers} disabled={loadingAnswers}>{loadingAnswers ? '読み込み中...' : '最新の回答に更新'}</button></div>
          <button className="primary presentation-launch" type="button" onClick={openPresentation} disabled={answers.length === 0}>発表モードを開く</button>
          <section className="stats popularity-stats">
            <div className="stat-card popularity-card">
              <span>人気No.1ベース</span>
              {basePopularity.winners.length === 0 ? (
                <strong>回答待ち</strong>
              ) : (
                <>
                  {basePopularity.winners.map(number => <strong key={number}>{sakeName(number)}</strong>)}
                  <small>{basePopularity.votes}票{basePopularity.winners.length > 1 ? '・同率1位' : ''}</small>
                </>
              )}
            </div>
            <div className="stat-card popularity-card">
              <span>人気No.1フレーバー</span>
              {flavorPopularity.winners.length === 0 ? (
                <strong>回答待ち</strong>
              ) : (
                <>
                  {flavorPopularity.winners.map(number => <strong key={number}>{sakeName(number)}</strong>)}
                  <small>{flavorPopularity.votes}票{flavorPopularity.winners.length > 1 ? '・同率1位' : ''}</small>
                </>
              )}
            </div>
          </section>
          {loadError && <p className="error panel">{loadError}</p>}
          {deleteMessage && <p className="message">{deleteMessage}</p>}
          <section className="card group-card"><h2>未回答の札番号</h2>{unansweredTickets.length === 0 ? <p className="notice">全員の回答が完了しています。</p> : <div className="ticket-list">{unansweredTickets.map(ticket => <span className="ticket-chip" key={ticket}>{ticket}</span>)}</div>}</section>
          <section className="stats"><div className="stat-card"><strong>{baseGroups.length}</strong><span>ベース種類数</span></div><div className="stat-card"><strong>{sakeGroups.length}</strong><span>同じ3種類</span></div><div className="stat-card"><strong>{exactGroups.length}</strong><span>完全一致</span></div></section>
          <button className="danger" type="button" onClick={() => { setDeleteConfirmText(''); setDeleteMessage(''); setDeleteDialogOpen(true) }}>全回答を削除</button>
          {deleteDialogOpen && <section className="delete-panel" role="dialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">全回答を削除しますか？</h2><p className="error panel">この操作は元に戻せません。</p><label htmlFor="delete-confirm">確認のため「削除」と入力してください</label><input id="delete-confirm" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} disabled={deleting} /><button className="danger" type="button" disabled={deleteConfirmText !== '削除' || deleting} onClick={deleteAllAnswers}>{deleting ? '削除中...' : '削除を確定する'}</button><button className="secondary" type="button" disabled={deleting} onClick={() => setDeleteDialogOpen(false)}>キャンセル</button></section>}
          <GroupCard title="同じベースの人" groups={baseGroups} emptyText="回答がありません。" />
          <GroupCard title="同じ3種類を選んだ人（2名以上）" groups={sakeGroups} emptyText="該当グループはありません。" />
          <GroupCard title="種類と配合量が完全一致（2名以上）" groups={exactGroups} emptyText="該当グループはありません。" />
        </div>
      )}
    </main>
  )
}
