import { ICompetitionDetailsResponse, IUser } from "../types";

export const API_BASE_URL = "http://localhost:5000";

export async function fetchCompetitionDetails(
  idOrSlug: string,
  userId?: string
): Promise<ICompetitionDetailsResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const response = await fetch(`${API_BASE_URL}/api/competitions/${idOrSlug}`, {
    method: "GET",
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch competition: ${response.status}`);
  }

  return response.json();
}

export async function registerForCompetitionApi(
  idOrSlug: string,
  userId: string
): Promise<ICompetitionDetailsResponse & { message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/competitions/${idOrSlug}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Registration failed: ${response.status}`);
  }

  return data;
}

export async function submitEntryApi(
  idOrSlug: string,
  userId: string,
  submission: { submissionTitle: string; mediaUrl: string; notes?: string }
): Promise<{ message: string; submission: any }> {
  const response = await fetch(`${API_BASE_URL}/api/competitions/${idOrSlug}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify(submission)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Submission failed: ${response.status}`);
  }

  return data;
}

export async function fetchDemoUsersApi(): Promise<IUser[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/demo`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.users || [];
  } catch {
    return [
      { userId: "user_demo_1", name: "Priya Sharma", email: "priya@example.com", avatarUrl: "" },
      { userId: "user_demo_2", name: "Rahul Verma", email: "rahul@example.com", avatarUrl: "" },
      { userId: "user_demo_3", name: "Ananya Roy", email: "ananya@example.com", avatarUrl: "" }
    ];
  }
}
