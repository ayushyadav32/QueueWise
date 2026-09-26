// ─── QueueWise Centralized Local Data Architecture ───────────────────────────
// Structured User Data Storage & Single Authenticated-User Session Management

export const USERS_DB_KEY = 'queuewise_users_database'
export const ACTIVE_SESSION_KEY = 'queuewise_active_session'

// Fallback legacy key for migration
const LEGACY_USERS_KEY = 'queuewise_registered_users'

/**
 * Factory for a brand new, empty, structured user model.
 * Guarantees all required fields exist for every user.
 */
export function createEmptyUserData({ id, name, email, password, createdAt, onboardingCompleted = false } = {}) {
  return {
    id,
    name: (name || '').trim(),
    email: (email || '').trim().toLowerCase(),
    password: password || '',
    createdAt: createdAt || new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    savedVisits: [],
    visitHistory: [],
    activityHistory: [],
    notifications: [],
    queueReports: [],
    documentProgress: {},
    preferences: {
      queueAlerts: true,
      reminders: true,
      reminderWindow: '1 hour before',
      defaultOffice: null,
      soundEnabled: true,
      watchers: {},
      onboardingCompleted: Boolean(onboardingCompleted),
    },
  }
}

/**
 * Internal helper to migrate legacy fragmented localStorage keys
 * into the centralized users database.
 */
function migrateLegacyUsersIfPresent(db) {
  try {
    const rawLegacy = localStorage.getItem(LEGACY_USERS_KEY)
    if (!rawLegacy) return db

    const legacyList = JSON.parse(rawLegacy)
    if (!Array.isArray(legacyList) || legacyList.length === 0) return db

    let updated = false
    legacyList.forEach(u => {
      if (!u.id) return
      if (!db[u.id]) {
        let savedVisits = []
        let visitHistory = []
        let notifications = []
        let activityHistory = []
        let watchers = {}

        try {
          const v = localStorage.getItem(`queuewise_user_${u.id}_visits`)
          if (v) savedVisits = JSON.parse(v)
          const h = localStorage.getItem(`queuewise_user_${u.id}_history`)
          if (h) visitHistory = JSON.parse(h)
          const n = localStorage.getItem(`queuewise_user_${u.id}_notifs`)
          if (n) notifications = JSON.parse(n)
          const a = localStorage.getItem(`queuewise_user_${u.id}_activities`)
          if (a) activityHistory = JSON.parse(a)
          const w = localStorage.getItem(`queuewise_user_${u.id}_watchers`)
          if (w) watchers = JSON.parse(w)
        } catch (e) {
          console.error(`Migration error for legacy user ${u.id}:`, e)
        }

        db[u.id] = {
          id: u.id,
          name: u.name || 'Citizen',
          email: (u.email || '').toLowerCase(),
          password: u.password || '',
          createdAt: u.createdAt || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
          savedVisits: Array.isArray(savedVisits) ? savedVisits : [],
          visitHistory: Array.isArray(visitHistory) ? visitHistory : [],
          activityHistory: Array.isArray(activityHistory) ? activityHistory : [],
          notifications: Array.isArray(notifications) ? notifications : [],
          queueReports: [],
          documentProgress: {},
          preferences: {
            queueAlerts: true,
            reminders: true,
            reminderWindow: '1 hour before',
            defaultOffice: null,
            soundEnabled: true,
            watchers: watchers || {},
            onboardingCompleted: true,
          },
        }
        updated = true
      }
    })

    if (updated) {
      saveAllUsersDatabase(db)
    }
  } catch (e) {
    console.error('Error during legacy data migration:', e)
  }
  return db
}

/**
 * Retrieve the entire dictionary of users from centralized storage.
 */
export function getAllUsersDatabase() {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY)
    let db = raw ? JSON.parse(raw) : {}
    db = migrateLegacyUsersIfPresent(db)
    return db
  } catch (e) {
    console.error('Error reading users database from localStorage:', e)
    return {}
  }
}

