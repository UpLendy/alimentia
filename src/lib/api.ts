// Requerida: sin esta variable no hay forma de contactar el backend.
// Se define en .env.local para desarrollo y en el dashboard de Vercel para
// producción (ver .env.example).
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_API_URL.");
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserRole = "bpm_admin" | "admin" | "supervisor" | "operario";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  sedeId: string | null;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export interface DashboardStats {
  employeesTotal: number;
  medicalExamsCritical: number;
  equipmentCalibratedPct: number;
  dailyFormsFilledToday: number;
  dailyFormsSubmittedLast30Days: number;
}

export type DashboardAlertType = "examen_medico" | "calibracion";
export type DashboardAlertSeverity = "vigente" | "por_vencer" | "vencido";

export interface DashboardAlert {
  type: DashboardAlertType;
  severity: DashboardAlertSeverity;
  title: string;
  detail: string;
  referenceId: string;
}

export interface DashboardSummary {
  stats: DashboardStats;
  alerts: DashboardAlert[];
}

export type MedicalExamStatus = "vigente" | "por_vencer" | "vencido";

export interface Employee {
  id: string;
  companyId: string;
  sedeId: string;
  fullName: string;
  documentId: string;
  position: string;
  hireDate: string;
  medicalExamDate: string | null;
  medicalExamExpiry: string | null;
  hasFoodHandlerCert: boolean;
  trainingHoursCompleted: number;
  trainingHoursRequired: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithStatus extends Employee {
  medicalExamStatus: MedicalExamStatus;
}

export interface NewEmployeeInput {
  sedeId: string;
  fullName: string;
  documentId: string;
  position: string;
  hireDate: string;
  medicalExamDate?: string;
  hasFoodHandlerCert?: boolean;
}

export interface Training {
  id: string;
  employeeId: string;
  topic: string;
  trainingDate: string;
  hours: number;
  evaluationScore: number | null;
  certificateFileUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface NewTrainingInput {
  topic: string;
  trainingDate: string;
  hours: number;
  evaluationScore?: number;
  certificateFileUrl?: string;
  expiresAt?: string;
}

export interface Sede {
  id: string;
  companyId: string;
  name: string;
  address: string | null;
  city: string | null;
  isMain: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CalibrationFrequency = "semestral" | "anual" | "bianual";
export type CalibrationStatus = "vigente" | "por_vencer" | "vencido";

export interface Equipment {
  id: string;
  companyId: string;
  sedeId: string;
  name: string;
  brandModel: string | null;
  locationArea: string | null;
  serial: string | null;
  lastCalibrationDate: string | null;
  calibrationFrequency: CalibrationFrequency;
  nextCalibrationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentWithStatus extends Equipment {
  calibrationStatus: CalibrationStatus;
}

export interface NewEquipmentInput {
  sedeId: string;
  name: string;
  brandModel?: string;
  locationArea?: string;
  serial?: string;
  lastCalibrationDate: string;
  calibrationFrequency: CalibrationFrequency;
}

export type DailyFormType =
  | "temperatura"
  | "plagas"
  | "agua"
  | "residuos"
  | "materias_primas"
  | "higiene"
  | "almacenamiento"
  | "transporte"
  | "instalaciones"
  | "equipos";

export type DailyFormShift = "manana" | "tarde" | "noche";

export interface NewDailyFormInput {
  sedeId: string;
  formDate: string;
  shift?: DailyFormShift;
  observations?: string;
  payload: Record<string, unknown>;
}

export interface DailyForm {
  id: string;
  companyId: string;
  sedeId: string;
  formType: DailyFormType;
  formDate: string;
  shift: string | null;
  submittedBy: string | null;
  payload: Record<string, unknown>;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus = "borrador" | "en_revision" | "vigente" | "vencido";

export interface FixedDocument {
  id: string;
  companyId: string;
  sedeId: string | null;
  name: string;
  category: string | null;
  currentVersion: number;
  status: DocumentStatus;
  fileKey: string;
  fileUrl: string;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  companyId: string;
  sedeId: string | null;
  category: string;
  linkedDocumentId: string | null;
  name: string;
  documentDate: string | null;
  fileKey: string;
  fileUrl: string;
  fileType: string | null;
  fileSizeBytes: number | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface NewAttachmentInput {
  sedeId?: string;
  category: string;
  linkedDocumentId?: string;
  name: string;
  documentDate?: string;
  fileKey: string;
  fileUrl: string;
  fileType?: string;
  fileSizeBytes?: number;
}

export interface UploadUrlResult {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
}

export type ScheduledEventServiceType = "agua" | "superficies" | "fumigacion" | "trampas";
export type ScheduledEventStatus = "pendiente" | "completado" | "cancelado";

export interface ScheduledEvent {
  id: string;
  companyId: string;
  sedeId: string;
  serviceType: ScheduledEventServiceType;
  proposedDate: string;
  providerName: string | null;
  notes: string | null;
  status: ScheduledEventStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewScheduledEventInput {
  sedeId: string;
  serviceType: ScheduledEventServiceType;
  proposedDate: string;
  providerName?: string;
  notes?: string;
}

export type NonConformitySeverity = "baja" | "media" | "alta";
export type NonConformityStatus = "abierta" | "en_proceso" | "cerrada";
export type NonConformitySourceType = "manual" | "formato" | "auditoria";

export interface NonConformity {
  id: string;
  companyId: string;
  sedeId: string;
  sourceType: NonConformitySourceType;
  sourceReferenceId: string | null;
  description: string;
  severity: NonConformitySeverity;
  correctiveAction: string | null;
  responsibleUserId: string | null;
  dueDate: string | null;
  status: NonConformityStatus;
  evidenceFileUrl: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewNonConformityInput {
  sedeId: string;
  // "formato" queda listo para cuando un formato diario con hallazgos
  // negativos pueda originar una no conformidad automáticamente; por ahora
  // el formulario solo crea "manual".
  sourceType?: NonConformitySourceType;
  sourceReferenceId?: string;
  description: string;
  severity?: NonConformitySeverity;
  correctiveAction?: string;
  dueDate?: string;
  evidenceFileUrl?: string;
}

export type IncidentSeverity = "baja" | "media" | "alta";

export interface Incident {
  id: string;
  companyId: string;
  sedeId: string;
  description: string;
  occurredAt: string;
  type: string | null;
  severity: IncidentSeverity;
  resolution: string | null;
  reportedBy: string | null;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  nit: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  plan: string;
  status: "activo" | "suspendido" | "prueba";
  businessProfile: string;
  sedesIncluded: number;
  billingAnnualPrepay: number;
  createdAt: string;
  updatedAt: string;
}

export type ChecklistPriority = "baja" | "media" | "alta";
export type ChecklistItemStatusValue = "pendiente" | "en_desarrollo" | "completo";

// Catálogo maestro: igual para todos los clientes (GET /checklist/catalog).
export interface ChecklistCatalogItem {
  id: string;
  category: string;
  item: string;
  appliesTo: string | null;
  normReference: string | null;
  priority: ChecklistPriority;
  sortOrder: number;
}

// Cada ítem del catálogo con el avance de una empresa cliente puntual
// (GET /companies/:companyId/checklist-status).
export interface CompanyChecklistItem extends ChecklistCatalogItem {
  status: ChecklistItemStatusValue;
  notes: string | null;
  updatedAt: string | null;
}

export interface UpdateChecklistStatusInput {
  status?: ChecklistItemStatusValue;
  notes?: string;
}

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  details?: ValidationErrorDetail[];

