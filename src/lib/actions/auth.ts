'use server'

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
      return { success: false, error: 'Missing required fields' }
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { success: false, error: 'Email already in use' }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // First user is automatically ADMIN for simplicity of setup, others are USER
    const userCount = await db.user.count()
    const role = userCount === 0 ? 'ADMIN' : 'USER'

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role
      }
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to register' }
  }
}

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function loginUser(prevState: any, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard'
    })
    return { error: '' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' }
        default:
          return { error: 'Something went wrong.' }
      }
    }
    throw error
  }
}
