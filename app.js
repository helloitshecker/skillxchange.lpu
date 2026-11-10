let supabase = null
    let cloudUser = null
    let cloudProfile = null
    let realtimeChannel = null
    let cloudConfigured = false
    const config = window.SKILLXCHANGE_CONFIG || {}

try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
        if (config.supabaseUrl && config.supabaseAnonKey) {
            supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
                cloudConfigured = true
        }
} catch (error) {
    console.warn('Supabase CDN could not be loaded. Demo mode is still available.', error)
}

const demoSeed = {
    profile: {
        id: 'demo-student',
        name: 'Anaya Kapoor',
        program: 'B.Des. Communication Design',
        year: '2nd year',
        bio: 'Curious designer who loves making ideas feel a little more human.',
        offers: ['Python', 'Video editing'],
        wants: ['Figma', 'Public speaking'],
        availability: ['Weekends', 'Evenings'],
    },
    people: [{
            id: 'aarav',
            name: 'Aarav Mehta',
            program: 'B.Des. Communication Design',
            year: '2nd year',
            bio: 'Building a portfolio one good idea at a time.',
            offers: ['Figma', 'Brand identity'],
            wants: ['Python', 'Data structures'],
            availability: ['Weekends', 'Evenings'],
            category: 'Design',
            color: 'mint'
        }, {
            id: 'riya',
            name: 'Riya Sharma',
            program: 'B.Tech Computer Science',
            year: '3rd year',
            bio: 'Guitar player, code learner, and believer in patient teaching.',
            offers: ['Guitar', 'Music theory'],
            wants: ['Python', 'Web development'],
            availability: ['Weekday evenings'],
            category: 'Music',
            color: 'peach'
        }, {
            id: 'kabir',
            name: 'Kabir Singh',
            program: 'B.Sc. Mathematics',
            year: '2nd year',
            bio: 'Happy to make calculus less intimidating. Learning video editing.',
            offers: ['Calculus', 'Data analysis'],
            wants: ['Video editing', 'Photography'],
            availability: ['Friday', 'Weekends'],
            category: 'Academics',
            color: 'lavender'
        }, {
            id: 'maya',
            name: 'Maya Iyer',
            program: 'B.A. English Literature',
            year: '1st year',
            bio: 'Language nerd with a soft spot for thoughtful conversations.',
            offers: ['Spanish', 'Creative writing'],
            wants: ['Public speaking', 'Figma'],
            availability: ['Weekends'],
            category: 'Languages',
            color: 'yellow'
        }, {
            id: 'dev',
            name: 'Dev Patel',
            program: 'B.Tech Information Technology',
            year: '3rd year',
            bio: 'I make small apps and very large playlists.',
            offers: ['Web development', 'Python'],
            wants: ['Guitar', 'Music production'],
            availability: ['Evenings'],
            category: 'Coding',
            color: 'blue'
        },
    ],
    requests: [{
            id: 'req-riya',
            personId: 'riya',
            direction: 'received',
            offered_skill: 'Guitar',
            wanted_skill: 'Python',
            status: 'pending',
            created_at: '2025-04-12T12:00:00Z'
        }, {
            id: 'req-kabir',
            personId: 'kabir',
            direction: 'received',
            offered_skill: 'Calculus',
            wanted_skill: 'Video editing',
            status: 'pending',
            created_at: '2025-04-11T12:00:00Z'
        }, {
            id: 'req-aarav',
            personId: 'aarav',
            direction: 'sent',
            offered_skill: 'Python',
            wanted_skill: 'Figma',
            status: 'pending',
            created_at: '2025-04-10T12:00:00Z'
        },
    ],
    conversations: [{
            id: 'chat-aarav',
            personId: 'aarav',
            offer: 'Python for Figma',
            last_message: 'Saturday works for me.',
            updated_at: '2025-04-12T14:30:00Z'
        },
    ],
    messages: {
        'chat-aarav': [{
                id: 'm1',
                sender_id: 'aarav',
                body: 'Hey! Excited to swap.',
                created_at: '2025-04-12T13:10:00Z'
            }, {
                id: 'm2',
                sender_id: 'demo-student',
                body: 'Same here. Free this weekend to start?',
                created_at: '2025-04-12T13:26:00Z'
            }, {
                id: 'm3',
                sender_id: 'aarav',
                body: 'Saturday works for me.',
                created_at: '2025-04-12T14:30:00Z'
            },
        ],
    },
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const fallbackQuotes = [
    { quote: 'Knowledge grows when it gets passed around.', author: 'The SkillXChange way' },
    { quote: 'Learning is a treasure that will follow its owner everywhere.', author: 'Chinese proverb' },
    { quote: 'Wisdom begins in wonder.', author: 'Socrates' },
]
const readSaved = () => {
    try {
        return JSON.parse(localStorage.getItem('skillxchange-demo')) || clone(demoSeed)
    } catch {
        return clone(demoSeed)
    }
}
const state = {
    mode: 'auth',
    page: 'discover',
    authMode: 'signin',
    requestTab: 'received',
    theme: localStorage.getItem('skillxchange-theme') || 'light',
    demo: readSaved(),
    isDemo: false,
    profile: null,
    people: [],
    requests: [],
    conversations: [],
    messages: {},
    activeConversation: null,
    chatListOpen: false,
    quotes: fallbackQuotes,
    quoteIndex: 0,
    currentQuote: fallbackQuotes[0],
    quoteLoading: false,
    quoteLoadAttempted: false,
    gifResults: [],
    gifSearch: '',
    gifLoading: false,
    gifError: '',
    gifRequestId: 0,
    search: '',
    category: 'All',
    modal: '',
    modalPerson: null,
    busy: false,
    oauthBusy: false,
    toastTimer: null,
}

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }
        [char]))
const icon = (name, extra = '') => `<span class="material-symbols-rounded ${extra}" aria-hidden="true">${name}</span>`
const initials = (name = 'Student') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const personById = (id) => state.people.find((person) => person.id === id) || (state.profile?.id === id ? state.profile : null)
const persistDemo = () => localStorage.setItem('skillxchange-demo', JSON.stringify(state.demo))

function showToast(message, kind = 'success') {
    const region = document.getElementById('toast-region')
        region.innerHTML = `<div class="toast ${kind}" role="status">${icon(kind === 'error' ? 'error' : 'check_circle', 'filled-icon')}<span>${esc(message)}</span></div>`
        clearTimeout(state.toastTimer)
        state.toastTimer = setTimeout(() => {
            region.innerHTML = ''
        }, kind === 'error' ? 7500 : 3200)
}

function authErrorMessage(error) {
    const message = String(error?.message || '')
        const code = String(error?.code || '')
        if (code === 'over_email_send_rate_limit' || /email rate limit exceeded/i.test(message)) {
            return 'Supabase has temporarily limited auth emails. Its built-in mailer allows only 2 emails per hour. Wait for the limit to reset, configure custom SMTP in Supabase, or use Google sign-in / Explore the demo.'
        }
        return message || 'Something went wrong. Please try again.'
}

function setTheme(theme) {
    state.theme = theme
        document.documentElement.dataset.theme = theme
        localStorage.setItem('skillxchange-theme', theme)
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-surface').trim()
        if (surface)
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', surface)
}

function avatar(person, size = '') {
    const tint = person?.color || 'mint'
        return `<div class="avatar ${size} ${tint}">${esc(initials(person?.name || 'S'))}</div>`
}

function matchingSkills(person) {
    const offers = state.profile?.offers || []
        const wants = state.profile?.wants || []
        const theyCanTeach = (person.offers || []).find((skill) => wants.some((want) => want.toLowerCase() === skill.toLowerCase()))
        const youCanTeach = offers.find((skill) => (person.wants || []).some((want) => want.toLowerCase() === skill.toLowerCase()))
        return {
        theyCanTeach,
        youCanTeach
    }
}

function chipList(skills, style = 'outline') {
    return (skills || []).map((skill) => `<span class="chip static ${style === 'filled' ? 'tonal' : ''}">${esc(skill)}</span>`).join('')
}

