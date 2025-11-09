export type AiChatCategory = "일상" | "인간관계" | "진로/학교" | "연애";

export type AiChatSessionStatus = "active" | "completed" | "closed";

export type MessageRole = "user" | "assistant";
export type ReportStatus = "completed" | "processing" | "failed";

export interface AiChatSession {
  id: string;
  category: AiChatCategory;
  turnCount: number;
  status: AiChatSessionStatus;
  isActive: boolean;
  createdAt: Date;
  completedAt?: Date;
  analyzedAt?: Date;
}

export interface AiChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface ReportValue {
  name: string;
  description: string;
}

export interface CategoryAnalysis {
  category: string;
  summary: string;
  values: ReportValue[] | null;
  insights: string[];
  relationshipStyle: string;
}

export interface ReportData {
  title: string;
  generatedAt: string;
  overallSummary: string;
  analysisByCategory: CategoryAnalysis[];
}

export interface SignalReport {
  id: string;
  sessionId: string;
  category: AiChatCategory;
  status: ReportStatus;
  reportData: ReportData;
  createdAt: string;
}

export interface GetReportsResponse {
  reports: SignalReport[];
  totalCount: number;
}

export interface CreateSessionRequest {
  category: AiChatCategory;
}

export interface CreateSessionResponse {
  sessionId: string;
  category: AiChatCategory;
  message: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  messageId: string;
  content: string;
  role: MessageRole;
  createdAt: Date;
}

export interface GetMessagesResponse {
  messages: AiChatMessage[];
  totalCount: number;
}

export interface AnalyzeRequest {
  sessionId?: string;
}

export interface AnalyzeResponse {
  reportId: string;
  status: "generating" | "completed" | "failed";
  message: string;
}

