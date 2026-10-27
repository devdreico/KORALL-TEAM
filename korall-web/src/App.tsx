import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Compass,
  Globe2,
  Goal,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Trophy,
  Sun,
  Users,
  X,
} from 'lucide-react'
import {
  coordinationStatuses,
  createCoordination,
  loadCoordinations,
  saveCoordinations,
  type Coordination,
  type CoordinationStatus,
  type Sector,
  type SectorFilter,
} from './coordinations'
import './App.css'

const navigation = [
  { label: 'Resumen', icon: LayoutDashboard, target: 'overview' },
  { label: 'Red global', icon: Globe2, target: 'network' },
  { label: 'Divisiones', icon: Compass, target: 'divisions' },
  { label: 'Coordinaciones', icon: CalendarDays, target: 'operations' },
]

type Theme = 'light' | 'dark'

function readThemePreference(): Theme {
  try {
    const savedTheme = window.localStorage.getItem('korall.theme.v1')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function App() {
  const [theme, setTheme] = useState<Theme>(readThemePreference)
  const [activeSection, setActiveSection] = useState('overview')
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [coordinations, setCoordinations] = useState(() => loadCoordinations())
  const [isStorageAvailable, setIsStorageAvailable] = useState(true)
  const [selectedCoordination, setSelectedCoordination] = useState<Coordination | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newSector, setNewSector] = useState<Sector>('gaming')
  const [newOwner, setNewOwner] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const dialogRef = useRef<HTMLElement>(null)
  const isDialogOpen = isModalOpen || selectedCoordination !== null

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#111111' : '#f3f3f3',
    )
    try {
      window.localStorage.setItem('korall.theme.v1', theme)
    } catch {
      return
    }
  }, [theme])

  useEffect(() => {
    if (!isDialogOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    dialog?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()

    function handleDialogKeys(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
        setSelectedCoordination(null)
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      ))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleDialogKeys)
    return () => {
      window.removeEventListener('keydown', handleDialogKeys)
      previousFocus?.focus()
    }
  }, [isDialogOpen])

  const filteredCoordinations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es')
    return coordinations.filter((item) => {
      const matchesSector = sectorFilter === 'all' || item.sector === sectorFilter
      const matchesQuery =
        !query ||
        `${item.title} ${item.location} ${item.owner ?? ''} ${item.description ?? ''} ${item.status}`
          .toLocaleLowerCase('es')
          .includes(query)
      return matchesSector && matchesQuery
    })
  }, [coordinations, search, sectorFilter])

  function navigateTo(target: string) {
    setActiveSection(target)
    setIsMobileNavOpen(false)
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
  }

  function addCoordination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = newTitle.trim()
    const location = newLocation.trim()
    if (!title || !location) return

    commitCoordinations([
      createCoordination({
        title,
        sector: newSector,
        location,
        status: 'new',
        ...(newOwner.trim() && { owner: newOwner.trim() }),
        ...(newDueDate && { dueDate: newDueDate }),
        ...(newDescription.trim() && { description: newDescription.trim() }),
      }),
      ...coordinations,
    ])
    setNewTitle('')
    setNewLocation('')
    setNewSector('gaming')
    setNewOwner('')
    setNewDueDate('')
    setNewDescription('')
    setIsModalOpen(false)
  }

  function updateCoordinationStatus(id: string, status: CoordinationStatus) {
    commitCoordinations(coordinations.map((item) => item.id === id ? { ...item, status } : item))
    setSelectedCoordination((item) => item?.id === id ? { ...item, status } : item)
  }

  function commitCoordinations(items: Coordination[]) {
    setCoordinations(items)
    setIsStorageAvailable(saveCoordinations(items))
  }

  function formatDate(value: string) {
    const [year, month, day] = value.slice(0, 10).split('-')
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}`
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMobileNavOpen ? 'sidebar-open' : ''}`}>
        <a className="brand-lockup" href="#overview" onClick={() => navigateTo('overview')}>
          <span className="brand-name-wrap">
            <span className="brand-name">KORALL</span>
            <span className="brand-caption">E-SPORTS · SPORTS</span>
          </span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-icon"><Globe2 size={16} /></span>
          <span className="workspace-copy">
            <span>Equipo</span>
            <strong>Korall Competitive</strong>
          </span>
          <ChevronDown size={15} className="workspace-chevron" />
        </div>

        <div className="nav-group-label">PLATAFORMA</div>
        <nav className="primary-nav" aria-label="Navegación principal">
          {navigation.map(({ label, icon: Icon, target }) => (
            <a
              key={target}
              className={`nav-link ${activeSection === target ? 'nav-link-active' : ''}`}
              href={`#${target}`}
              aria-current={activeSection === target ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault()
                navigateTo(target)
              }}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {target === 'operations' && <span className="nav-count">{String(coordinations.length).padStart(2, '0')}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="nav-group-label">ECOSISTEMA</div>
        <div className="ecosystem-shortcuts">
          <button type="button" className="ecosystem-link" onClick={() => { setSectorFilter('gaming'); navigateTo('divisions') }}>
            <span className="ecosystem-dot dot-gaming" />
            <span>Korall Gaming</span>
            <ArrowUpRight size={14} />
          </button>
          <button type="button" className="ecosystem-link" onClick={() => { setSectorFilter('football'); navigateTo('divisions') }}>
            <span className="ecosystem-dot dot-football" />
            <span>Korall Fútbol</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="sidebar-spacer" />
        <div className="origin-card">
          <div className="origin-icon"><MapPin size={15} /></div>
          <div>
            <span className="origin-label">BASE DEL EQUIPO</span>
            <strong>Vancouver, EE. UU.</strong>
          </div>
          <span className="origin-pulse" aria-label="Sede de origen" />
        </div>
        <button type="button" className="profile-button" aria-label="Perfil de equipo">
          <span className="profile-avatar">K</span>
          <span className="profile-copy"><strong>Equipo Korall</strong><small>Coordinación global</small></span>
          <ChevronDown size={15} />
        </button>
      </aside>

      {isMobileNavOpen && (
        <button className="mobile-scrim" aria-label="Cerrar navegación" onClick={() => setIsMobileNavOpen(false)} />
      )}

      <main className="main-column">
        <header className="topbar">
          <button
            type="button"
            className="icon-button mobile-menu-button"
            aria-label="Abrir navegación"
            onClick={() => setIsMobileNavOpen(true)}
          ><Menu size={19} /></button>
          <div className="breadcrumb"><span>Korall Team</span><ChevronRight size={14} /><strong>Centro de coordinación</strong></div>
          <div className="topbar-actions">
            <span className="concept-tag"><span /> E-SPORTS + SPORTS</span>
            <button
              type="button"
              className="icon-button theme-toggle"
              aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
              title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
            >{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
            <div className="notification-wrap">
              <button
                type="button"
                className={`icon-button notification-button ${isNotificationsOpen ? 'icon-button-selected' : ''}`}
                aria-label="Notificaciones"
                aria-expanded={isNotificationsOpen}
                onClick={() => setIsNotificationsOpen((open) => !open)}
              ><Bell size={17} /><span className="notification-dot" /></button>
              {isNotificationsOpen && (
                <div className="notification-popover">
                  <strong>Centro de actividad</strong>
                  <p>La coordinación entre divisiones mantiene a Korall en movimiento.</p>
                  <button type="button" onClick={() => { setIsNotificationsOpen(false); navigateTo('operations') }}>Ver coordinaciones <ArrowRight size={14} /></button>
                </div>
              )}
            </div>
            <span className="topbar-avatar">K</span>
          </div>
        </header>

        <div className="page-content">
          <section className="intro-section" id="overview">
            <div className="eyebrow"><span className="eyebrow-line" /> EQUIPO · COMPETENCIA · CRECIMIENTO</div>
            <div className="intro-row">
              <div>
                <h1>Competimos juntos.<br className="desktop-break" /> <span>Crecemos sin fronteras.</span></h1>
                <p className="intro-copy">Desde Vancouver, Korall une talento de e-sports y deportes con una mentalidad competitiva, comunitaria y hecha para llegar más lejos.</p>
              </div>
              <button type="button" className="primary-button intro-cta" onClick={() => setIsModalOpen(true)}>
                <Plus size={17} /> Nueva coordinación
              </button>
            </div>
            <div className="signal-row" aria-label="Presencia y divisiones de Korall">
              <div className="signal-item">
                <span className="signal-icon signal-origin"><MapPin size={16} /></span>
                <span><small>SEDE FUNDACIONAL</small><strong>Vancouver, EE. UU.</strong></span>
              </div>
              <div className="signal-separator" />
              <div className="signal-item">
                <span className="signal-icon signal-gaming"><Radio size={16} /></span>
                <span><small>RED INTERNACIONAL</small><strong>Afiliados gaming</strong></span>
              </div>
              <div className="signal-separator" />
              <div className="signal-item">
                <span className="signal-icon signal-football"><Goal size={17} /></span>
                <span><small>DEPORTE COMUNITARIO</small><strong>Colombia · Brasil</strong></span>
              </div>
            </div>
          </section>

          <section className="overview-grid" id="network" aria-label="Red internacional de Korall">
            <div className="glass-panel network-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">PRESENCIA DEL EQUIPO</span><h2>Una comunidad. Muchos escenarios.</h2></div>
                <button type="button" className="subtle-icon-button" aria-label="Ver divisiones" onClick={() => navigateTo('divisions')}><ArrowUpRight size={17} /></button>
              </div>
              <div className="network-map">
                <div className="map-grid" />
                <svg className="network-lines" viewBox="0 0 760 310" role="img" aria-label="Conexiones entre Vancouver, Colombia, Brasil y afiliados internacionales">
                  <defs>
                    <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#56d7bd" stopOpacity=".9" />
                      <stop offset="100%" stopColor="#88a9f3" stopOpacity=".55" />
                    </linearGradient>
                  </defs>
                  <path className="route route-primary" d="M116 88 Q236 32 345 143" />
                  <path className="route" d="M116 88 Q188 161 252 211" />
                  <path className="route" d="M252 211 Q278 240 302 253" />
                  <path className="route" d="M345 143 Q440 71 544 107" />
                  <path className="route" d="M345 143 Q473 193 633 152" />
                  <path className="route route-primary" d="M302 253 Q461 290 633 152" />
                  <circle className="map-node node-vancouver" cx="116" cy="88" r="7" />
                  <circle className="map-node node-network" cx="345" cy="143" r="6" />
                  <circle className="map-node node-colombia" cx="252" cy="211" r="6" />
                  <circle className="map-node node-brazil" cx="302" cy="253" r="6" />
                  <circle className="map-node node-network" cx="544" cy="107" r="5" />
                  <circle className="map-node node-network" cx="633" cy="152" r="5" />
                </svg>
                <span className="map-label label-vancouver"><i />Vancouver</span>
                <span className="map-label label-colombia"><i />Colombia</span>
                <span className="map-label label-brazil"><i />Brasil</span>
                <span className="map-label label-world"><i />Afiliados gaming</span>
                <span className="map-coordinate">RED DISTRIBUIDA <span>·</span> 2026</span>
              </div>
              <div className="map-legend">
                <span><i className="legend-dot legend-hq" /> Sede</span>
                <span><i className="legend-dot legend-physical" /> Microfútbol</span>
                <span><i className="legend-dot legend-affiliate" /> Afiliados</span>
                <span className="map-legend-note"><Activity size={14} /> Conexión entre divisiones</span>
              </div>
            </div>

            <aside className="glass-panel mission-panel">
              <div className="mission-topline"><span className="section-kicker">NORTE COMÚN</span><span className="mission-symbol"><Compass size={18} /></span></div>
              <div className="mission-copy">
                <span className="mission-index">01 / 03</span>
                <h2>La comunidad<br />es el <em>centro</em>.</h2>
                <p>Construimos oportunidades para competir, representar y crecer juntos: en el juego, en la cancha y en cada comunidad.</p>
              </div>
              <div className="mission-divider" />
              <div className="mission-meta"><span>ENFOQUE</span><strong>Participación con propósito</strong></div>
              <button type="button" className="text-action" onClick={() => navigateTo('divisions')}>Conoce el ecosistema <ArrowRight size={15} /></button>
              <span className="mission-watermark" aria-hidden="true">K</span>
            </aside>
          </section>

          <section className="divisions-section" id="divisions">
            <div className="section-heading-row">
              <div><span className="section-kicker">EL EQUIPO KORALL</span><h2>Dos disciplinas. Una misma ambición.</h2></div>
              <span className="section-aside">CRECER MÁS ALLÁ DE HOY <ArrowDownRight size={15} /></span>
            </div>
            <div className="division-grid">
              <article className="division-card gaming-card">
                <div className="division-card-top"><span className="division-icon gaming-icon"><Radio size={19} /></span><span className="division-number">01</span></div>
                <div className="division-body"><span className="division-label">KORALL · E-SPORTS</span><h3>La arena<br />competitiva</h3><p>Comunidad y afiliados en distintos juegos, unidos para crear oportunidades de participación y competencia.</p></div>
                <div className="division-footer"><span><span className="status-indicator" /> Red global</span><button type="button" aria-label="Filtrar coordinaciones de gaming" onClick={() => { setSectorFilter('gaming'); navigateTo('operations') }}><ArrowUpRight size={17} /></button></div>
                <span className="division-watermark gaming-watermark" aria-hidden="true">K·G</span>
              </article>
              <article className="division-card football-card">
                <div className="division-card-top"><span className="division-icon football-icon"><Goal size={20} /></span><span className="division-number">02</span></div>
                <div className="division-body"><span className="division-label">KORALL · SPORTS</span><h3>El juego<br />en la cancha</h3><p>Afiliados de microfútbol en Colombia y Brasil llevan el deporte y la competencia al corazón de cada comunidad.</p></div>
                <div className="division-footer"><span><span className="status-indicator status-coral" /> Colombia · Brasil</span><button type="button" aria-label="Filtrar coordinaciones de microfútbol" onClick={() => { setSectorFilter('football'); navigateTo('operations') }}><ArrowUpRight size={17} /></button></div>
                <span className="division-watermark football-watermark" aria-hidden="true">K·F</span>
              </article>
              <article className="division-card growth-card">
                <div className="division-card-top"><span className="division-icon growth-icon"><ShieldCheck size={19} /></span><span className="division-number">03</span></div>
                <div className="division-body"><span className="division-label">KORALL · PRÓXIMO NIVEL</span><h3>El siguiente<br />capítulo</h3><p>Identificar talento, fortalecer alianzas y abrir nuevos caminos para que el equipo siga evolucionando.</p></div>
                <div className="division-footer"><span><span className="status-indicator status-blue" /> Ambición global</span><button type="button" aria-label="Ver red de Korall" onClick={() => navigateTo('network')}><ArrowUpRight size={17} /></button></div>
                <span className="division-watermark growth-watermark" aria-hidden="true">K+</span>
              </article>
            </div>
          </section>

          <section className="operations-section" id="operations">
            <div className="section-heading-row operations-heading">
              <div><span className="section-kicker">CENTRO DE COORDINACIÓN</span><h2>El movimiento de hoy.</h2><p>Escenarios de trabajo para mantener conectadas las divisiones.</p></div>
              <button type="button" className="secondary-button" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Añadir tarea</button>
            </div>
            <div className="operations-panel glass-panel">
              <div className="operations-toolbar">
                <div className="filter-tabs" role="group" aria-label="Filtrar por división">
                  {([
                    ['all', 'Todas'],
                    ['gaming', 'Gaming'],
                    ['football', 'Microfútbol'],
                  ] as const).map(([filter, label]) => (
                    <button key={filter} type="button" className={sectorFilter === filter ? 'filter-tab filter-tab-active' : 'filter-tab'} aria-pressed={sectorFilter === filter} onClick={() => setSectorFilter(filter)}>{label}</button>
                  ))}
                </div>
                <label className="search-field"><Search size={16} /><span className="sr-only">Buscar coordinaciones</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar coordinación" /></label>
              </div>
              <div className="coordination-list" aria-live="polite">
                {filteredCoordinations.map((item) => (
                  <article className="coordination-row" key={item.id}>
                    <span className={`task-icon ${item.sector === 'gaming' ? 'task-gaming' : 'task-football'}`}>{item.sector === 'gaming' ? <Trophy size={17} /> : <Goal size={18} />}</span>
                    <div className="task-main"><strong>{item.title}</strong><span><MapPin size={13} />{item.location}</span>{item.owner && <span className="task-owner"><Users size={12} />{item.owner}</span>}</div>
                    <label className={`task-status status-${item.status}`}>
                      <i />
                      <span className="sr-only">Estado de {item.title}</span>
                      <select value={item.status} onChange={(event) => updateCoordinationStatus(item.id, event.target.value as CoordinationStatus)}>
                        {coordinationStatuses.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <span className="task-time">{item.dueDate ? formatDate(item.dueDate) : formatDate(item.createdAt)}</span>
                    <button type="button" className="task-open" aria-label={`Ver detalles de ${item.title}`} onClick={() => setSelectedCoordination(item)}><ChevronRight size={17} /></button>
                  </article>
                ))}
                {filteredCoordinations.length === 0 && <div className="empty-state"><CircleDot size={19} /><strong>No hay coordinaciones con esos criterios</strong><span>Prueba otra búsqueda o cambia el filtro.</span></div>}
              </div>
              <div className="operations-footer"><span><span className="footer-pulse" />{isStorageAvailable ? 'Guardado en este navegador' : 'No se pudo guardar en este navegador'}</span><span>{filteredCoordinations.length} {filteredCoordinations.length === 1 ? 'elemento' : 'elementos'} <ArrowRight size={14} /></span></div>
            </div>
          </section>

          <footer className="page-footer"><span>© 2026 KORALL TEAM</span><span><Users size={14} /> Personas primero. Competimos juntos.</span><a href="#overview" onClick={() => navigateTo('overview')}>Volver arriba <ArrowUpRight size={13} /></a></footer>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false) }}>
          <section ref={dialogRef} tabIndex={-1} className="coordination-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading"><span className="modal-icon"><CalendarDays size={19} /></span><button type="button" className="icon-button" aria-label="Cerrar" onClick={() => setIsModalOpen(false)}><X size={18} /></button></div>
            <span className="section-kicker">CENTRO DE COORDINACIÓN</span><h2 id="modal-title">Crear coordinación</h2><p>Registra un nuevo frente de trabajo para el equipo.</p>
            <form onSubmit={addCoordination}>
              <label>Título<input autoFocus required value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Ej. Jornada de afiliados" /></label>
              <div className="modal-fields-row"><label>División<select value={newSector} onChange={(event) => setNewSector(event.target.value as Sector)}><option value="gaming">Gaming</option><option value="football">Microfútbol</option></select></label><label>Región<input required value={newLocation} onChange={(event) => setNewLocation(event.target.value)} placeholder="Ciudad o región" /></label></div>
              <div className="modal-fields-row"><label>Responsable <span className="optional-label">Opcional</span><input value={newOwner} onChange={(event) => setNewOwner(event.target.value)} placeholder="Persona o equipo" /></label><label>Fecha objetivo <span className="optional-label">Opcional</span><input type="date" value={newDueDate} onChange={(event) => setNewDueDate(event.target.value)} /></label></div>
              <label>Notas <span className="optional-label">Opcional</span><textarea rows={3} value={newDescription} onChange={(event) => setNewDescription(event.target.value)} placeholder="Contexto para el equipo" /></label>
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button"><Check size={16} /> Crear coordinación</button></div>
            </form>
          </section>
        </div>
      )}

      {selectedCoordination && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCoordination(null) }}>
          <section ref={dialogRef} tabIndex={-1} className="coordination-modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="modal-heading"><span className={`task-icon ${selectedCoordination.sector === 'gaming' ? 'task-gaming' : 'task-football'}`}>{selectedCoordination.sector === 'gaming' ? <Trophy size={17} /> : <Goal size={18} />}</span><button type="button" className="icon-button" aria-label="Cerrar detalles" onClick={() => setSelectedCoordination(null)}><X size={18} /></button></div>
            <span className="section-kicker">{selectedCoordination.sector === 'gaming' ? 'KORALL · GAMING' : 'KORALL · MICROFÚTBOL'}</span>
            <h2 id="detail-title">{selectedCoordination.title}</h2>
            <div className="detail-location"><MapPin size={14} />{selectedCoordination.location}</div>
            <label className="detail-status-field">Estado<select value={selectedCoordination.status} onChange={(event) => updateCoordinationStatus(selectedCoordination.id, event.target.value as CoordinationStatus)}>{coordinationStatuses.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label>
            <div className="detail-meta-grid">
              <div><span>RESPONSABLE</span><strong>{selectedCoordination.owner || 'Sin asignar'}</strong></div>
              <div><span>FECHA OBJETIVO</span><strong>{selectedCoordination.dueDate ? formatDate(selectedCoordination.dueDate) : 'Sin fecha'}</strong></div>
              <div><span>CREADA</span><strong>{formatDate(selectedCoordination.createdAt)}</strong></div>
            </div>
            {selectedCoordination.description && <div className="detail-description"><span>NOTAS</span><p>{selectedCoordination.description}</p></div>}
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setSelectedCoordination(null)}>Cerrar</button></div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