/**
 * Persist the entire dictionary of users into centralized storage.
 */
export function saveAllUsersDatabase(db) {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db))
    // Keep legacy list sync for backwards compatibility
    const safeLegacyList = Object.values(db).map(({ id, name, email, password, createdAt }) => ({
      id, name, email, password, createdAt
    }))
    localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(safeLegacyList))
  } catch (e) {
    console.error('Error saving users database to localStorage:', e)
  }
}

/**
 * 1. getCurrentUser()
 * Retrieves the currently active authenticated session.
 * Returns safe user object: { id, name, email, createdAt } or null.
 * NEVER exposes passwords or another user's personal details.
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session || !session.id) return null

    // Confirm that the user still exists in the database
    const db = getAllUsersDatabase()
    const record = db[session.id]
    if (!record) {
      clearActiveUser()
      return null
    }

    return {
      id: record.id,
      name: record.name,
      email: record.email,
      createdAt: record.createdAt,
    }
  } catch (e) {
    console.error('Error reading active session:', e)
    return null
  }
}

// Alias for backwards compatibility
export const getActiveUser = getCurrentUser

/**
 * Set the currently active authenticated session.
 * Stores only safe session metadata in ACTIVE_SESSION_KEY.
 */
export function setActiveUser(user) {
  try {
    if (!user || !user.id) {
      localStorage.removeItem(ACTIVE_SESSION_KEY)
    } else {
      const safeSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      }
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(safeSession))
    }
  } catch (e) {
    console.error('Error persisting active session:', e)
  }
}

/**
 * Clear the currently active session.
 * DOES NOT delete the user's stored data in USERS_DB_KEY.
 */
export function clearActiveUser() {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  } catch (e) {
    console.error('Error clearing active session:', e)
  }
}

export const logoutAccount = clearActiveUser

export function registerAccount({ name, email, password }) {
  const cleanName = (name || '').trim()
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPass = password || ''

  if (!cleanName) throw new Error('Please enter your full name.')
  if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('Please enter a valid email address.')
  if (cleanPass.length < 6) throw new Error('Password must be at least 6 characters long.')

  const db = getAllUsersDatabase()
  const exists = Object.values(db).find(u => u.email === cleanEmail)
  if (exists) {
    throw new Error(`An account with email "${cleanEmail}" is already registered. Please log in.`)
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const newUser = createEmptyUserData({
    id: userId,
    name: cleanName,
    email: cleanEmail,
    password: cleanPass,
  })

  db[userId] = newUser
  saveAllUsersDatabase(db)
  setActiveUser(newUser)

  const { password: _, ...safeUser } = newUser
  return safeUser
}

export function loginAccount(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPass = password || ''

  if (!cleanEmail) throw new Error('Please enter your email.')
  if (!cleanPass) throw new Error('Please enter your password.')

  const db = getAllUsersDatabase()
  const user = Object.values(db).find(u => u.email === cleanEmail)

  if (!user) {
    throw new Error('No account found with this email. Please create an account.')
  }

  if (user.password !== cleanPass) {
    throw new Error('Incorrect password. Please verify and try again.')
  }

  setActiveUser(user)
  const { password: _, ...safeUser } = user
  return safeUser
}

// ─── Centralized User Data CRUD Helper Functions ─────────────────────────────

/**
 * 2. getUserData(userId?)
 * Retrieves the complete structured data object for a user:
 * { id, name, email, createdAt, savedVisits, visitHistory, activityHistory, notifications, queueReports, documentProgress, preferences }
 * If userId is not provided, defaults to the currently authenticated user.
 * Returns null if no user is found.
 */
export function getUserData(userId = null) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId) return null

  const db = getAllUsersDatabase()
  const user = db[targetId]
  if (!user) return null

  const { password: _, ...safeData } = user
  return {
    ...safeData,
    savedVisits: Array.isArray(safeData.savedVisits) ? safeData.savedVisits : [],
    visitHistory: Array.isArray(safeData.visitHistory) ? safeData.visitHistory : [],
    activityHistory: Array.isArray(safeData.activityHistory) ? safeData.activityHistory : [],
    notifications: Array.isArray(safeData.notifications) ? safeData.notifications : [],
    queueReports: Array.isArray(safeData.queueReports) ? safeData.queueReports : [],
    documentProgress: safeData.documentProgress || {},
    preferences: safeData.preferences || {
      queueAlerts: true,
      reminders: true,
      reminderWindow: '1 hour before',
      defaultOffice: null,
      soundEnabled: true,
      watchers: {},
    },
  }
}

