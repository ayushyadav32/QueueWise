import { useCallback } from 'react'

/**
 * Reusable authentication guard hook.
 * Protects personal actions and routes from unauthenticated guest access.
 *
 * @param {object} params
 * @param {object|null} params.currentUser - Currently authenticated citizen session
 * @param {function} params.onOpenAuth - Callback to launch AuthModal with continuation
 * @returns {{ isAuthenticated: boolean, currentUser: object|null, requireAuth: function }}
 */
export function useAuthGuard({ currentUser, onOpenAuth }) {
  const isAuthenticated = Boolean(currentUser && currentUser.id)

  const requireAuth = useCallback((actionCallback, options = {}) => {
    if (currentUser && currentUser.id) {
      if (typeof actionCallback === 'function') {
        actionCallback(currentUser)
      }
      return true
    }

    const {
      title = 'Create your free QueueWise account',
      subtitle = 'Save visits, track your history, and get personalized queue alerts.',
      initialMode = 'register',
    } = options

    if (onOpenAuth) {
      onOpenAuth({
        isOpen: true,
        mode: initialMode,
        title,
        subtitle,
        onPostAuth: (authenticatedUser) => {
          if (typeof actionCallback === 'function') {
            actionCallback(authenticatedUser)
          }
        },
      })
    }

    return false
  }, [currentUser, onOpenAuth])

  return {
    isAuthenticated,
    currentUser,
    requireAuth,
  }
}