/* Material 3 outlined text field with floating label */
function field({
    label,
    name,
    type = 'text',
    value = '',
    placeholder = '',
    hint = '',
    full = false,
    leading = '',
    trailing = '',
    rows = 0,
    options = null,
    attrs = ''
}) {
    let control
    if (options !== null) {
        control = `<select name="${name}" ${attrs}>${options}</select>`
    } else if (rows) {
        control = `<textarea name="${name}" rows="${rows}" placeholder="${esc(placeholder || ' ')}" ${attrs}>${esc(value)}</textarea>`
    } else {
        control = `<input name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder || ' ')}" ${attrs} />`
    }
    const arrow = options !== null ? icon('arrow_drop_down', 'tf-select-arrow') : ''
    return `<label class="tf ${full ? 'full' : ''}"><span class="tf-box">${leading}<span class="tf-control">${control}<span class="tf-label">${esc(label)}</span></span>${arrow}${trailing}</span>${hint ? `<small class="tf-support">${esc(hint)}</small>` : ''}</label>`
}

const brandMarkup = '<img class="brand-mark" src="logo.svg" alt="" aria-hidden="true" /><span class="brand-name">Skill<span class="brand-light">X</span>Change</span>'
    const themeButton = () => `<button class="icon-btn" data-action="toggle-theme" aria-label="Switch color theme">${icon(state.theme === 'dark' ? 'light_mode' : 'dark_mode')}</button>`

function topBar() {
    const titles = {
        discover: 'Discover',
        requests: 'Requests',
        chats: 'Messages',
        profile: 'Your profile'
    }
    return `<header class="top-app-bar"><img class="brand-mark" src="logo.svg" alt="" aria-hidden="true" /><h1>${titles[state.page] || 'Discover'}</h1><div class="top-actions">${themeButton()}<button class="profile-shortcut" data-action="navigate" data-page="profile" aria-label="Open your profile">${avatar(state.profile, 'avatar-small')}</button></div></header>`
}

function authView() {
    const signup = state.authMode === 'signup'
        return `<main class="auth-layout">
    <section class="auth-story">
      <div class="brand">${brandMarkup}</div>
      <div class="auth-shape s1" aria-hidden="true"></div><div class="auth-shape s2" aria-hidden="true"></div>
      <div class="story-copy"><span class="chip static">${icon('auto_awesome')} A better way to learn together</span>
        <h1>Trade skills,<br /><em>not money.</em></h1>
        <p>Meet the people on your campus who can teach you something new — and learn something from you, too.</p>
      </div>
      <div class="story-chips" aria-hidden="true"><span class="chip static">${icon('design_services')} Figma</span><span class="chip static">${icon('code')} Python</span><span class="chip static">${icon('music_note')} Guitar</span></div>
      <div class="story-foot"><span>${icon('school')} Made for campus life</span><span>Learn it. Share it. Pass it on.</span></div>
    </section>
    <section class="auth-panel"><div class="auth-mobile-brand brand">${brandMarkup}</div>
      <div class="auth-form-wrap"><h2>${signup ? 'Create your account' : 'Sign in'}</h2><p class="auth-subtitle">${signup ? 'Start building your campus learning circle.' : 'Pick up where your next skill swap begins.'}</p>
      <form id="auth-form" class="form-stack">
        ${signup ? field({
            label: 'Your name',
            name: 'name',
            placeholder: 'e.g. Anaya Kapoor',
            leading: icon('person'),
            attrs: 'autocomplete="name" required maxlength="70"'
        }) : ''}
        ${field({
            label: 'College email',
            name: 'email',
            type: 'email',
            placeholder: 'name@college.edu',
            leading: icon('mail'),
            attrs: 'autocomplete="email" required'
        })}
        ${field({
            label: 'Password',
            name: 'password',
            type: 'password',
            placeholder: signup ? 'At least 6 characters' : 'Your password',
            leading: icon('lock'),
            trailing: `<button type="button" class="icon-btn" data-action="toggle-password" aria-label="Show password">${icon('visibility')}</button>`,
            attrs: `autocomplete="${signup ? 'new-password' : 'current-password'}" minlength="6" required`
        })}
        ${signup ? field({
            label: 'Course and year',
            name: 'program',
            placeholder: 'e.g. B.Des. Communication Design, 2nd year',
            leading: icon('school'),
            attrs: 'required maxlength="100"'
        }) : ''}
        <button class="btn btn-filled btn-block auth-submit" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? '<span class="spinner"></span> One moment…' : signup ? 'Create account' : 'Sign in'}</button>
      </form>
      <div class="auth-divider"><span>or</span></div>
      <button class="btn btn-outlined btn-block google-button" data-action="google-auth" ${state.oauthBusy ? 'disabled' : ''}>${state.oauthBusy ? '<span class="spinner"></span> Connecting to Google…' : '<span class="google-g" aria-hidden="true">G</span> Continue with Google'}</button>
      <div class="auth-switch">${signup ? 'Already part of the exchange?' : 'New to SkillXChange?'} <button class="btn btn-text" data-action="auth-mode" data-mode="${signup ? 'signin' : 'signup'}">${signup ? 'Sign in' : 'Create account'}</button></div>
      <div class="demo-card">${icon('auto_awesome')} <span>Just looking around? <button class="btn btn-text" data-action="demo-login">Explore the demo</button></span></div>
      ${!cloudConfigured ? '<p class="setup-note">Demo mode is ready. Add Supabase credentials in <code>config.js</code> to enable real accounts and sync.</p>' : '<p class="setup-note">Use your campus email to find students in your learning community.</p>'}
      </div><div class="auth-theme">${themeButton()}</div>
    </section>
  </main>`
}

const navItems = [
    ['discover', 'Explore', 'explore'], ['requests', 'Requests', 'favorite'], ['chats', 'Messages', 'chat_bubble'], ['profile', 'Profile', 'person'],
]

function navItem([page, label, glyph], pending) {
    const count = page === 'requests' && pending ? pending : 0
        const active = state.page === page
        return `<button class="nav-item ${active ? 'active' : ''}" data-action="navigate" data-page="${page}" ${active ? 'aria-current="page"' : ''}><span class="nav-indicator">${icon(glyph)}${count ? `<span class="badge">${count}</span>` : ''}</span><span class="nav-label">${label}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</button>`
}

function personCard(person) {
    const match = matchingSkills(person)
        const isMatch = match.theyCanTeach && match.youCanTeach
        const existingRequest = state.requests.find((request) => request.personId === person.id && request.direction === 'sent' && request.status === 'pending')
        const existingChat = state.conversations.find((conversation) => conversation.personId === person.id)
        const matchText = isMatch
         ? `They can teach you <strong>${esc(match.theyCanTeach)}</strong>. You can teach them <strong>${esc(match.youCanTeach)}</strong>.`
         : match.theyCanTeach
         ? `They can teach you <strong>${esc(match.theyCanTeach)}</strong> — a great place to start.`
         : match.youCanTeach
         ? `You could help them learn <strong>${esc(match.youCanTeach)}</strong>. See what else you can swap.`
         : 'A new campus connection starts with a conversation.'
        const cta = existingChat
         ? `<button class="btn btn-tonal" data-action="open-person-chat" data-person="${esc(person.id)}">${icon('chat_bubble')}Open chat</button>`
         : existingRequest
         ? `<button class="btn btn-outlined" disabled>${icon('hourglass_top')}Request sent</button>`
         : `<button class="btn btn-filled" data-action="ask" data-person="${esc(person.id)}">${icon('swap_horiz')}Ask to swap</button>`
        return `<article class="person-card">
    <div class="person-card-top"><div class="person-identity">${avatar(person, 'avatar-large')}<div><div class="person-name-line"><h2>${esc(person.name)}</h2>${person.year ? `<span class="year-tag">${esc(person.year)}</span>` : ''}</div><p>${esc(person.program || 'Campus student')}</p></div></div><button class="icon-btn" data-action="person-details" data-person="${esc(person.id)}" aria-label="View ${esc(person.name)}'s profile">${icon('more_vert')}</button></div>
    <div class="skill-columns"><div><span class="label-text">Can teach</span><div class="chips">${chipList(person.offers, 'filled')}</div></div><div><span class="label-text">Wants to learn</span><div class="chips">${chipList(person.wants, 'outline')}</div></div></div>
    <div class="match-note">${icon(isMatch ? 'auto_awesome' : 'handshake')}<span>${matchText}</span></div>
    <div class="person-card-bottom"><span class="availability">${icon('schedule')} ${esc((person.availability || ['Flexible'])[0])}</span>${cta}</div>
  </article>`
}

