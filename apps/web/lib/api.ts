// ======================================================
// API CONFIGURATION
// ======================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

// ======================================================
// AUTH TYPES
// ======================================================

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  name?: string;
  email: string;
  is_active: boolean;
  is_verified?: boolean;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

// ======================================================
// RESUME TYPES
// ======================================================

export type Resume = {
  id: number;
  user_id: number;
  title: string;
  content: string | null;
  original_filename: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateResumeData = {
  title: string;
  content?: string | null;
};

export type UpdateResumeData = {
  title?: string;
  content?: string | null;
};

// ======================================================
// RESPONSE HANDLER
// ======================================================

async function handleResponse<T>(
  response: Response
): Promise<T> {
  // ----------------------------------------------------
  // Get response body safely
  // ----------------------------------------------------

  const contentType =
    response.headers.get("content-type") || "";

  let data: any = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    } catch {
      data = null;
    }
  }

  // ----------------------------------------------------
  // Handle HTTP errors
  // ----------------------------------------------------

  if (!response.ok) {
    // Expired or invalid token — clear and redirect to login
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return undefined as T;
    }

    const detail =
      typeof data === "object" && data?.detail
        ? data.detail
        : typeof data === "string" && data
        ? data
        : `Request failed with status ${response.status}.`;

    throw new Error(detail);
  }

  // ----------------------------------------------------
  // Handle successful empty responses
  // ----------------------------------------------------

  if (data === null || data === "") {
    return undefined as T;
  }

  return data as T;
}

// ======================================================
// AUTH API
// ======================================================

// ------------------------------------------------------
// Register
// ------------------------------------------------------

export async function registerUser(
  data: RegisterData
): Promise<User> {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return await handleResponse<User>(response);
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
}

// ------------------------------------------------------
// Login
// ------------------------------------------------------

export async function loginUser(
  data: LoginData
): Promise<TokenResponse> {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return await handleResponse<TokenResponse>(response);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// ------------------------------------------------------
// Get current user
// ------------------------------------------------------

export async function getCurrentUser(
  token: string
): Promise<User> {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await handleResponse<User>(response);
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
}

// ======================================================
// RESUME API
// ======================================================

// ------------------------------------------------------
// Get all resumes
// ------------------------------------------------------

export async function getResumes(
  token: string
): Promise<Resume[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/resumes`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    return await handleResponse<Resume[]>(response);
  } catch (error) {
    console.error("Get resumes error:", error);
    throw error;
  }
}

// ------------------------------------------------------
// Get one resume
// ------------------------------------------------------

export async function getResume(
  token: string,
  resumeId: number
): Promise<Resume> {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  if (!Number.isInteger(resumeId) || resumeId <= 0) {
    throw new Error("Invalid resume ID.");
  }

  const url =
    `${API_URL}/api/v1/resumes/${resumeId}`;

  console.log("Loading resume:", {
    resumeId,
    url,
  });

  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    console.log("Resume response:", {
      resumeId,
      status: response.status,
      ok: response.ok,
    });

    const resume =
      await handleResponse<Resume>(response);

    console.log("Resume loaded successfully:", resume);

    return resume;
  } catch (error) {
    console.error(
      `Failed to load resume ${resumeId}:`,
      error
    );

    throw error;
  }
}

// ------------------------------------------------------
// Create resume
// ------------------------------------------------------

export async function createResume(
  token: string,
  data: CreateResumeData
): Promise<Resume> {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/resumes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    return await handleResponse<Resume>(response);
  } catch (error) {
    console.error("Create resume error:", error);
    throw error;
  }
}

// ------------------------------------------------------
// Upload existing resume
// ------------------------------------------------------

export async function uploadExistingResume(
  token: string,
  file: File
): Promise<Resume> {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  if (!file) {
    throw new Error("No resume file was selected.");
  }

  const formData = new FormData();

  formData.append("file", file);

  console.log("Uploading resume:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  try {
    const response = await fetch(
      `${API_URL}/api/v1/resumes/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      }
    );

    console.log("Upload response:", {
      status: response.status,
      ok: response.ok,
    });

    const resume =
      await handleResponse<Resume>(response);

    console.log(
      "Resume uploaded successfully:",
      resume
    );

    return resume;
  } catch (error) {
    console.error("Upload resume error:", error);
    throw error;
  }
}

// ------------------------------------------------------
// Update resume
// ------------------------------------------------------

export async function updateResume(
  token: string,
  resumeId: number,
  data: UpdateResumeData
): Promise<Resume> {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  if (!Number.isInteger(resumeId) || resumeId <= 0) {
    throw new Error("Invalid resume ID.");
  }

  try {
    const response = await fetch(
      `${API_URL}/api/v1/resumes/${resumeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    return await handleResponse<Resume>(response);
  } catch (error) {
    console.error(
      `Update resume ${resumeId} error:`,
      error
    );

    throw error;
  }
}

// ------------------------------------------------------
// Delete resume
// ------------------------------------------------------

export async function deleteResume(
  token: string,
  resumeId: number
): Promise<void> {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  if (!Number.isInteger(resumeId) || resumeId <= 0) {
    throw new Error("Invalid resume ID.");
  }

  try {
    const response = await fetch(
      `${API_URL}/api/v1/resumes/${resumeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // --------------------------------------------------
    // 204 No Content is expected here
    // --------------------------------------------------

    if (response.status === 204) {
      return;
    }

    await handleResponse<void>(response);
  } catch (error) {
    console.error(
      `Delete resume ${resumeId} error:`,
      error
    );

    throw error;
  }
}