"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, CheckCircle2, Circle, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Task {
  id: string
  text: string
  completed: boolean
  tag?: string
  createdAt: Date
}

const tagColors = {
  trabalho: "bg-slate-500 hover:bg-slate-600",
  pessoal: "bg-teal-500 hover:bg-teal-600",
  urgente: "bg-blue-600 hover:bg-blue-700",
  estudo: "bg-indigo-500 hover:bg-indigo-600",
  saude: "bg-cyan-500 hover:bg-cyan-600",
  default: "bg-gray-500 hover:bg-gray-600",
}

export default function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTag, setNewTag] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
    setIsLoading(false)
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks, isLoading])

  const addTask = () => {
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      tag: newTag.trim() || undefined,
      createdAt: new Date(),
    }

    setTasks((prev) => [task, ...prev])
    setNewTask("")
    setNewTag("")
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterTag || task.tag === filterTag
    return matchesSearch && matchesFilter
  })

  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const uniqueTags = Array.from(new Set(tasks.map((task) => task.tag).filter(Boolean)))

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask()
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
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
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
                  className="h-12 px-6 bg-gradient-to-r from-slate-600 to-teal-600 hover:from-slate-700 hover:to-teal-700"
                  disabled={!newTask.trim()}
                >
                  <Plus className="w-5 h-5" />
                </Button>
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
                className={`transition-all duration-200 hover:shadow-md ${task.completed ? "opacity-75" : ""}`}
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
                      <p
                        className={`text-base sm:text-lg font-medium transition-all duration-200 ${
                          task.completed ? "line-through text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {task.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.tag && (
                          <Badge
                            className={`text-xs ${
                              tagColors[task.tag as keyof typeof tagColors] || tagColors.default
                            } text-white`}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {task.tag}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">{task.createdAt.toLocaleDateString("pt-BR")}</span>
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
        </div>
      </div>
    </div>
  )
}
