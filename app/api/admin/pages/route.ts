import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const NAVIGATION_PAGES = [
  { id: 'homepage', name: 'Homepage', path: '/' },
  { id: 'advertisements', name: 'Advertisements', path: '/advertisements' },
  { id: 'contact', name: 'Contact', path: '/contact' },
  { id: 'register', name: 'Register', path: '/auth/register' },
  { id: 'career', name: 'Career', path: '/career' }
]

// Create pages directory if it doesn't exist
const ensurePagesDir = async () => {
  const pagesDir = join(process.cwd(), 'app')
  if (!existsSync(pagesDir)) {
    await mkdir(pagesDir, { recursive: true })
  }
}

export async function GET(request: NextRequest) {
  try {
    const pagesData = NAVIGATION_PAGES.map(page => {
      const pagePath = join(process.cwd(), 'app', page.id === 'homepage' ? 'page.tsx' : `${page.id}/page.tsx`)
      let content = ''
      let exists = false
      
      if (existsSync(pagePath)) {
        exists = true
        try {
          // Read file content (simplified - in production you'd use fs.readFile)
          content = `// Page content for ${page.name}`
        } catch (error) {
          content = ''
        }
      }
      
      return {
        ...page,
        exists,
        content: content || `// Default content for ${page.name}`
      }
    })

    return NextResponse.json(pagesData)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pageId, content, title } = await request.json()
    
    if (!pageId || !content) {
      return NextResponse.json({ error: 'Page ID and content are required' }, { status: 400 })
    }

    const pageInfo = NAVIGATION_PAGES.find(p => p.id === pageId)
    if (!pageInfo) {
      return NextResponse.json({ error: 'Invalid page ID' }, { status: 400 })
    }

    // Create page directory if it doesn't exist
    await ensurePagesDir()
    
    const pageDir = join(process.cwd(), 'app', pageId)
    if (pageId !== 'homepage' && !existsSync(pageDir)) {
      await mkdir(pageDir, { recursive: true })
    }

    // Write page content
    const pagePath = join(pageId === 'homepage' ? 'app' : pageDir, 'page.tsx')
    const pageContent = `'use client'

import { motion } from 'framer-motion'

export default function ${title || pageInfo.name}Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-16"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">${title || pageInfo.name}</h1>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="prose prose-invert max-w-none">
              ${content.split('\n').map(line => `<p className="text-gray-200 mb-4">${line}</p>`).join('\n              ')}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}`

    await writeFile(join(process.cwd(), pagePath), pageContent)

    return NextResponse.json({ message: 'Page updated successfully' })
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}
