export function decodeToken(token) {
  try {
    const segment = token.split('.')[1]
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    return {
      userId: payload.userId,
      roleId: payload.roleId,
      roleName: payload.roleName,
      exp: payload.exp,
      iat: payload.iat,
    }
  } catch {
    return null
  }
}
