import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

const tossApiBase = "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "요청을 처리하지 못했어요.";
}

async function tossRequest(path: string, init: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(`${tossApiBase}${path}`, init);
  const body = await response.json();
  if (!response.ok || body.resultType !== "SUCCESS") {
    throw new Error("Toss 사용자 인증에 실패했어요.");
  }
  return body.success as Record<string, unknown>;
}

async function getVerifiedUserKey(request: Request): Promise<string> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("로그인이 필요해요.");

  const user = await tossRequest("/login-me", {
    headers: { Authorization: authorization },
  });
  if (user.userKey == null) throw new Error("사용자 정보를 확인하지 못했어요.");
  return String(user.userKey);
}

async function handleLogin(request: Request): Promise<Response> {
  const { authorizationCode, referrer } = await request.json();
  if (!authorizationCode || !referrer) return json({ error: "로그인 정보가 올바르지 않아요." }, 400);

  const token = await tossRequest("/generate-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authorizationCode, referrer }),
  });
  const accessToken = String(token.accessToken ?? "");
  if (!accessToken) throw new Error("로그인 토큰을 발급하지 못했어요.");

  const user = await tossRequest("/login-me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return json({ userKey: String(user.userKey), accessToken });
}

async function handleGet(request: Request, userKey: string): Promise<Response> {
  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days"));
  const favorites = url.searchParams.get("favorites") === "true";
  const pageParam = url.searchParams.get("page");
  const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize")) || 20, 1), 50);

  let query = supabase.from("meals").select("*").eq("user_id", userKey).order("eaten_at", { ascending: false });
  if (Number.isFinite(days) && days > 0) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    query = query.gte("eaten_at", since.toISOString());
  }
  if (favorites) query = query.eq("is_favorite", true);
  if (pageParam !== null) {
    const page = Math.max(Number(pageParam) || 0, 0);
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (pageParam !== null) return json({ meals: data ?? [], hasMore: (data?.length ?? 0) === pageSize });
  return json(data ?? []);
}

async function handleCreate(request: Request, userKey: string): Promise<Response> {
  const body = await request.json();
  const foodName = String(body.food_name ?? "").trim();
  const mealType = String(body.meal_type ?? "");
  if (!foodName || !["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
    return json({ error: "식사 기록을 확인해주세요." }, 400);
  }

  const { data, error } = await supabase.from("meals").insert({
    user_id: userKey,
    food_name: foodName.slice(0, 100),
    meal_type: mealType,
    is_favorite: Boolean(body.is_favorite),
    eaten_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return json(data, 201);
}

async function handleUpdate(request: Request, userKey: string, id: string): Promise<Response> {
  const body = await request.json();
  const changes: Record<string, unknown> = {};
  if (body.food_name !== undefined) {
    const foodName = String(body.food_name).trim();
    if (!foodName) return json({ error: "음식 이름을 입력해주세요." }, 400);
    changes.food_name = foodName.slice(0, 100);
  }
  if (body.meal_type !== undefined) {
    const mealType = String(body.meal_type);
    if (!["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
      return json({ error: "식사 유형이 올바르지 않아요." }, 400);
    }
    changes.meal_type = mealType;
  }
  if (body.is_favorite !== undefined) changes.is_favorite = Boolean(body.is_favorite);

  const { data, error } = await supabase.from("meals").update(changes).eq("id", id).eq("user_id", userKey).select().single();
  if (error) throw error;
  return json(data);
}

async function handleDelete(userKey: string, id: string): Promise<Response> {
  const { error } = await supabase.from("meals").delete().eq("id", id).eq("user_id", userKey);
  if (error) throw error;
  return json({ success: true });
}

async function handleDeleteAll(userKey: string): Promise<Response> {
  const { error } = await supabase.from("meals").delete().eq("user_id", userKey);
  if (error) throw error;
  return json({ success: true });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^.*\/meal-api/, "") || "/";
    if (path === "/login" && request.method === "POST") return await handleLogin(request);

    const userKey = await getVerifiedUserKey(request);
    if (path === "/meals" && request.method === "GET") return await handleGet(request, userKey);
    if (path === "/meals" && request.method === "POST") return await handleCreate(request, userKey);
    if (path === "/meals" && request.method === "DELETE") return await handleDeleteAll(userKey);

    const match = path.match(/^\/meals\/([0-9a-f-]+)$/i);
    if (match && request.method === "PATCH") return await handleUpdate(request, userKey, match[1]);
    if (match && request.method === "DELETE") return await handleDelete(userKey, match[1]);
    return json({ error: "요청 경로를 찾지 못했어요." }, 404);
  } catch (error) {
    console.error(error);
    const message = errorMessage(error);
    const status = message.includes("로그인") || message.includes("인증") ? 401 : 500;
    return json({ error: message }, status);
  }
});