/**
 * 3. updateUserData(userId?, updaterOrUpdates)
 * Atomically updates user data in the centralized store.
 * Supports passing a partial object or an updater function: (prevUser) => updatedUser
 * Persists immediately and triggers a local synchronization event.
 */
export function updateUserData(userId = null, updaterOrUpdates) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId) return null

  const db = getAllUsersDatabase()
  const existing = db[targetId]
  if (!existing) return null

  let updatedUser
  if (typeof updaterOrUpdates === 'function') {
    updatedUser = updaterOrUpdates(existing)
  } else {
    updatedUser = {
      ...existing,
      ...updaterOrUpdates,
      preferences: updaterOrUpdates.preferences
        ? { ...existing.preferences, ...updaterOrUpdates.preferences }
        : existing.preferences,
      documentProgress: updaterOrUpdates.documentProgress
        ? { ...existing.documentProgress, ...updaterOrUpdates.documentProgress }
        : existing.documentProgress,
    }
  }

  // Ensure all arrays and objects are well-formed
  updatedUser.savedVisits = updatedUser.savedVisits || []
  updatedUser.visitHistory = updatedUser.visitHistory || []
  updatedUser.activityHistory = updatedUser.activityHistory || []
  updatedUser.notifications = updatedUser.notifications || []
  updatedUser.queueReports = updatedUser.queueReports || []
  updatedUser.documentProgress = updatedUser.documentProgress || {}
  updatedUser.preferences = updatedUser.preferences || {}

  db[targetId] = updatedUser
  saveAllUsersDatabase(db)

  // Keep active session metadata in sync
  const active = getCurrentUser()
  if (active && active.id === targetId) {
    if (active.name !== updatedUser.name || active.email !== updatedUser.email) {
      setActiveUser(updatedUser)
    }
  }

  // Mirror partitioned keys for backward compatibility
  try {
    localStorage.setItem(`queuewise_user_${targetId}_visits`, JSON.stringify(updatedUser.savedVisits))
    localStorage.setItem(`queuewise_user_${targetId}_history`, JSON.stringify(updatedUser.visitHistory))
    localStorage.setItem(`queuewise_user_${targetId}_activities`, JSON.stringify(updatedUser.activityHistory))
    localStorage.setItem(`queuewise_user_${targetId}_notifs`, JSON.stringify(updatedUser.notifications))
    localStorage.setItem(`queuewise_user_${targetId}_watchers`, JSON.stringify(updatedUser.preferences.watchers || {}))
  } catch (e) {
    // silent mirror
  }

  // Dispatch custom event for cross-component and tab reactive synchronization
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('queuewise_user_data_changed', { detail: { userId: targetId } }))
  }

  const { password: _, ...safeData } = updatedUser
  return safeData
}

/**
 * 4. addVisit(userId?, visit)
 * Adds a new visit pass to the user's savedVisits, logs an activity event,
 * persists the changes, and returns the updated user data.
 */