const QUOTE_CDN_URL = 'https://cdn.jsdelivr.net/gh/Zachatoo/quotes-database@main/quotes.json'

function updateQuoteCard() {
    const quoteText = document.querySelector('.quote-text')
    const quoteAuthor = document.querySelector('.quote-author')
    if (!quoteText || !quoteAuthor) return
    quoteText.textContent = state.currentQuote.quote
    quoteAuthor.textContent = state.currentQuote.author || 'Unknown author'
}

function showNextQuote() {
    if (!state.quotes.length) return
    let nextIndex = Math.floor(Math.random() * state.quotes.length)
    if (state.quotes.length > 1 && nextIndex === state.quoteIndex) {
        nextIndex = (nextIndex + 1) % state.quotes.length
    }
    state.quoteIndex = nextIndex
    state.currentQuote = state.quotes[nextIndex]
    updateQuoteCard()
}

async function loadQuoteCollection() {
    if (state.quoteLoadAttempted) return
    state.quoteLoadAttempted = true
    state.quoteLoading = true
    try {
        const response = await fetch(QUOTE_CDN_URL, { cache: 'force-cache' })
        if (!response.ok) throw new Error(`Quote CDN returned ${response.status}`)
        const payload = await response.json()
        const items = Array.isArray(payload) ? payload : payload.quotes
        const quotes = (Array.isArray(items) ? items : [])
            .map((item) => ({
                quote: String(item.quote || item.quoteText || '').trim(),
                author: String(item.author || item.quoteAuthor || '').trim(),
            }))
            .filter((item) => item.quote)
        if (!quotes.length) throw new Error('The quote CDN returned no quotes.')
        state.quotes = [...new Map(quotes.map((item) => [item.quote, item])).values()]
        state.quoteIndex = -1
        showNextQuote()
    } catch (error) {
        console.warn('Could not load quotes from the CDN; using the built-in quotes.', error)
        state.quotes = fallbackQuotes
        state.quoteIndex = 0
        state.currentQuote = fallbackQuotes[0]
        updateQuoteCard()
    } finally {
        state.quoteLoading = false
    }
}

function discoverPage() {
    const categories = ['All', 'Design', 'Coding', 'Music', 'Languages', 'Academics']
    const filtered = state.people.filter((person) => {
        const matchesCategory = state.category === 'All' || person.category === state.category || [...(person.offers || []), ...(person.wants || [])].some((skill) => skill.toLowerCase().includes(state.category.toLowerCase()))
            const query = state.search.trim().toLowerCase()
            const matchesQuery = !query || [person.name, person.program, ...(person.offers || []), ...(person.wants || [])].join(' ').toLowerCase().includes(query)
            return matchesCategory && matchesQuery
    })
        const best = filtered.filter((person) => matchingSkills(person).theyCanTeach && matchingSkills(person).youCanTeach).length
        return `<div class="discover-layout"><section class="discover-main">
    <div class="hero"><div class="hero-copy"><span class="label-text">A little know-how goes a long way</span><h2>What do you want to <em>learn this semester?</em></h2><p>Find a peer who can teach it. Offer something you know in return.</p></div><div class="hero-art" aria-hidden="true">${icon('school')}</div></div>
    <form class="search-bar" id="search-form" role="search"><button class="icon-btn" type="submit" aria-label="Search">${icon('search')}</button><input id="skill-search" type="search" value="${esc(state.search)}" placeholder="Search skills, subjects, or students" aria-label="Search skills, subjects, or students" autocomplete="off" />${state.search ? `<button class="icon-btn" type="button" data-action="clear-search" aria-label="Clear search">${icon('close')}</button>` : ''}</form>
    <div class="filter-row"><div class="category-list" role="group" aria-label="Filter by category">${categories.map((category) => {
            const on = state.category === category;
            return `<button class="chip ${on ? 'selected' : ''}" data-action="category" data-category="${esc(category)}" aria-pressed="${on}">${on ? icon('check') : ''}${esc(category)}</button>`
        }).join('')}</div><span class="result-count">${filtered.length} ${filtered.length === 1 ? 'student' : 'students'}</span></div>
    <div class="student-grid">${filtered.length ? filtered.map(personCard).join('') : `<div class="empty-state"><div class="empty-icon">${icon('search_off')}</div><h3>No peers found yet</h3><p>Try another skill or category. The right learning partner is out there.</p><button class="btn btn-tonal" data-action="clear-filters">Clear filters</button></div>`}</div>
    </section><aside class="discover-aside"><div class="aside-card your-skills-card"><div class="aside-heading"><div><span class="label-text">Your learning profile</span><h3>Your skill mix</h3></div><button class="icon-btn" data-action="navigate" data-page="profile" aria-label="Edit your profile">${icon('edit')}</button></div><div class="skill-mini-section"><span class="label-text">You can teach</span><div class="chips">${chipList(state.profile?.offers, 'filled')}</div></div><div class="skill-mini-section"><span class="label-text">You want to learn</span><div class="chips">${chipList(state.profile?.wants, 'outline')}</div></div><button class="btn btn-text" data-action="navigate" data-page="profile">Edit your skills</button></div>
       <div class="aside-card stat-card"><div class="stat-icon">${icon('auto_awesome')}</div><div><strong>${best} good ${best === 1 ? 'match' : 'matches'}</strong><p>Based on what you want to learn and share.</p></div></div><div class="quote-card">${icon('format_quote', 'filled-icon')}<button class="icon-btn quote-next" type="button" data-action="next-quote" aria-label="Show another quote" title="Show another quote">${icon('autorenew')}</button><div class="quote-copy" aria-live="polite" aria-atomic="true"><p class="quote-text">${esc(state.currentQuote.quote)}</p><span class="label-text quote-author">${esc(state.currentQuote.author || 'Unknown author')}</span></div></div></aside></div>`
}

function requestRow(request) {
    const person = personById(request.personId) || {
        name: 'Campus student',
        id: request.personId
    }
    const received = request.direction === 'received'
    const status = request.status || 'pending'
    let action = ''
    if (received && status === 'pending') {
        action = `<div class="request-actions"><button class="btn btn-text" data-action="decline-request" data-request="${esc(request.id)}">Decline</button><button class="btn btn-filled" data-action="accept-request" data-request="${esc(request.id)}">${icon('check')}Accept</button></div>`
    } else if (!received && status === 'pending') {
        action = `<span class="chip tonal static">${icon('hourglass_top')} Waiting for reply</span>`
    } else if (status === 'accepted') {
        action = `<button class="btn btn-tonal" data-action="open-person-chat" data-person="${esc(person.id)}">${icon('chat_bubble')}Open chat</button>`
    } else {
        action = `<span class="chip error static">${icon('block')} Declined</span>`
    }
    const description = received
        ? `Wants to learn <strong>${esc(request.wanted_skill)}</strong> · Offers <strong>${esc(request.offered_skill)}</strong>`
        : `You offered <strong>${esc(request.offered_skill)}</strong> for <strong>${esc(request.wanted_skill)}</strong>`
    return `<article class="request-row">${avatar(person, 'avatar-medium')}<div class="request-person"><h3>${esc(person.name)}</h3><p>${description}</p></div>${action}</article>`
}

