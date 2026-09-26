import { useState, useEffect, useCallback } from 'react'
import {
  getCurrentUser,
  getUserData,
  updateUserData,
  addVisit as addVisitUtil,
  addHistory as addHistoryUtil,
  addNotification as addNotificationUtil,
  addQueueReport as addQueueReportUtil,
  updateVisitStatus as updateVisitStatusUtil,
  removeVisit as removeVisitUtil,
  toggleReminder as toggleReminderUtil,
  updateDocumentProgress as updateDocumentProgressUtil,
  updatePreferences as updatePreferencesUtil,
  completeOnboarding as completeOnboardingUtil,
  logUserActivity as logUserActivityUtil,
  markNotificationRead as markNotificationReadUtil,
  markAllNotificationsRead as markAllNotificationsReadUtil,
  deleteNotification as deleteNotificationUtil,
  clearNotifications as clearNotificationsUtil,
  clearActivityHistory as clearActivityHistoryUtil,
  clearActiveUser,
  loginAccount,
  registerAccount,
} from '../utils/auth'

export function useUserData() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser())
  const [userData, setUserData] = useState(() => {
    const active = getCurrentUser()
    return active ? getUserData(active.id) : null
  })

  const reloadData = useCallback(() => {
    const active = getCurrentUser()
    setCurrentUser(active)
    if (active?.id) {
      const data = getUserData(active.id)
      setUserData(data)
    } else {
      setUserData(null)
    }
  }, [])

  useEffect(() => {
    const handleSync = () => reloadData()
    window.addEventListener('queuewise_user_data_changed', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('queuewise_user_data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [reloadData])

  const login = useCallback((email, password) => {
    const user = loginAccount(email, password)
    reloadData()
    return user
  }, [reloadData])

  const register = useCallback(({ name, email, password }) => {
    const user = registerAccount({ name, email, password })
    reloadData()
    return user
  }, [reloadData])

  const logout = useCallback(() => {
    clearActiveUser()
    setCurrentUser(null)
    setUserData(null)
  }, [])

  const addVisit = useCallback((visit) => {
    if (!currentUser?.id) return null
    const res = addVisitUtil(currentUser.id, visit)
    setUserData(res)
    return res
  }, [currentUser])

  const addHistory = useCallback((item) => {
    if (!currentUser?.id) return null
    const res = addHistoryUtil(currentUser.id, item)
    setUserData(res)
    return res
  }, [currentUser])

  const addNotification = useCallback((notification) => {
    if (!currentUser?.id) return null
    const res = addNotificationUtil(currentUser.id, notification)
    setUserData(res)
    return res
  }, [currentUser])

  const addQueueReport = useCallback((report) => {
    if (!currentUser?.id) return null
    const res = addQueueReportUtil(currentUser.id, report)
    setUserData(res)
    return res
  }, [currentUser])

  const updateVisitStatus = useCallback((visitId, status) => {
    if (!currentUser?.id) return null
    const res = updateVisitStatusUtil(currentUser.id, visitId, status)
    setUserData(res)
    return res
  }, [currentUser])

  const removeVisit = useCallback((visitId) => {
    if (!currentUser?.id) return null
    const res = removeVisitUtil(currentUser.id, visitId)
    setUserData(res)
    return res
  }, [currentUser])

  const toggleReminder = useCallback((visitId) => {
    if (!currentUser?.id) return null
    const res = toggleReminderUtil(currentUser.id, visitId)
    setUserData(res)
    return res
  }, [currentUser])

  const updateDocumentProgress = useCallback((serviceId, progressData) => {
    if (!currentUser?.id) return null
    const res = updateDocumentProgressUtil(currentUser.id, serviceId, progressData)
    setUserData(res)
    return res
  }, [currentUser])

  const updatePreferences = useCallback((partialPrefs) => {
    if (!currentUser?.id) return null
    const res = updatePreferencesUtil(currentUser.id, partialPrefs)
    setUserData(res)
    return res
  }, [currentUser])

  const completeOnboarding = useCallback(() => {
    if (!currentUser?.id) return null
    const res = completeOnboardingUtil(currentUser.id)
    setUserData(res)
    return res
  }, [currentUser])

  const logActivity = useCallback((type, title, office = null, service = null, details = null) => {
    if (!currentUser?.id) return null
    const res = logUserActivityUtil(currentUser.id, { type, title, office, service, details })
    reloadData()
    return res
  }, [currentUser, reloadData])

  const markNotificationRead = useCallback((notifId) => {
    if (!currentUser?.id) return null
    const res = markNotificationReadUtil(currentUser.id, notifId)
    setUserData(res)
    return res
  }, [currentUser])

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser?.id) return null
    const res = markAllNotificationsReadUtil(currentUser.id)
    setUserData(res)
    return res
  }, [currentUser])

  const deleteNotification = useCallback((notifId) => {
    if (!currentUser?.id) return null
    const res = deleteNotificationUtil(currentUser.id, notifId)
    setUserData(res)
    return res
  }, [currentUser])

  const clearNotifications = useCallback(() => {
    if (!currentUser?.id) return null
    const res = clearNotificationsUtil(currentUser.id)
    setUserData(res)
    return res
  }, [currentUser])

  const clearActivityHistory = useCallback(() => {
    if (!currentUser?.id) return null
    const res = clearActivityHistoryUtil(currentUser.id)
    setUserData(res)
    return res
  }, [currentUser])

  return {
    currentUser,
    userData,
    savedVisits: userData?.savedVisits || [],
    visitHistory: userData?.visitHistory || [],
    activityHistory: userData?.activityHistory || [],
    notifications: userData?.notifications || [],
    queueReports: userData?.queueReports || [],
    documentProgress: userData?.documentProgress || {},
    preferences: userData?.preferences || {
      queueAlerts: true,
      reminders: true,
      reminderWindow: '1 hour before',
      defaultOffice: null,
      soundEnabled: true,
      watchers: {},
    },
    login,
    register,
    logout,
    addVisit,
    addHistory,
    addNotification,
    addQueueReport,
    updateVisitStatus,
    removeVisit,
    toggleReminder,
    updateDocumentProgress,
    updatePreferences,
    completeOnboarding,
    logActivity,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    clearActivityHistory,
    refreshUserData: reloadData,
  }
}