export function addVisit(userId = null, visit) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !visit) return null

  return updateUserData(targetId, (user) => {
    const userPass = {
      id: visit.id || `QW-${Math.floor(1000 + Math.random() * 9000)}-UP`,
      citizenName: user.name,
      officeName: visit.officeName || '',
      officeId: visit.officeId || '',
      serviceName: visit.serviceName || '',
      serviceId: visit.serviceId || '',
      date: visit.date || 'Today',
      status: visit.status || 'Upcoming',
      recommendedSlot: visit.recommendedSlot || 'Today · 2:00 – 3:00 PM',
      expectedWait: visit.expectedWait || '18–22 min',
      docsReady: visit.docsReady || 'Verified 100%',
      reminderActive: visit.reminderActive !== false,
      reminderTime: visit.reminderTime || '1 hour before',
      queueAlertActive: visit.queueAlertActive !== false,
      savedAt: visit.savedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: visit.createdAt || new Date().toISOString(),
    }

    const updatedVisits = [userPass, ...(user.savedVisits || []).filter(v => v.id !== userPass.id)]

    const activityEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'visit',
      title: `Planned & saved visit for ${userPass.serviceName}`,
      office: userPass.officeName,
      service: userPass.serviceName,
      details: `Pass ${userPass.id} · Slot: ${userPass.recommendedSlot}`,
      timestamp: new Date().toISOString(),
    }
    const updatedActivities = [activityEntry, ...(user.activityHistory || [])].slice(0, 100)

    return {
      ...user,
      savedVisits: updatedVisits,
      activityHistory: updatedActivities,
    }
  })
}

/**
 * 5. addHistory(userId?, historyItem)
 * Adds a completed visit item to visitHistory, removes it from savedVisits if present,
 * logs an activity event, and persists the record.
 */
export function addHistory(userId = null, historyItem) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !historyItem) return null

  return updateUserData(targetId, (user) => {
    const item = {
      ...historyItem,
      status: 'Completed',
      completedAt: historyItem.completedAt || new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    }

    const updatedSaved = (user.savedVisits || []).filter(v => v.id !== item.id)
    const updatedHistory = [item, ...(user.visitHistory || []).filter(v => v.id !== item.id)]

    const activityEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'visit',
      title: `Completed visit for ${item.serviceName || 'Service'}`,
      office: item.officeName || '',
      service: item.serviceName || '',
      details: `Pass ${item.id} finalized`,
      timestamp: new Date().toISOString(),
    }
    const updatedActivities = [activityEntry, ...(user.activityHistory || [])].slice(0, 100)

    return {
      ...user,
      savedVisits: updatedSaved,
      visitHistory: updatedHistory,
      activityHistory: updatedActivities,
    }
  })
}

/**
 * 6. addNotification(userId?, notification)
 * Appends an in-app notification to the user's notifications array.
 */
export function addNotification(userId = null, notification) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !notification) return null

  return updateUserData(targetId, (user) => {
    const newNotif = {
      id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: notification.type || 'queue_drop',
      title: notification.title || 'Queue Alert',
      officeName: notification.officeName || '',
      officeId: notification.officeId || '',
      queueCount: notification.queueCount,
      estimatedWait: notification.estimatedWait,
      message: notification.message || '',
      timestamp: notification.timestamp || new Date().toISOString(),
      timeAgo: 'Just now',
      read: false,
    }

    const updatedNotifs = [newNotif, ...(user.notifications || []).filter(n => n.id !== newNotif.id)]

    return {
      ...user,
      notifications: updatedNotifs,
    }
  })
}

/**
 * 7. addQueueReport(userId?, report)
 * Saves a community queue contribution in the user's queueReports array,
 * records it in the user's activityHistory, and saves to global reports.
 */