function requestsPage() {
    const filtered = state.requests.filter((request) => request.direction === state.requestTab)
        const pending = state.requests.filter((r) => r.direction === 'received' && r.status === 'pending').length
        const tab = (id, label, badge = '') => `<button class="tab ${state.requestTab === id ? 'active' : ''}" role="tab" aria-selected="${state.requestTab === id}" data-action="request-tab" data-tab="${id}">${label}${badge !== '' ? `<span class="tab-badge">${badge || ''}</span>` : ''}</button>`
        return `<section class="requests-page"><div class="requests-intro page-intro"><div><h2>Make the first move, or say yes.</h2><p class="supporting">A chat opens only when you both say yes to a skill swap.</p></div></div>
    <div class="tab-bar" role="tablist">${tab('received', 'Received', pending)}${tab('sent', 'Sent')}</div>
    <div class="request-list">${filtered.length ? filtered.map(requestRow).join('') : `<div class="empty-state"><div class="empty-icon">${icon(state.requestTab === 'received' ? 'inbox' : 'outbox')}</div><h3>It's quiet in here</h3><p>${state.requestTab === 'received' ? 'When someone asks to swap skills, you’ll find their request here.' : 'Discover a peer and ask to exchange something you know.'}</p><button class="btn btn-tonal" data-action="navigate" data-page="discover">Explore students</button></div>`}</div>
    <div class="privacy-note">${icon('lock')} A conversation only starts after you accept a request.</div></section>`
}

function chatSummary(conversation) {
    const person = personById(conversation.personId) || {
        name: 'Campus student',
        id: conversation.personId
    }
    const messages = state.messages[conversation.id] || []
        const last = messages[messages.length - 1]
        return `<button class="chat-list-item ${state.activeConversation === conversation.id ? 'active' : ''}" data-action="select-chat" data-conversation="${esc(conversation.id)}">${avatar(person, 'avatar-medium')}<span class="chat-list-copy"><strong>${esc(person.name)}</strong><small>${esc(messagePreview(last?.body || conversation.last_message || conversation.offer || 'Say hello to start!'))}</small></span><span class="chat-time">${last ? 'Now' : ''}</span></button>`
}

const GIF_MESSAGE_PREFIX = 'GIF:'

function giphyMediaUrl(value) {
    try {
        const url = new URL(value)
        return url.protocol === 'https:' && (url.hostname === 'giphy.com' || url.hostname.endsWith('.giphy.com'))
            ? url.href
            : ''
    } catch {
        return ''
    }
}

function gifUrlFromMessage(body = '') {
    if (!body.startsWith(GIF_MESSAGE_PREFIX)) return ''
    return giphyMediaUrl(body.slice(GIF_MESSAGE_PREFIX.length))
}

function messagePreview(body = '') {
    return gifUrlFromMessage(body) ? 'GIF' : body
}

function messageRowMarkup(message, person) {
    const myId = state.isDemo ? state.profile?.id : cloudUser?.id
        const own = message.sender_id === myId || (state.isDemo && message.sender_id === 'demo-student')
        const gifUrl = gifUrlFromMessage(message.body)
        const content = gifUrl
            ? `<img class="message-gif" src="${esc(gifUrl)}" alt="GIF shared from GIPHY" loading="lazy" decoding="async" />`
            : `<p>${esc(message.body)}</p>`
        return `<div class="message-row ${own ? 'own' : ''}" data-message-id="${esc(message.id)}">${!own ? avatar(person, 'avatar-tiny') : ''}<div class="message-bubble ${gifUrl ? 'gif-bubble' : ''}">${content}<time>${formatTime(message.created_at)}</time></div></div>`
}

function messageThread(conversation) {
    const person = personById(conversation.personId) || {
        name: 'Campus student',
        id: conversation.personId
    }
    const messages = state.messages[conversation.id] || []
        return `<div class="thread-header"><button class="icon-btn thread-back" data-action="chat-list" aria-label="Back to chats">${icon('arrow_back')}</button>${avatar(person, 'avatar-medium')}<div><strong>${esc(person.name)}</strong><span>${icon('circle')} Active learning partner</span></div><span class="chip tonal static thread-swap">${icon('sync_alt')} ${esc(conversation.offer || 'Skill exchange')}</span><button class="icon-btn" data-action="person-details" data-person="${esc(person.id)}" aria-label="Student details">${icon('more_vert')}</button></div>
    <div class="match-banner"><div class="match-banner-icon">${icon('celebration')}</div><div><strong>It's a match!</strong><p>You can learn from each other. Pick a time and make something happen.</p></div><button class="btn btn-text" data-action="suggest-time">${icon('event')}Suggest a time</button></div>
    <div class="message-area" id="message-area"><div class="day-divider">Your conversation</div>${messages.length ? messages.map((message) => messageRowMarkup(message, person)).join('') : `<div class="thread-empty"><div>${icon('waving_hand')}</div><strong>Say hello to ${esc(person.name.split(' ')[0])}</strong><span>Every great skill swap starts somewhere.</span></div>`}</div>
    <form class="composer" id="message-form" data-conversation="${esc(conversation.id)}"><button class="icon-btn gif-button" type="button" data-action="open-gif-picker" aria-label="Choose a GIF" title="Choose a GIF">${icon('gif')}</button><label class="composer-input">${icon('sentiment_satisfied')}<input name="message" maxlength="1200" autocomplete="off" placeholder="Message ${esc(person.name.split(' ')[0])}…" required aria-label="Message" /></label><button class="icon-btn filled send-button" type="submit" aria-label="Send message">${icon('send', 'filled-icon')}</button></form>`
}

function chatsPage() {
    const selected = state.conversations.find((conversation) => conversation.id === state.activeConversation) || state.conversations[0]
        if (selected && state.activeConversation !== selected.id)
            state.activeConversation = selected.id
                return `<section class="chat-workspace ${state.chatListOpen ? 'list-mode' : ''}"><aside class="chat-sidebar"><div class="chat-sidebar-head"><button class="icon-btn chat-exit" data-action="navigate" data-page="discover" aria-label="Back to Discover">${icon('arrow_back')}</button><div><h2>Your chats</h2><p>${state.conversations.length} learning ${state.conversations.length === 1 ? 'partner' : 'partners'}</p></div><button class="icon-btn" data-action="navigate" data-page="discover" aria-label="Find a student">${icon('add')}</button></div><div class="chat-list">${state.conversations.length ? state.conversations.map(chatSummary).join('') : `<div class="chat-list-empty">${icon('forum')}<p>Your accepted skill swaps will show up here.</p><button class="btn btn-text" data-action="navigate" data-page="requests">View requests</button></div>`}</div></aside><div class="chat-thread">${selected ? messageThread(selected) : `<div class="no-chat-selected"><div class="empty-icon">${icon('forum')}</div><h2>Your next great conversation</h2><p>Accept a swap request to start chatting with a learning partner.</p><button class="btn btn-filled" data-action="navigate" data-page="discover">${icon('explore')}Find your people</button></div>`}</div></section>`
}

function profilePage() {
    const profile = state.profile || demoSeed.profile
        return `<section class="profile-page"><div class="profile-cover"><span>${icon('school')} Student learning profile</span></div><form id="profile-form" class="profile-form"><div class="profile-form-top">${avatar(profile, 'avatar-profile')}<div><h2>${esc(profile.name)}</h2><span>${state.isDemo ? 'Demo student account' : 'Campus student'}</span></div><button class="btn btn-filled save-profile" type="submit">${icon('check')}Save profile</button></div>
      <div class="form-section"><div class="form-section-heading"><h3>Your introduction</h3><p>Help a learning partner get to know you.</p></div><div class="profile-fields">${field({
            label: 'Full name',
            name: 'name',
            value: profile.name,
            attrs: 'required maxlength="70"'
        })}${field({
            label: 'Course and year',
            name: 'program',
            value: profile.program,
            placeholder: 'e.g. B.Tech, 2nd year',
            attrs: 'maxlength="100"'
        })}${field({
            label: 'A short intro',
            name: 'bio',
            value: profile.bio || '',
            rows: 3,
            full: true,
            placeholder: 'What are you curious about?',
            hint: 'A couple of sentences is plenty.',
            attrs: 'maxlength="240"'
        })}</div></div>
      <div class="form-section"><div class="form-section-heading"><h3>Make it a skill exchange</h3><p>Tell people what you can share and what you want to learn.</p></div><div class="profile-fields">${field({
            label: 'Skills I can teach',
            name: 'offers',
            value: (profile.offers || []).join(', '),
            placeholder: 'Figma, Python, Guitar',
            hint: 'Separate skills with commas.',
            full: true
        })}${field({
            label: 'Skills I want to learn',
            name: 'wants',
            value: (profile.wants || []).join(', '),
            placeholder: 'Public speaking, Spanish',
            hint: 'Specific skills make better matches.',
            full: true
        })}${field({
            label: 'When I’m usually free',
            name: 'availability',
            value: (profile.availability || []).join(', '),
            placeholder: 'Weekends, weekday evenings',
            full: true
        })}</div></div>
      <div class="profile-footer"><span>${icon('verified_user')} Your profile is only visible to signed-in students.</span><button class="btn btn-text" type="button" data-action="logout">${state.isDemo ? 'Exit demo' : 'Sign out'}</button></div>
    </form></section>`
}

function pageContent() {
    if (state.page === 'requests')
        return requestsPage()
        if (state.page === 'chats')
            return chatsPage()
            if (state.page === 'profile')
                return profilePage()
                return discoverPage()
}

function appView() {
    const pending = state.requests.filter((request) => request.direction === 'received' && request.status === 'pending').length
        const items = navItems.map((item) => navItem(item, pending)).join('')
        return `<div class="app-shell ${state.page === 'chats' ? 'chat-app-shell' : ''}"><nav class="nav-rail" aria-label="Primary"><button class="nav-brand" data-action="navigate" data-page="discover" aria-label="SkillXChange home">${brandMarkup}</button><button class="fab nav-fab" data-action="navigate" data-page="profile" aria-label="Add your skills">${icon('edit')}<span class="nav-fab-label">Add your skills</span></button><div class="nav-list">${items}</div></nav>
    <div class="app-body">${topBar()}<main class="main-content ${state.page === 'chats' ? 'chat-main-content' : ''}"><div class="main-inner">${pageContent()}</div></main></div>
    <nav class="nav-bar" aria-label="Primary">${items}</nav>${state.modal ? modalView() : ''}</div>`
}

function dialogShell(inner, labelledBy = '', className = '') {
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card ${className}" role="dialog" aria-modal="true" ${labelledBy ? `aria-labelledby="${labelledBy}"` : ''}>${inner}</section></div>`
}

