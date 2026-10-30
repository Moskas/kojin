import { Hono } from 'hono'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import { remarkAlerts } from '../content/alerts'
import rehypeStringify from 'rehype-stringify'
import { ProjectsIndex } from '../views/projects/index'

const PROJECTS_DIR = `${process.cwd()}/content/projects`

export interface ProjectLink {
  label: string
  href: string
}

export interface ProjectMeta {
  title: string
  description: string
  tech: string[]
  url?: string
  source?: string
  links?: ProjectLink[]
  image?: string
  alt?: string
  status: 'active' | 'archived' | 'wip'
  year: number
}

export interface Project {
  slug: string
  meta: ProjectMeta
  descriptionHtml: string
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkAlerts)
  .use(remarkRehype)
  .use(rehypeStringify)

// renders inline markdown, dropping the wrapping paragraph
async function renderInline(markdown: string): Promise<string> {
  const html = String(await processor.process(markdown))
  return html.trim().replace(/^<p>([\s\S]*)<\/p>$/, '$1')
}

async function listProjects(): Promise<Project[]> {
  const glob = new Bun.Glob('*.md')
  const files = [...glob.scanSync(PROJECTS_DIR)].sort().reverse()

  return Promise.all(
    files.map(async (filename) => {
      const source = await Bun.file(`${PROJECTS_DIR}/${filename}`).text()
      const { data } = matter(source)
      const meta = data as ProjectMeta
      return {
        slug: filename.replace(/\.md$/, ''),
        meta,
        descriptionHtml: await renderInline(meta.description ?? ''),
      }
    })
  )
}

export const projectsRoutes = new Hono()

projectsRoutes.get('/', async (c) => {
  const projects = await listProjects()
  return c.html(<ProjectsIndex projects={projects} />)
})
