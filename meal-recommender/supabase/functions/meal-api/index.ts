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

const MAX_BODY_SIZE = 64 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAIN_MEAL_TYPES = new Set(["breakfast", "lunch", "dinner"]);
const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function getSeoulDateRange(value = new Date()): { start: string; end: string } {
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
  const startDate = new Date(`${dateKey}T00:00:00+09:00`);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  return { start: startDate.toISOString(), end: endDate.toISOString() };
}

async function readBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("Content-Length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    throw new Error("요청 본문이 너무 커요.");
  }
  const body = await request.text();
  if (body.length > MAX_BODY_SIZE) {
    throw new Error("요청 본문이 너무 커요.");
  }
  return body ? JSON.parse(body) : null;
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
  const body = await readBody(request) as { authorizationCode?: unknown; referrer?: unknown };
  const { authorizationCode, referrer } = body;
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
  const body = await readBody(request) as Record<string, unknown>;
  const foodName = String(body.food_name ?? "").trim();
  const mealType = String(body.meal_type ?? "");
  if (!foodName || !["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
    return json({ error: "식사 기록을 확인해주세요." }, 400);
  }

  if (MAIN_MEAL_TYPES.has(mealType)) {
    const { start, end } = getSeoulDateRange();
    const { data: existing, error } = await supabase
      .from("meals")
      .select("id")
      .eq("user_id", userKey)
      .eq("meal_type", mealType)
      .gte("eaten_at", start)
      .lt("eaten_at", end)
      .limit(1);
    if (error) throw error;
    if ((existing?.length ?? 0) > 0) {
      return json({ error: `오늘 ${MEAL_TYPE_LABELS[mealType]}은 이미 기록했어요. 기록 화면에서 수정해주세요.` }, 409);
    }
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
  if (!isValidUuid(id)) return json({ error: "식사 기록 ID가 올바르지 않아요." }, 400);
  const body = await readBody(request) as Record<string, unknown>;
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

  if (typeof changes.meal_type === "string" && MAIN_MEAL_TYPES.has(changes.meal_type)) {
    const { data: current, error: currentError } = await supabase
      .from("meals")
      .select("eaten_at")
      .eq("id", id)
      .eq("user_id", userKey)
      .single();
    if (currentError) throw currentError;
    const { start, end } = getSeoulDateRange(new Date(current.eaten_at));
    const { data: existing, error } = await supabase
      .from("meals")
      .select("id")
      .eq("user_id", userKey)
      .eq("meal_type", changes.meal_type)
      .gte("eaten_at", start)
      .lt("eaten_at", end)
      .neq("id", id)
      .limit(1);
    if (error) throw error;
    if ((existing?.length ?? 0) > 0) {
      return json({ error: `해당 날짜의 ${MEAL_TYPE_LABELS[changes.meal_type]}은 이미 기록되어 있어요.` }, 409);
    }
  }

  const { data, error } = await supabase.from("meals").update(changes).eq("id", id).eq("user_id", userKey).select().single();
  if (error) throw error;
  return json(data);
}

async function handleDelete(userKey: string, id: string): Promise<Response> {
  if (!isValidUuid(id)) return json({ error: "식사 기록 ID가 올바르지 않아요." }, 400);
  const { data, error } = await supabase.from("meals").delete().eq("id", id).eq("user_id", userKey).select();
  if (error) throw error;
  if (!data || data.length === 0) return json({ error: "삭제할 식사 기록을 찾지 못했어요." }, 404);
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