function modalView() {
    const person = state.modalPerson || {}
    const match = matchingSkills(person)
        const first = esc(person.name?.split(' ')[0] || 'this student')
        const cancel = '<button class="btn btn-text modal-close" type="button" data-action="close-modal">Cancel</button>'
        if (state.modal === 'gif-picker') {
            const results = state.gifResults.map((gif) => `<button class="gif-result" type="button" data-action="send-gif" data-gif-url="${esc(gif.url)}" aria-label="Send GIF: ${esc(gif.title || 'GIF')}"><img src="${esc(gif.preview)}" alt="" loading="lazy" /><span>${esc(gif.title || 'GIF')}</span></button>`).join('')
            const feedback = state.gifLoading
                ? `<div class="gif-picker-message"><span class="spinner"></span><span>Loading GIFs…</span></div>`
                : state.gifError
                    ? `<p class="gif-picker-message">${esc(state.gifError)}</p>`
                    : !results
                        ? `<p class="gif-picker-message">No GIFs found. Try another search.</p>`
                        : ''
            return dialogShell(`<div class="gif-picker-header"><div><h2 id="gif-picker-title">Choose a GIF</h2><p>Search GIPHY to add a little expression.</p></div><button class="icon-btn modal-close" type="button" data-action="close-modal" aria-label="Close GIF picker">${icon('close')}</button></div><form id="gif-search-form" class="gif-search-form"><input type="search" name="query" maxlength="50" value="${esc(state.gifSearch)}" placeholder="Search GIFs" aria-label="Search GIPHY GIFs" /><button class="btn btn-tonal" type="submit">${icon('search')}Search</button></form><div class="gif-results" id="gif-results" aria-live="polite">${results || feedback}</div><div class="gif-powered-by">Powered by <strong>GIPHY</strong></div>`, 'gif-picker-title', 'gif-picker-modal')
        }
        if (state.modal === 'ask') {
            const myOffers = state.profile?.offers || []
                const theirOffers = person.offers || []
                if (!myOffers.length || !theirOffers.length) {
                    return dialogShell(`<div class="modal-icon">${icon('lightbulb')}</div><h2 id="modal-title">Make your swap personal</h2><p class="modal-lead">${!myOffers.length ? 'Add at least one skill you can teach to your profile before sending a swap request.' : `${first} hasn’t added a teachable skill yet.`}</p><div class="dialog-actions">${cancel}<button class="btn btn-filled" data-action="edit-profile-modal">${!myOffers.length ? 'Add my skills' : 'Got it'}</button></div>`, 'modal-title')
                }
                const preferredGive = match.youCanTeach || myOffers[0] || ''
                const preferredGet = match.theyCanTeach || theirOffers[0] || ''
                const options = (list, chosen) => list.map((skill) => `<option ${skill === chosen ? 'selected' : ''} value="${esc(skill)}">${esc(skill)}</option>`).join('')
                return dialogShell(`<div class="modal-icon">${icon('handshake')}</div><h2 id="modal-title">Ask ${first} to swap</h2><p class="modal-lead">Pick what you’d like to teach and what you’d like to learn. They can accept or pass — no pressure.</p><form id="swap-form" class="form-stack" data-person="${esc(person.id || '')}">${field({
                        label: 'I can teach',
                        name: 'offered_skill',
                        options: options(myOffers, preferredGive),
                        attrs: 'required'
                    })}<div class="swap-arrow">${icon('sync_alt')}</div>${field({
                        label: 'I’d love to learn',
                        name: 'wanted_skill',
                        options: options(theirOffers, preferredGet),
                        attrs: 'required'
                    })}<div class="dialog-actions">${cancel}<button class="btn btn-filled" type="submit">${icon('send')}Send request</button></div></form><div class="modal-footnote">${icon('lock')} Only you and ${first} will see this.</div>`, 'modal-title')
        }
        if (state.modal === 'details') {
            return dialogShell(`<div class="details-top">${avatar(person, 'avatar-large')}<div><h2 id="modal-title">${esc(person.name)}</h2><p>${esc(person.program || '')}${person.year ? ` · ${esc(person.year)}` : ''}</p></div></div><p class="details-bio">${esc(person.bio || 'Ready to learn something new and share a skill in return.')}</p><div class="skill-mini-section"><span class="label-text">Can teach</span><div class="chips">${chipList(person.offers, 'filled')}</div></div><div class="skill-mini-section"><span class="label-text">Wants to learn</span><div class="chips">${chipList(person.wants, 'outline')}</div></div><div class="availability-line">${icon('schedule')} Usually free ${esc((person.availability || ['flexibly']).join(' · '))}</div><div class="dialog-actions"><button class="btn btn-text modal-close" data-action="close-modal">Close</button><button class="btn btn-filled" data-action="ask" data-person="${esc(person.id)}">${icon('swap_horiz')}Ask to swap</button></div>`, 'modal-title')
        }
        if (state.modal === 'schedule') {
            const today = new Date()
                const defaultDay = new Date(today)
                defaultDay.setDate(today.getDate() + 2)
                const dateValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                return dialogShell(`<div class="modal-icon">${icon('event_available')}</div><h2 id="schedule-title">Suggest a time</h2><p class="modal-lead">A simple plan makes a skill swap feel real. Your suggestion will be sent as a chat message.</p><form id="schedule-form" class="form-stack"><div class="schedule-fields">${field({
                        label: 'Date',
                        name: 'date',
                        type: 'date',
                        value: dateValue(defaultDay),
                        attrs: `min="${dateValue(today)}" required`
                    })}${field({
                        label: 'Time',
                        name: 'time',
                        type: 'time',
                        value: '11:00',
                        attrs: 'required'
                    })}</div>${field({
                        label: 'Let’s meet',
                        name: 'meeting_type',
                        options: '<option value="on campus">On campus</option><option value="online">Online</option><option value="somewhere convenient">Somewhere convenient</option>'
                    })}<div class="dialog-actions">${cancel}<button class="btn btn-filled" type="submit">${icon('send')}Send suggestion</button></div></form><div class="modal-footnote">${icon('chat_bubble')} You can work out the details together in chat.</div>`, 'schedule-title')
        }
        return ''
}

