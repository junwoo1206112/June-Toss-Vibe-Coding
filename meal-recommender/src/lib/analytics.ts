import { Analytics } from "@apps-in-toss/web-framework";

type AnalyticsParams = Record<string, string | number | boolean | null>;

function send(
  method: "screen" | "impression" | "click",
  logName: string,
  params: AnalyticsParams = {},
) {
  try {
    const result = Analytics[method]({ log_name: logName, ...params });
    if (result) {
      void result.catch((error) => {
        console.warn(`Analytics ${logName} 전송에 실패했어요.`, error);
      });
    }
  } catch (error) {
    console.warn(`Analytics ${logName} 호출에 실패했어요.`, error);
  }
}

export function trackScreen(logName: string, params?: AnalyticsParams) {
  send("screen", logName, params);
}

export function trackImpression(logName: string, params?: AnalyticsParams) {
  send("impression", logName, params);
}

export function trackClick(logName: string, params?: AnalyticsParams) {
  send("click", logName, params);
}
