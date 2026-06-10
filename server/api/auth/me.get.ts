import { getAuthUserFull } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAuthUserFull(event)
  if (!user) throw createError({ statusCode: 401, message: 'Belum login' })
  return {
    username: user.username,
    isAdmin: user.isAdmin === 1,
    mustChangePassword: user.mustChangePassword === 1,
  }
})