function openGifPicker() {
    state.modal = 'gif-picker'
    state.gifSearch = ''
    state.gifResults = []
    state.gifError = ''
    searchGifs('')
}

async function searchGifs(query = '') {
    const apiKey = String(config.giphyApiKey || '').trim()
    const requestId = ++state.gifRequestId
    state.gifSearch = query.slice(0, 50)
    state.gifResults = []
    state.gifError = ''

    if (!apiKey) {
        state.gifLoading = false
        state.gifError = 'Add giphyApiKey to window.SKILLXCHANGE_CONFIG in config.js to search GIPHY.'
        if (state.modal === 'gif-picker') render()
        return
    }

    state.gifLoading = true
    if (state.modal === 'gif-picker') render()
    try {
        const endpoint = state.gifSearch ? 'search' : 'trending'
        const params = new URLSearchParams({
            api_key: apiKey,
            limit: '24',
            rating: 'g',
            bundle: 'messaging_non_clips',
        })
        if (state.gifSearch) params.set('q', state.gifSearch)
        const response = await fetch(`https://api.giphy.com/v1/gifs/${endpoint}?${params}`)
        const payload = await response.json()
        if (!response.ok || payload.meta?.status >= 400) {
            throw new Error(payload.meta?.msg || 'GIPHY could not load GIFs.')
        }
        if (requestId !== state.gifRequestId) return
        state.gifResults = (payload.data || []).map((gif) => {
            const url = giphyMediaUrl(gif.images?.fixed_width?.url || gif.images?.downsized_medium?.url || gif.images?.original?.url)
            const preview = giphyMediaUrl(gif.images?.fixed_width_small?.url || gif.images?.fixed_width?.url) || url
            return url ? { id: gif.id, url, preview, title: gif.title || gif.alt_text || 'GIF' } : null
        }).filter(Boolean)
    } catch (error) {
        if (requestId === state.gifRequestId) state.gifError = error.message || 'GIPHY could not load GIFs.'
    } finally {
        if (requestId === state.gifRequestId) {
            state.gifLoading = false
            if (state.modal === 'gif-picker') render()
        }
    }
}

function formatTime(value) {
    if (!value)
        return ''
        const date = new Date(value)
            return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit'
            })
}

function render() {
    setTheme(state.theme)
    const root = document.getElementById('app')
        root.innerHTML = state.mode === 'app' ? appView() : authView()
        if (state.page === 'chats') {
            const area = document.getElementById('message-area')
                if (area)
                    area.scrollTop = area.scrollHeight
        }
        if (state.mode === 'app' && state.page === 'discover') loadQuoteCollection()
}

function parseSkills(value) {
    return [...new Set(value.split(',').map((skill) => skill.trim()).filter(Boolean))].slice(0, 12)
}

function localLogin(profile) {
    state.isDemo = true
        state.profile = {
        ...clone(demoSeed.profile),
        ...profile,
        id: profile.id || 'demo-student'
    }
    state.demo.profile = state.profile
        state.people = clone(state.demo.people)
        state.requests = clone(state.demo.requests)
        state.conversations = clone(state.demo.conversations)
        state.messages = clone(state.demo.messages)
        state.activeConversation = state.conversations[0]?.id || null
        state.mode = 'app'
        state.page = 'discover'
        persistDemo()
        render()
}

function openDemo() {
    localLogin(state.demo.profile || demoSeed.profile)
    showToast('Welcome to the SkillXChange demo!')
}

function profileFromRow(row) {
    return {
        id: row.id,
        name: row.full_name || row.name || 'Campus student',
        program: row.program || '',
        year: row.year || '',
        bio: row.bio || '',
        offers: row.offers || [],
        wants: row.wants || [],
        availability: row.availability || [],
        color: 'mint',
    }
}

async function loadCloudData() {
    if (!supabase || !cloudUser)
        return
        const uid = cloudUser.id
            const [profileResult, peopleResult, requestResult, conversationResult] = await Promise.all([
                    supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
                    supabase.from('profiles').select('*').neq('id', uid).order('created_at', {
                        ascending: false
                    }),
                    supabase.from('swap_requests').select('*').or(`from_user.eq.${uid},to_user.eq.${uid}`).order('created_at', {
                        ascending: false
                    }),
                    supabase.from('conversations').select('*').or(`member_1.eq.${uid},member_2.eq.${uid}`).order('updated_at', {
                        ascending: false
                    }),
                ])
            for (const result of[profileResult, peopleResult, requestResult, conversationResult]) {
                if (result.error)
                    throw result.error
            }
            cloudProfile = profileResult.data
            if (!cloudProfile) {
                const created = await supabase.from('profiles').upsert({
                    id: uid,
                    full_name: cloudUser.user_metadata?.full_name || cloudUser.email?.split('@')[0] || 'Student',
                    program: cloudUser.user_metadata?.program || '',
                    offers: [],
                    wants: [],
                    availability: [],
                }).select().single()
                    if (created.error)
                        throw created.error
                        cloudProfile = created.data
            }
            state.profile = profileFromRow(cloudProfile)
            state.people = (peopleResult.data || []).map(profileFromRow)
            const peopleMap = new Map(state.people.map((person) => [person.id, person]))
            state.requests = (requestResult.data || []).map((row) => {
                const received = row.to_user === uid
                    const peer = received ? row.from_user : row.to_user
                    return {
                    ...row,
                    personId: peer,
                    direction: received ? 'received' : 'sent',
                    offered_skill: received ? row.offered_skill : row.offered_skill,
                    wanted_skill: row.wanted_skill,
                    person: peopleMap.get(peer)
                }
            })
            state.conversations = (conversationResult.data || []).map((row) => ({
                    ...row,
                    personId: row.member_1 === uid ? row.member_2 : row.member_1,
                    offer: row.offer || 'Skill exchange',
                }))
            state.messages = {}
    if (state.conversations.length) {
        const result = await supabase.from('messages').select('*').in('conversation_id', state.conversations.map((item) => item.id)).order('created_at', {
            ascending: true
        })
            if (result.error)
                throw result.error
                for (const message of result.data || [])
                    (state.messages[message.conversation_id] ||= []).push(message)
    }
    if (!state.conversations.some((conversation) => conversation.id === state.activeConversation))
        state.activeConversation = state.conversations[0]?.id || null
            state.mode = 'app'
}

async function handleAuth(form) {
    const data = new FormData(form)
        const email = String(data.get('email') || '').trim()
        const password = String(data.get('password') || '')
        const signup = state.authMode === 'signup'
        state.busy = true
        render()
        try {
            if (!supabase) {
                if (signup) {
                    const profile = {
                        id: `demo-${Date.now()}`,
                        name: String(data.get('name') || '').trim(),
                        program: String(data.get('program') || '').trim(),
                        bio: 'Ready to learn something new and share what I know.',
                        offers: [],
                        wants: [],
                        availability: ['Weekends'],
                    }
                    state.demo.profile = profile
                        localLogin(profile)
                        showToast('Your demo profile is ready. Add skills to get started!')
                } else {
                    localLogin({
                        ...state.demo.profile,
                        name: state.demo.profile.name || email.split('@')[0]
                    })
                    showToast('Signed in to your local demo.')
                }
                return
            }
            if (signup) {
                const { data: result, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: String(data.get('name') || '').trim(),
                            program: String(data.get('program') || '').trim()
                        }
                    },
                })
                    if (error)
                        throw error
                        if (result.session) {
                            cloudUser = result.user
                                await loadCloudData()
                                render()
                                showToast('Your account is ready. Welcome to the exchange!')
                        } else {
                            state.busy = false
                                state.authMode = 'signin'
                                render()
                                showToast('Check your email to confirm your account, then sign in.')
                        }
            } else {
                const { data: result, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })
                    if (error)
                        throw error
                        cloudUser = result.user
                            await loadCloudData()
                            render()
                            showToast('Welcome back!')
            }
        } catch (error) {
            state.busy = false
                render()
                showToast(authErrorMessage(error), 'error')
        }
}

