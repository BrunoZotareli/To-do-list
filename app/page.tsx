"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Tag,
  Calendar,
  Wifi,
  WifiOff,
  Droplets,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface Task {
  id: string
  text: string
  completed: boolean
  tag?: string
  createdAt: Date
  isDaily?: boolean
}

interface WaterData {
  goal: number
  consumed: number
  lastReset: string
}

const tagColors = {
  trabalho: "bg-blue-500 hover:bg-blue-600",
  pessoal: "bg-teal-500 hover:bg-teal-600",
  urgente: "bg-red-500 hover:bg-red-600",
  estudo: "bg-indigo-500 hover:bg-indigo-600",
  saude: "bg-cyan-500 hover:bg-cyan-600",
  default: "bg-gray-500 hover:bg-gray-600",
}

export default function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTag, setNewTag] = useState("")
  const [isDaily, setIsDaily] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [swStatus, setSwStatus] = useState("Carregando...")

  // Water tracking states
  const [waterData, setWaterData] = useState<WaterData>({
    goal: 2000, // 2L default
    consumed: 0,
    lastReset: new Date().toDateString(),
  })
  const [waterAmount, setWaterAmount] = useState("250")
  const [newGoal, setNewGoal] = useState("")

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
      }))
      setTasks(parsedTasks)
    }

    // Load water data
    const savedWaterData = localStorage.getItem("waterData")
    if (savedWaterData) {
      setWaterData(JSON.parse(savedWaterData))
    }

    setIsLoading(false)
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks, isLoading])

  // Save water data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("waterData", JSON.stringify(waterData))
    }
  }, [waterData, isLoading])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Reset daily tasks and water at midnight
  useEffect(() => {
    const resetDaily = () => {
      const now = new Date()
      const today = now.toDateString()

      // Reset daily tasks
      const lastTaskReset = localStorage.getItem("lastDailyReset")
      if (lastTaskReset !== today) {
        setTasks((prev) => prev.map((task) => (task.isDaily ? { ...task, completed: false } : task)))
        localStorage.setItem("lastDailyReset", today)
      }

      // Reset water consumption
      if (waterData.lastReset !== today) {
        setWaterData((prev) => ({
          ...prev,
          consumed: 0,
          lastReset: today,
        }))
      }
    }

    resetDaily()

    // Check every minute for date change
    const interval = setInterval(resetDaily, 60000)
    return () => clearInterval(interval)
  }, [waterData.lastReset])

  // ---- REGISTRO DO SERVICE WORKER ----
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setSwStatus("❌ Service Worker não suportado")
      return
    }

    const swPath = "/sw.js" // deve estar em public/ ou via route handler

    // Verifica se o arquivo realmente existe e tem MIME correto
    fetch(swPath, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const type = res.headers.get("content-type") ?? ""
        if (!type.includes("javascript")) {
          throw new Error(`MIME inesperado: ${type}`)
        }
        return navigator.serviceWorker.register(swPath)
      })
      .then((registration) => {
        console.log("✅ Service Worker registrado:", registration.scope)
        setSwStatus("✅ Modo offline ativo")

        // listener para futuras actualizações
        registration.addEventListener("updatefound", () => {
          console.log("🔄 Nova versão do Service Worker encontrada")
        })
      })
      .catch((error) => {
        console.error("❌ Falha ao registrar Service Worker:", error)
        setSwStatus("❌ Modo offline indisponível")
      })
  }, [])
  // ---- FIM REGISTRO DO SERVICE WORKER ----

  const addTask = () => {
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      tag: newTag.trim() || undefined,
      createdAt: new Date(),
      isDaily: isDaily,
    }

    setTasks((prev) => [task, ...prev])
    setNewTask("")
    setNewTag("")
    setIsDaily(false)
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // Water tracking functions
  const addWater = () => {
    const amount = Number.parseInt(waterAmount)
    if (amount > 0) {
      setWaterData((prev) => ({
        ...prev,
        consumed: prev.consumed + amount,
      }))
    }
  }

  const updateGoal = () => {
    const goal = Number.parseInt(newGoal)
    if (goal > 0) {
      setWaterData((prev) => ({
        ...prev,
        goal: goal,
      }))
      setNewGoal("")
    }
  }

  const resetWater = () => {
    setWaterData((prev) => ({
      ...prev,
      consumed: 0,
    }))
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterTag || task.tag === filterTag
    return matchesSearch && matchesFilter
  })

  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Water progress calculation
  const waterProgressPercentage = Math.min(Math.round((waterData.consumed / waterData.goal) * 100), 100)
  const isWaterGoalReached = waterData.consumed >= waterData.goal

  const uniqueTags = Array.from(new Set(tasks.map((task) => task.tag).filter(Boolean)))

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  const handleWaterKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addWater()
    }
  }

  const handleGoalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updateGoal()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-700 to-teal-600 bg-clip-text text-transparent mb-2">
            ✨ Minhas Tarefas
          </h1>
          <p className="text-gray-600 text-lg">Organize sua vida de forma simples e elegante</p>

          {/* Status indicators */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
              <span className={`text-xs ${isOnline ? "text-green-600" : "text-red-600"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <div className="text-xs text-gray-500">{swStatus}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Progresso das Tarefas</span>
              <span className="text-sm font-bold text-slate-700">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-slate-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedCount} de {totalCount} tarefas concluídas
            </p>
          </CardContent>
        </Card>

        {/* Water Tracker */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Hidratação Diária</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isWaterGoalReached ? "text-blue-600" : "text-slate-700"}`}>
                  {waterData.consumed}ml / {waterData.goal}ml
                </span>
                {isWaterGoalReached && <span className="text-lg">🎉</span>}
              </div>
            </div>

            <div className="w-full bg-blue-100 rounded-full h-4 overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isWaterGoalReached
                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                    : "bg-gradient-to-r from-blue-400 to-blue-500"
                }`}
                style={{ width: `${waterProgressPercentage}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-1">
                <Input
                  type="number"
                  placeholder="ml"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(e.target.value)}
                  onKeyPress={handleWaterKeyPress}
                  className="w-20 h-10"
                  min="1"
                />
                <Button
                  onClick={addWater}
                  className="h-10 bg-blue-500 hover:bg-blue-600"
                  disabled={!waterAmount || Number.parseInt(waterAmount) <= 0}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Nova meta (ml)"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={handleGoalKeyPress}
                  className="w-32 h-10"
                  min="1"
                />
                <Button
                  onClick={updateGoal}
                  variant="outline"
                  className="h-10 bg-transparent"
                  disabled={!newGoal || Number.parseInt(newGoal) <= 0}
                >
                  <Target className="w-4 h-4" />
                </Button>
                <Button
                  onClick={resetWater}
                  variant="outline"
                  className="h-10 text-blue-600 hover:text-blue-700 bg-transparent"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <span>Progresso: {waterProgressPercentage}%</span>
              <span>
                {isWaterGoalReached ? `Parabéns! Meta atingida! 🎯` : `Faltam ${waterData.goal - waterData.consumed}ml`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Add Task Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Digite sua nova tarefa..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-12 text-base"
                />
                <Input
                  placeholder="Tag (opcional)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="sm:w-40 h-12 text-base"
                />
                <Button
                  onClick={addTask}
                  className="h-12 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  disabled={!newTask.trim()}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Daily Task Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="daily-task"
                  checked={isDaily}
                  onCheckedChange={(checked) => setIsDaily(checked as boolean)}
                />
                <label
                  htmlFor="daily-task"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Tarefa diária (reseta automaticamente todo dia)
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterTag === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTag("")}
                  className="h-10"
                >
                  Todas
                </Button>
                {uniqueTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={filterTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                    className="h-10"
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {tasks.length === 0 ? "Nenhuma tarefa ainda" : "Nenhuma tarefa encontrada"}
                </h3>
                <p className="text-gray-500">
                  {tasks.length === 0
                    ? "Adicione sua primeira tarefa para começar!"
                    : "Tente ajustar os filtros de busca."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`transition-all duration-200 hover:shadow-md ${task.completed ? "opacity-75" : ""} ${
                  task.isDaily ? "border-l-4 border-l-blue-500" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 transition-colors duration-200"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-slate-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-base sm:text-lg font-medium transition-all duration-200 ${
                            task.completed ? "line-through text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {task.text}
                        </p>
                        {task.isDaily && <Calendar className="w-4 h-4 text-blue-500" title="Tarefa diária" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {task.tag && (
                          <Badge
                            className={`text-xs ${
                              tagColors[task.tag?.toLowerCase() as keyof typeof tagColors] || tagColors.default
                            } text-white`}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {task.tag}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">{task.createdAt.toLocaleDateString("pt-BR")}</span>
                        {task.isDaily && <span className="text-xs text-blue-500 font-medium">Diária</span>}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-sm text-gray-500">Feito com ❤️ para organizar sua vida</p>
          <p className="text-xs text-gray-400 mt-2">
            {!isOnline && "🔒 Funcionando offline - suas tarefas estão seguras!"}
          </p>
        </div>
      </div>
    </div>
  )
}