  constructor(status: number, message: string, details?: ValidationErrorDetail[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// El access token vive únicamente en memoria (nunca en localStorage ni
// sessionStorage): dura 15 min y se descarta si se recarga la página, en
// cuyo caso se vuelve a pedir con /api/auth/refresh usando la cookie
// httpOnly que gestiona el backend-for-frontend (ver app/api/auth/*).
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

let sessionExpiredHandler: (() => void) | null = null;

export function registerSessionExpiredHandler(handler: () => void) {
  sessionExpiredHandler = handler;
}

async function parseJsonOrNull(res: Response): Promise<unknown> {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  return isJson ? res.json().catch(() => null) : null;
}

function extractErrorMessage(data: unknown, status: number): string {
  return data && typeof data === "object" && "error" in data
    ? String((data as { error: string }).error)
    : `Error ${status}`;
}

function extractErrorDetails(data: unknown): ValidationErrorDetail[] | undefined {
  return data && typeof data === "object" && "details" in data
    ? ((data as { details: ValidationErrorDetail[] }).details ?? undefined)
    : undefined;
}

// Las llamadas a /api/auth/* van al Route Handler de Next.js (mismo
// origen), que actúa de backend-for-frontend: es el único que conoce el
// refreshToken (guardado en una cookie httpOnly) y el único que habla con
// Alimentia para login/refresh/logout.
export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResult> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJsonOrNull(res);
  if (!res.ok) throw new ApiError(res.status, extractErrorMessage(data, res.status));
  return data as LoginResult;
}

export async function logoutRequest(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}

let refreshPromise: Promise<string | null> | null = null;

// Renueva el access token usando el refreshToken de la cookie httpOnly.
// Deduplica llamadas concurrentes: si varias requests reciben 401 a la
// vez, todas comparten el mismo refresh en curso en lugar de disparar
// uno por cada una (y de paso evitar que roten el refreshToken entre sí).
export function refreshSession(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const data = (await parseJsonOrNull(res)) as { token: string } | null;
        if (!data?.token) {
          setAccessToken(null);
          return null;
        }
        setAccessToken(data.token);
        return data.token;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  body?: unknown;
}

export async function apiFetch<T>(
  path: string,
  { auth = true, body, headers, ...rest }: ApiFetchOptions = {}
): Promise<T> {
  const doFetch = () => {
    const finalHeaders = new Headers(headers);
    finalHeaders.set("Content-Type", "application/json");

    if (auth) {
      const token = getAccessToken();
      if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
    }

    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  if (auth && res.status === 401) {
    const newToken = await refreshSession();
    if (newToken) {
      res = await doFetch();
    } else {
      sessionExpiredHandler?.();
      throw new ApiError(401, "La sesión expiró.");
    }
  }

  const data = await parseJsonOrNull(res);

  if (!res.ok) {
    throw new ApiError(res.status, extractErrorMessage(data, res.status), extractErrorDetails(data));
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