async function sendSwap(form) {
    const data = new FormData(form)
        const personId = form.dataset.person
        const offer = String(data.get('offered_skill') || '')
        const want = String(data.get('wanted_skill') || '')
        try {
            const duplicate = state.requests.some((request) => request.personId === personId && request.direction === 'sent' && request.status === 'pending')
                if (duplicate) {
                    showToast('You already have a request waiting for this student.', 'error');
                    return
                }
                if (state.isDemo) {
                    state.demo.requests.unshift({
                        id: `req-${Date.now()}`,
                        personId,
                        direction: 'sent',
                        offered_skill: offer,
                        wanted_skill: want,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    })
                    state.requests = clone(state.demo.requests)
                        persistDemo()
                } else {
                    const { error } = await supabase.from('swap_requests').insert({
                        from_user: cloudUser.id,
                        to_user: personId,
                        offered_skill: offer,
                        wanted_skill: want
                    })
                        if (error)
                            throw error
                            await loadCloudData()
                }
                state.modal = ''
                state.modalPerson = null
                render()
                showToast(`Swap request sent to ${personById(personId)?.name?.split(' ')[0] || 'your peer'}!`)
        } catch (error) {
            showToast(error.message || 'Could not send that request.', 'error')
        }
}

async function updateRequest(requestId, status) {
    const request = state.requests.find((item) => item.id === requestId)
        if (!request)
            return
            try {
                if (state.isDemo) {
                    const demoRequest = state.demo.requests.find((item) => item.id === requestId)
                        if (demoRequest)
                            demoRequest.status = status
                                if (status === 'accepted') {
                                    const id = `chat-${request.personId}`
                                        if (!state.demo.conversations.some((chat) => chat.personId === request.personId)) {
                                            state.demo.conversations.unshift({
                                                id,
                                                personId: request.personId,
                                                offer: `${request.wanted_skill} for ${request.offered_skill}`,
                                                last_message: '',
                                                updated_at: new Date().toISOString()
                                            })
                                            state.demo.messages[id] = []
                                        }
                                        state.activeConversation = id
                                }
                                state.requests = clone(state.demo.requests)
                                state.conversations = clone(state.demo.conversations)
                                state.messages = clone(state.demo.messages)
                                persistDemo()
                } else {
                    const { error } = await supabase.from('swap_requests').update({
                        status
                    }).eq('id', requestId)
                        if (error)
                            throw error
                            await loadCloudData()
                            if (status === 'accepted')
                                state.activeConversation = state.conversations.find((chat) => chat.personId === request.personId)?.id || null
                }
                if (status === 'accepted')
                    state.page = 'chats'
                        render()
                        if (status === 'accepted')
                            subscribeToMessages()
                            showToast(status === 'accepted' ? 'It’s a match! Your chat is ready.' : 'Request declined.')
            } catch (error) {
                showToast(error.message || 'Could not update the request.', 'error')
            }
}

async function sendMessage(form, bodyOverride = '') {
    const input = form.elements.message
        const sendButton = form.querySelector('.send-button')
        const body = bodyOverride || input.value.trim()
        const conversationId = form.dataset.conversation
        if (!body)
            return
            input.disabled = true
                if (sendButton)
                    sendButton.disabled = true
                        try {
                            let sentMessage
                            if (state.isDemo) {
                                sentMessage = {
                                    id: `m-${Date.now()}`,
                                    sender_id: state.profile.id,
                                    body,
                                    created_at: new Date().toISOString()
                                }
                                state.demo.messages[conversationId] ||= []
                                state.demo.messages[conversationId].push(sentMessage)
                                const conversation = state.demo.conversations.find((item) => item.id === conversationId)
                                    if (conversation) {
                                        conversation.last_message = body;
                                        conversation.updated_at = sentMessage.created_at
                                    }
                                    state.messages = clone(state.demo.messages)
                                    state.conversations = clone(state.demo.conversations)
                                    persistDemo()
                            } else {
                                const { data, error } = await supabase.from('messages').insert({
                                    conversation_id: conversationId,
                                    sender_id: cloudUser.id,
                                    body
                                }).select().single()
                                    if (error)
                                        throw error
                                        sentMessage = data
                                            state.messages[conversationId] ||= []
                                            if (!state.messages[conversationId].some((message) => message.id === sentMessage.id))
                                                state.messages[conversationId].push(sentMessage)
                                                const conversation = state.conversations.find((item) => item.id === conversationId)
                                                    if (conversation) {
                                                        conversation.last_message = body;
                                                        conversation.updated_at = sentMessage.created_at
                                                    }
                            }
                            input.value = ''
                                input.disabled = false
                                if (sendButton)
                                    sendButton.disabled = false
                                        appendMessageToChat(sentMessage, conversationId, true)
                                        document.querySelector('#message-form input[name="message"]')?.focus()
                        } catch (error) {
                            showToast(error.message || 'Message could not be sent.', 'error')
                            input.disabled = false
                                if (sendButton)
                                    sendButton.disabled = false
                                        input.focus()
                        }
}

function appendMessageToChat(message, conversationId, forceScroll = false) {
    if (!message)
        return
        const list = state.messages[conversationId] ||= []
            if (!list.some((item) => item.id === message.id))
                list.push(message)

                const conversation = state.conversations.find((item) => item.id === conversationId)
                    if (conversation) {
                        conversation.last_message = message.body
                            conversation.updated_at = message.created_at || new Date().toISOString()
                            state.conversations.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
                    }

                    const chatItems = [...document.querySelectorAll('.chat-list-item')]
                    const chatItem = chatItems.find((item) => item.dataset.conversation === conversationId)
                    if (chatItem) {
                        const preview = chatItem.querySelector('.chat-list-copy small')
                            const time = chatItem.querySelector('.chat-time')
                            if (preview)
                                preview.textContent = messagePreview(message.body)
                                    if (time)
                                        time.textContent = 'Now'
                                            if (chatItem.parentElement && chatItem !== chatItem.parentElement.firstElementChild)
                                                chatItem.parentElement.prepend(chatItem)
                    }

                    const form = document.getElementById('message-form')
                    if (!form || form.dataset.conversation !== conversationId || state.activeConversation !== conversationId)
                        return
                        const area = document.getElementById('message-area')
                            if (!area || area.querySelector(`[data-message-id="${CSS.escape(String(message.id))}"]`))
                                return
                                const wasNearBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 90
                                    area.querySelector('.thread-empty')?.remove()
                                    const person = personById(conversation?.personId) || {
                                    id: conversation?.personId,
                                    name: 'Campus student'
                                }
                            area.insertAdjacentHTML('beforeend', messageRowMarkup(message, person))
                            if (forceScroll || wasNearBottom)
                                area.scrollTop = area.scrollHeight
}

async function saveProfile(form) {
    const data = new FormData(form)
        const updated = {
        ...state.profile,
        name: String(data.get('name') || '').trim(),
        program: String(data.get('program') || '').trim(),
        bio: String(data.get('bio') || '').trim(),
        offers: parseSkills(String(data.get('offers') || '')),
        wants: parseSkills(String(data.get('wants') || '')),
        availability: parseSkills(String(data.get('availability') || '')),
    }
    try {
        if (state.isDemo) {
            state.profile = updated
                state.demo.profile = updated
                persistDemo()
        } else {
            const { error } = await supabase.from('profiles').upsert({
                id: cloudUser.id,
                full_name: updated.name,
                program: updated.program,
                bio: updated.bio,
                offers: updated.offers,
                wants: updated.wants,
                availability: updated.availability,
            })
                if (error)
                    throw error
                    cloudProfile = {
                        ...cloudProfile,
                        full_name: updated.name,
                        ...updated
                    }
                state.profile = updated
        }
        render()
        showToast('Your learning profile has been updated.')
    } catch (error) {
        showToast(error.message || 'Could not save your profile.', 'error')
    }
}

