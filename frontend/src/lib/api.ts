import axios from 'axios'
import type { Agent, TelemetryEvent, Detection, Incident, DashboardStats } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export const api = axios.create({ baseURL: `${API_URL}/api/v1`, headers: { 'Content-Type': 'application/json' } })

export const getDashboardStats = (): Promise<DashboardStats> => api.get('/dashboard/stats').then(r => r.data)
export const getAgents = (): Promise<Agent[]> => api.get('/agents').then(r => r.data)
export const getEvents = (params?: any): Promise<TelemetryEvent[]> => api.get('/telemetry/events', { params }).then(r => r.data)
export const getDetections = (params?: any): Promise<Detection[]> => api.get('/detections', { params }).then(r => r.data)
export const updateDetectionStatus = (id: number, status: string): Promise<Detection> => api.patch(`/detections/${id}/status`, { status }).then(r => r.data)
export const getIncidents = (params?: any): Promise<Incident[]> => api.get('/incidents', { params }).then(r => r.data)
export const getIncident = (id: number): Promise<Incident> => api.get(`/incidents/${id}`).then(r => r.data)
export const updateIncident = (id: number, payload: any): Promise<Incident> => api.patch(`/incidents/${id}`, payload).then(r => r.data)
export const createIncident = (payload: any): Promise<Incident> => api.post('/incidents', payload).then(r => r.data)
