import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // Admin credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 })
    }

    // Admin credentials kontrolü
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Simple token (in production, use JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')

    // Check admin user in database
    try {
      const adminUser = await prisma.user.findFirst({
        where: {
          username: adminUsername,
          role: 'OWNER'
        }
      })

      if (!adminUser) {
        // If user doesn't exist in DB, create it
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        const newUser = await prisma.user.create({
          data: {
            username: adminUsername,
            password: passwordHash,
            role: 'OWNER',
          }
        });
        
        return NextResponse.json({
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role
          }
        })
      }

      return NextResponse.json({
        token,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role
        }
      })
    } catch (dbError) {
      // If database fails, log error but don't allow login without DB verification in production
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Database error:', dbError);
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin login error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
