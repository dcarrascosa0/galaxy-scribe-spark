export enum Language {
    ENGLISH = "english",
    SPANISH = "spanish",
    FRENCH = "french",
    GERMAN = "german",
    PORTUGUESE = "portuguese",
  }
  
  export enum DepthLevel {
    BASIC = "basic",
    INTERMEDIATE = "intermediate",
    DEEP_DIVE = "deep_dive",
  }
  
  export enum TopicComplexity {
    SIMPLE = "simple",
    MEDIUM = "medium",
    COMPLEX = "complex",
  }
  
  export enum GenerationType {
    TOPIC = "topic",
    URL = "url",
  }
  
  export type ProgressType = "status" | "progress" | "result" | "error";
  
  export interface NoteGenerationRequest {
    topic?: string;
    source_url?: string;
    generation_type: GenerationType;
    language: Language;
    depth_level: DepthLevel;
    max_depth: number;
    topic_complexity: TopicComplexity;
    model?: string;
  }
  
  export interface NoteNode {
    title: string;
    content: string;
    children: NoteNode[];
    key_terms?: string[];
  }
  
  export interface ProgressUpdate {
    type: ProgressType;
    message?: string;
    progress?: number;
    data?: NoteNode;
    timestamp?: number;
  }
  
  const API_BASE_URL = "http://localhost:8000";
  
  export const generateNotes = async (
    request: NoteGenerationRequest,
    onProgress: (update: ProgressUpdate) => void
  ) => {
    const response = await fetch(`${API_BASE_URL}/api/notes/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      onProgress({
        type: "error",
        message: `API Error: ${response.status} ${response.statusText} - ${errorText}`,
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }
  
    const decoder = new TextDecoder();
    let buffer = "";
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
  
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
  
      buffer = lines.pop() || ""; // Keep the last partial line in the buffer
  
      for (const line of lines) {
        if (line.trim() === "" || !line.trim().startsWith('data:')) continue;
        
        const jsonString = line.substring(line.indexOf('data:') + 5).trim();
        if (jsonString === "") continue;

        try {
          const json = JSON.parse(jsonString);
          onProgress(json as ProgressUpdate);
        } catch (error) {
          console.error("Failed to parse progress update:", line, error);
          onProgress({
            type: "error",
            message: `Failed to parse progress update: ${jsonString}`,
          });
        }
      }
    }
  }; 