export function addQueueReport(userId = null, report) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !report) return null

  return updateUserData(targetId, (user) => {
    const newReport = {
      id: report.id || `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      officeId: report.officeId || '',
      officeName: report.officeName || '',
      serviceId: report.serviceId || '',
      serviceName: report.serviceName || '',
      waitingRange: report.waitingRange || '',
      estimatedWait: report.estimatedWait || '',
      crowdCondition: report.crowdCondition || 'Moderate',
      note: report.note || '',
      timestamp: report.timestamp || new Date().toISOString(),
    }

    const updatedReports = [newReport, ...(user.queueReports || [])]

    const activityEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'queue_report',
      title: `Submitted community queue report`,
      office: newReport.officeName,
      service: newReport.serviceName,
      details: `${newReport.waitingRange} waiting · ${newReport.estimatedWait}`,
      timestamp: new Date().toISOString(),
    }
    const updatedActivities = [activityEntry, ...(user.activityHistory || [])].slice(0, 100)

    return {
      ...user,
      queueReports: updatedReports,
      activityHistory: updatedActivities,
    }
  })
}

/**
 * Update document checklist progress for a given service.
 */
export function updateDocumentProgress(userId = null, serviceId, progressData) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !serviceId) return null

  return updateUserData(targetId, (user) => {
    const currentProgress = user.documentProgress || {}
    return {
      ...user,
      documentProgress: {
        ...currentProgress,
        [serviceId]: {
          ...progressData,
          updatedAt: new Date().toISOString(),
        }
      }
    }
  })
}

/**
 * Update user preferences (e.g. notifications, reminders, watchers).
 */
export function updatePreferences(userId = null, partialPreferences) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !partialPreferences) return null

  return updateUserData(targetId, (user) => ({
    ...user,
    preferences: {
      ...(user.preferences || {}),
      ...partialPreferences,
    }
  }))
}

/**
 * Mark onboarding as completed for a given user.
 */
export function completeOnboarding(userId = null) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId) return null

  return updatePreferences(targetId, {
    onboardingCompleted: true,
  })
}

/**
 * Update appointment status (Upcoming, Completed, Cancelled).
 */
export function updateVisitStatus(userId = null, visitId, status) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !visitId) return null

  return updateUserData(targetId, (user) => {
    let target = null
    const updatedVisits = (user.savedVisits || []).map(v => {
      if (v.id === visitId) {
        target = v
        const updated = { ...v, status }
        if (status === 'Completed') {
          updated.completedAt = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
        return updated
      }
      return v
    })

    let updatedHistory = user.visitHistory || []
    if (status === 'Completed' && target) {
      const histItem = {
        ...target,
        status: 'Completed',
        completedAt: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
      updatedHistory = [histItem, ...updatedHistory.filter(h => h.id !== visitId)]
    }

    const titleMap = {
      Completed: `Completed visit for ${target?.serviceName || 'service'}`,
      Cancelled: `Cancelled appointment for ${target?.serviceName || 'service'}`,
      Upcoming: `Restored appointment for ${target?.serviceName || 'service'}`,
    }

    const activityEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'visit',
      title: titleMap[status] || `Updated appointment status to ${status}`,
      office: target?.officeName || '',
      service: target?.serviceName || '',
      details: `Pass ${visitId} (${status})`,
      timestamp: new Date().toISOString(),
    }
    const updatedActivities = [activityEntry, ...(user.activityHistory || [])].slice(0, 100)

    return {
      ...user,
      savedVisits: updatedVisits,
      visitHistory: updatedHistory,
      activityHistory: updatedActivities,
    }
  })
}

/**
 * Permanently delete a visit pass from savedVisits and visitHistory.
 */
export function removeVisit(userId = null, visitId) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !visitId) return null

  return updateUserData(targetId, (user) => ({
    ...user,
    savedVisits: (user.savedVisits || []).filter(v => v.id !== visitId),
    visitHistory: (user.visitHistory || []).filter(v => v.id !== visitId),
  }))
}

/**
 * Toggle reminder status for a specific visit pass.
 */
export function toggleReminder(userId = null, visitId) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !visitId) return null

  return updateUserData(targetId, (user) => {
    let target = null
    const updatedVisits = (user.savedVisits || []).map(v => {
      if (v.id === visitId) {
        target = v
        return { ...v, reminderActive: !v.reminderActive }
      }
      return v
    })

    let updatedActivities = user.activityHistory || []
    if (target && !target.reminderActive) {
      // It was toggled ON
      const activityEntry = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'reminder',
        title: `Enabled queue arrival reminder`,
        office: target.officeName,
        service: target.serviceName,
        details: `Pass ${target.id}`,
        timestamp: new Date().toISOString(),
      }
      updatedActivities = [activityEntry, ...updatedActivities].slice(0, 100)
    }

    return {
      ...user,
      savedVisits: updatedVisits,
      activityHistory: updatedActivities,
    }
  })
}

/**
 * Mark a notification as read.
 */
export function markNotificationRead(userId = null, notifId) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !notifId) return null

  return updateUserData(targetId, (user) => ({
    ...user,
    notifications: (user.notifications || []).map(n => n.id === notifId ? { ...n, read: true } : n)
  }))
}

/**
 * Mark all notifications as read.
 */
export function markAllNotificationsRead(userId = null) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId) return null

  return updateUserData(targetId, (user) => ({
    ...user,
    notifications: (user.notifications || []).map(n => ({ ...n, read: true }))
  }))
}

/**
 * Delete a notification.
 */
export function deleteNotification(userId = null, notifId) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !notifId) return null

  return updateUserData(targetId, (user) => ({
    ...user,
    notifications: (user.notifications || []).filter(n => n.id !== notifId)
  }))
}

/**
 * Clear all notifications.
 */
export function clearNotifications(userId = null) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId) return null

  return updateUserData(targetId, (user) => ({
    ...user,
    notifications: []
  }))
}

/**
 * Clear activity history.
 */
export function clearActivityHistory(userId = null) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId) return null

  return updateUserData(targetId, (user) => ({
    ...user,
    activityHistory: []
  }))
}

// ─── Legacy & Backwards-Compatible Accessors ──────────────────────────────────

export function getRegisteredUsers() {
  const db = getAllUsersDatabase()
  return Object.values(db).map(({ id, name, email, password, createdAt }) => ({
    id, name, email, password, createdAt
  }))
}

export function getUserSavedVisits(userId) {
  const user = getUserData(userId)
  return user?.savedVisits || []
}

export function saveUserSavedVisits(userId, visits) {
  updateUserData(userId, { savedVisits: visits })
}

export function getUserNotifications(userId) {
  const user = getUserData(userId)
  return user?.notifications || []
}

export function saveUserNotifications(userId, notifs) {
  updateUserData(userId, { notifications: notifs })
}

export function getUserWatchers(userId) {
  const user = getUserData(userId)
  return user?.preferences?.watchers || {}
}

export function saveUserWatchers(userId, watchers) {
  updateUserData(userId, (prev) => ({
    ...prev,
    preferences: {
      ...(prev.preferences || {}),
      watchers: watchers || {},
    }
  }))
}

export function getUserHistory(userId) {
  const user = getUserData(userId)
  return user?.visitHistory || []
}

export function saveUserHistory(userId, history) {
  updateUserData(userId, { visitHistory: history })
}

export function getUserActivities(userId) {
  const user = getUserData(userId)
  return user?.activityHistory || []
}

export function saveUserActivities(userId, activities) {
  updateUserData(userId, { activityHistory: activities })
}

export function logUserActivity(userId, activity) {
  const targetId = userId || getCurrentUser()?.id
  if (!targetId || !activity) return null

  const newEntry = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: activity.type || 'visit',
    title: activity.title || 'Civic Activity',
    office: activity.office || '',
    service: activity.service || '',
    details: activity.details || '',
    timestamp: activity.timestamp || new Date().toISOString(),
  }

  updateUserData(targetId, (prev) => ({
    ...prev,
    activityHistory: [newEntry, ...(prev.activityHistory || [])].slice(0, 100),
  }))

  return newEntry
}

export function formatActivityGroup(isoString) {
  if (!isoString) return 'Earlier'
  try {
    const date = new Date(isoString)
    const now = new Date()

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffTime = today.getTime() - target.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch (e) {
    return 'Earlier'
  }
}

export function groupActivitiesByTime(activities) {
  if (!Array.isArray(activities) || activities.length === 0) return []
  const groups = {}
  activities.forEach(item => {
    const groupKey = formatActivityGroup(item.timestamp)
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
  })

  return Object.keys(groups).map(key => ({
    label: key,
    items: groups[key],
  }))
}

