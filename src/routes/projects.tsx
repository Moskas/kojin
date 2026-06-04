import { Hono } from 'hono'
import matter from 'gray-matter'
import { ProjectsIndex } from '../views/projects/index'

const PROJECTS_DIR = `${process.cwd()}/content/projects`

export interface ProjectMeta {
  title: string
  description: string
  tech: string[]
  url?: string
  source?: string
  status: 'active' | 'archived' | 'wip'
  year: number
}

export interface Project {
  slug: string
  meta: ProjectMeta
}

async function listProjects(): Promise<Project[]> {
  const glob = new Bun.Glob('*.md')
  const files = [...glob.scanSync(PROJECTS_DIR)].sort().reverse()

  return Promise.all(
    files.map(async (filename) => {
      const source = await Bun.file(`${PROJECTS_DIR}/${filename}`).text()
      const { data } = matter(source)
      return { slug: filename.replace(/\.md$/, ''), meta: data as ProjectMeta }
    })
  )
}

export const projectsRoutes = new Hono()

projectsRoutes.get('/', async (c) => {
  const projects = await listProjects()
  return c.html(<ProjectsIndex projects={projects} />)
})
