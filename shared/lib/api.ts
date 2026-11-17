// Backend se baat karne ki ek hi jagah. Har call yahan se guzarti hai

// Teen apps: customer (website), admin, rider. Har app ki next.config.ts mein pakka likha hai (env se nahi)
export type AppName = "customer" | "admin" | "rider";
export const APP = process.env.NEXT_PUBLIC_MF_APP as AppName;

// Backend ka error message, aur HTTP status (0 = server tak pahunche hi nahi).
// correctApp: password sahi tha lekin account doosri app ka hai (form us app ka link dikhata hai).
// needsVerification: email ka code abhi nahi daala
export class ApiError extends Error {
  status: number;
  correctApp?: AppName;
  needsVerification: boolean;

  constructor(message: string, status: number, data?: { correctApp?: AppName; needsVerification?: boolean } | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.correctApp = data?.correctApp;
    this.needsVerification = data?.needsVerification === true;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function api<T>(path: string, { method = "GET", body }: RequestOptions = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not set");

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: "include", // login wali cookie saath jaye
      cache: "no-store",
      // X-App: backend isi se is app ki apni login cookie parhta hai (teeno apps ek browser mein alag login)
      headers: { "X-App": APP, ...(body !== undefined && { "Content-Type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Could not reach the server. Please check your connection and try again.", 0);
  }

  // JSON na aaye (jaise host ka apna error page) to bhi crash na ho
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message ?? "Something went wrong. Please try again.", response.status, data);
  }

  return data as T;
}