async function logout() {
    if (supabase && !state.isDemo)
        await supabase.auth.signOut()
        if (realtimeChannel && supabase) {
            await supabase.removeChannel(realtimeChannel);
            realtimeChannel = null
        }
    cloudUser = null;
    cloudProfile = null
        state.isDemo = false;
    state.mode = 'auth';
    state.authMode = 'signin';
    state.profile = null
        render()
}

function subscribeToMessages() {
    if (!supabase || !cloudUser || !state.activeConversation)
        return
        if (realtimeChannel)
            supabase.removeChannel(realtimeChannel)
            const conversationId = state.activeConversation
                realtimeChannel = supabase.channel(`messages:${conversationId}`).on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                }, (payload) => {
                    appendMessageToChat(payload.new, conversationId)
                }).subscribe()
}

function suggestTime() {
    state.modal = 'schedule'
        render()
}

function sendScheduleProposal(form) {
    const data = new FormData(form)
        const date = new Date(`${data.get('date')}T${data.get('time')}`)
        if (Number.isNaN(date.getTime())) {
            showToast('Choose a valid date and time.', 'error');
            return
        }
        const dayAndTime = date.toLocaleString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })
        const body = `Would you be free to meet ${dayAndTime} ${data.get('meeting_type')} for our skill swap?`
        state.modal = ''
        render()
        const input = document.querySelector('#message-form input[name="message"]')
        if (input) {
            input.value = body;
            input.form.requestSubmit()
        }
}

document.addEventListener('submit', (event) => {
    const form = event.target
        if (form.id === 'auth-form') {
            event.preventDefault();
            handleAuth(form)
        }
        if (form.id === 'swap-form') {
            event.preventDefault();
            sendSwap(form)
        }
        if (form.id === 'message-form') {
            event.preventDefault();
            sendMessage(form)
        }
        if (form.id === 'gif-search-form') {
            event.preventDefault();
            searchGifs(form.elements.query.value.trim())
        }
        if (form.id === 'schedule-form') {
            event.preventDefault();
            sendScheduleProposal(form)
        }
        if (form.id === 'profile-form') {
            event.preventDefault();
            saveProfile(form)
        }
        if (form.id === 'search-form') {
            event.preventDefault();
            state.search = document.getElementById('skill-search')?.value || '';
            render()
        }
})

document.addEventListener('input', (event) => {
    if (event.target.id === 'skill-search') {
        const input = event.target
            const start = input.selectionStart
            state.search = input.value
            render()
            const next = document.getElementById('skill-search')
            next?.focus();
        next?.setSelectionRange(start, start)
    }
})

document.addEventListener('click', async(event) => {
    const button = event.target.closest('[data-action]')
        if (!button)
            return
            const { action } = button.dataset
        if (action === 'navigate') {
            state.page = button.dataset.page
                state.chatListOpen = state.page === 'chats'
                state.modal = ''
                render()
                if (state.page === 'chats')
                    subscribeToMessages()
        }
        if (action === 'toggle-theme') {
            setTheme(state.theme === 'dark' ? 'light' : 'dark');
            render()
        }
        if (action === 'auth-mode') {
            state.authMode = button.dataset.mode;
            render()
        }
        if (action === 'demo-login')
            openDemo()
            if (action === 'toggle-password') {
                const input = button.parentElement.querySelector('input')
                    input.type = input.type === 'password' ? 'text' : 'password'
                    button.innerHTML = icon(input.type === 'password' ? 'visibility' : 'visibility_off')
            }
        if (action === 'category') {
            state.category = button.dataset.category;
            render()
        }
        if (action === 'next-quote') showNextQuote()
        if (action === 'open-gif-picker') openGifPicker()
        if (action === 'send-gif') {
            const url = giphyMediaUrl(button.dataset.gifUrl)
            if (!url) {
                showToast('That GIF link is not valid.', 'error')
                return
            }
            state.modal = ''
            render()
            const form = document.getElementById('message-form')
            if (form) await sendMessage(form, `${GIF_MESSAGE_PREFIX}${url}`)
        }
        if (action === 'clear-search') {
            state.search = '';
            render();
            document.getElementById('skill-search')?.focus()
        }
        if (action === 'clear-filters') {
            state.search = '';
            state.category = 'All';
            render()
        }
        if (action === 'ask') {
            state.modalPerson = personById(button.dataset.person)
                if (!state.modalPerson) {
                    showToast('This profile is no longer available.', 'error');
                    return
                }
                state.modal = 'ask';
            render()
        }
        if (action === 'edit-profile-modal') {
            state.modal = '';
            state.page = state.profile?.offers?.length ? state.page : 'profile';
            render()
        }
        if (action === 'person-details') {
            state.modalPerson = personById(button.dataset.person);
            state.modal = 'details';
            render()
        }
        if (action === 'close-modal') {
            if (event.target.closest('.modal-card') && !button.classList.contains('modal-close'))
                return
                state.modal = '';
            state.modalPerson = null;
            render()
        }
        if (action === 'request-tab') {
            state.requestTab = button.dataset.tab;
            render()
        }
        if (action === 'accept-request')
            updateRequest(button.dataset.request, 'accepted')
            if (action === 'decline-request')
                updateRequest(button.dataset.request, 'declined')
                if (action === 'select-chat') {
                    state.activeConversation = button.dataset.conversation;
                    state.chatListOpen = false;
                    render();
                    subscribeToMessages()
                }
        if (action === 'chat-list') {
            state.chatListOpen = true;
            render()
        }
        if (action === 'open-person-chat') {
            const conversation = state.conversations.find((item) => item.personId === button.dataset.person)
                if (conversation) {
                    state.activeConversation = conversation.id;
                    state.chatListOpen = false;
                    state.page = 'chats';
                    render();
                    subscribeToMessages()
                }
        }
        if (action === 'suggest-time')
            suggestTime()
            if (action === 'logout')
                logout()
                if (action === 'google-auth') {
                    if (!supabase) {
                        showToast('Add Supabase credentials in config.js to enable Google sign-in.', 'error');
                        return
                    }
                    if (state.oauthBusy)
                        return
                        state.oauthBusy = true
                            render()
                            try {
                                const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo,
                                            queryParams: {
                                                access_type: 'offline',
                                                prompt: 'select_account'
                                            }
                                        },
                                    })
                                    if (error)
                                        throw error
                            } catch (error) {
                                state.oauthBusy = false
                                    render()
                                    showToast(error.message || 'Google sign-in could not be started.', 'error')
                            }
                }
})

async function start() {
    setTheme(state.theme)
    render()
    if (!supabase) {
        return
    }

    let session = null
    try {
        const { data } = await supabase.auth.getSession()
        session = data?.session || null
    } catch (error) {
        console.warn('Could not restore the Supabase session.', error)
        showToast('Could not restore your session. You can still explore the demo.', 'error')
    }

        if (session?.user) {
            cloudUser = session.user
                try {
                    await loadCloudData()
                } catch (error) {
                    showToast(error.message || 'Could not load your profile.', 'error')
                }
        }
        render()
        supabase.auth.onAuthStateChange(async(_event, sessionState) => {
            if (sessionState?.user && !state.isDemo) {
                cloudUser = sessionState.user
                    try {
                        await loadCloudData();
                        render()
                    } catch (error) {
                        showToast(error.message || 'Could not load your account.', 'error')
                    }
            } else if (!sessionState?.user && !state.isDemo) {
                cloudUser = null
                    if (state.mode === 'app') {
                        state.mode = 'auth';
                        render()
                    }
            }
        })
}

start()
