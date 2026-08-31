import {
  ArrowDownUp,
  BookOpen,
  Droplets,
  FlaskConical,
  Gauge,
  Play,
  Search,
  Sparkles,
  ThumbsUp,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { curatedStories, type CuratedStory } from './curated-stories'

type ArchiveProps = {
  onStudio: () => void
  onPlay: (story: CuratedStory) => void
}

export default function Archive({ onStudio, onPlay }: ArchiveProps) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'approval' | 'latest'>('approval')

  const stories = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return curatedStories
      .filter((story) => !keyword || [story.title, story.surface, story.author, ...story.tags].join(' ').toLowerCase().includes(keyword))
      .sort((left, right) => sort === 'approval'
        ? right.approval - left.approval
        : Date.parse(right.createdAt) - Date.parse(left.createdAt))
  }, [query, sort])

  return (
    <main className="app-shell archive-shell">
      <header className="topbar">
        <button className="brand" onClick={onStudio} aria-label="返回盲汤创作桌">
          <span className="brand-mark"><Droplets size={20} /></span>
          <span>盲汤 <small>BLIND SOUP</small></span>
        </button>
        <nav className="topnav" aria-label="主导航">
          <button onClick={onStudio}><FlaskConical size={16} /> 创作桌</button>
          <button className="active"><BookOpen size={16} /> 汤局档案</button>
        </nav>
        <div className="top-actions">
          <span className="local-chip"><span /> {curatedStories.length} 碗原创汤</span>
        </div>
      </header>

      <section className="archive-intro">
        <div>
          <span className="eyebrow">CURATED CASES</span>
          <h1>汤局档案</h1>
          <p>从编辑精选题开始推理，或回到创作桌自由编织一碗新汤。</p>
        </div>
        <button className="archive-create" onClick={onStudio}><Sparkles size={17} /> 自由编织</button>
      </section>

      <section className="archive-toolbar" aria-label="档案筛选">
        <label className="archive-search">
          <Search size={17} />
          <input aria-label="搜索标题、标签或作者" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、标签或作者" />
        </label>
        <div className="archive-sort" role="group" aria-label="排序方式">
          <span><ArrowDownUp size={15} /> 排序</span>
          <button className={sort === 'approval' ? 'active' : ''} onClick={() => setSort('approval')}>好评优先</button>
          <button className={sort === 'latest' ? 'active' : ''} onClick={() => setSort('latest')}>最新收录</button>
        </div>
      </section>

      <section className="archive-list" aria-live="polite">
        {stories.map((story, index) => (
          <article className="archive-card" key={story.id}>
            <div className="archive-index">{String(index + 1).padStart(2, '0')}</div>
            <div className="archive-copy">
              <div className="archive-card-head">
                <span>{story.author}</span>
                <time dateTime={story.createdAt}>{story.createdAt.replaceAll('-', '.')}</time>
              </div>
              <h2>{story.title}</h2>
              <p>{story.surface}</p>
              <div className="archive-tags">{story.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div className="archive-metrics">
              <span><ThumbsUp size={14} /><strong>{story.approval}%</strong> 好评</span>
              <span><UsersRound size={14} /><strong>{story.plays.toLocaleString()}</strong> 试玩</span>
              <span><Gauge size={14} /><strong>{story.difficulty}/5</strong> 难度</span>
            </div>
            <button className="archive-play" onClick={() => onPlay(story)} aria-label={`开始推理${story.title}`}>
              <Play size={17} fill="currentColor" /> 开始推理
            </button>
          </article>
        ))}
        {stories.length === 0 && (
          <div className="archive-empty"><BookOpen size={24} /><strong>没有匹配的汤局</strong><span>换个关键词试试</span></div>
        )}
      </section>
    </main>
  )
}
