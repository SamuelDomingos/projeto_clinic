"use client"

import { useState, useEffect } from "react"

export interface QuestionarioStatus {
  [questionarioId: string]: {
    completed: boolean
    completedAt?: string
    score?: number
  }
}

export function useQuestionarioStatus() {
  const [status, setStatus] = useState<QuestionarioStatus>({})

  useEffect(() => {
    // Carregar status do localStorage
    const savedStatus = localStorage.getItem("health-questionarios-status")
    if (savedStatus) {
      setStatus(JSON.parse(savedStatus))
    }
  }, [])

  const markAsCompleted = (questionarioId: string, score?: number) => {
    const newStatus = {
      ...status,
      [questionarioId]: {
        completed: true,
        completedAt: new Date().toISOString(),
        score,
      },
    }
    setStatus(newStatus)
    localStorage.setItem("health-questionarios-status", JSON.stringify(newStatus))
  }

  const isCompleted = (questionarioId: string) => {
    return status[questionarioId]?.completed || false
  }

  const getCategoryProgress = (questionarioIds: string[]) => {
    const completed = questionarioIds.filter((id) => isCompleted(id)).length
    return {
      completed,
      total: questionarioIds.length,
      percentage: Math.round((completed / questionarioIds.length) * 100),
    }
  }

  return {
    status,
    markAsCompleted,
    isCompleted,
    getCategoryProgress,
  }
}
