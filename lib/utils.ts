/* eslint-disable prefer-const */
import dayjs from "dayjs";
import "dayjs/locale/ja";
import isBetween from "dayjs/plugin/isBetween";
import { supabase } from "@/lib/supabase";

dayjs.extend(isBetween);

// ✅ 曜日を日本語に変換
export const convertToJapaneseDay = (day: string) => {
  return day
    .replace("Sunday", "日曜日")
    .replace("Monday", "月曜日")
    .replace("Tuesday", "火曜日")
    .replace("Wednesday", "水曜日")
    .replace("Thursday", "木曜日")
    .replace("Friday", "金曜日")
    .replace("Saturday", "土曜日")
    .replace("曜日", "");
};

// ✅ 営業時間を判定
export const checkIfOpen = (opening_hours: string) => {
  const nowRaw = dayjs().locale("ja");
  let now = nowRaw;
  if (nowRaw.hour() < 6) {
    now = nowRaw.subtract(1, "day");
  }

  const today = convertToJapaneseDay(now.format("dddd"));
  const tomorrow = convertToJapaneseDay(now.add(1, "day").format("dddd"));

  const hoursMap: { [key: string]: { open: string; close: string }[] } = {};
  opening_hours.split("\n").forEach((line) => {
    const match = line.match(/^(.+?曜)\s*(.+)$/);
    if (match && match[1] && match[2]) {
      const day = match[1].trim();
      const hoursText = match[2].trim();

      if (hoursText === "休み") {
        hoursMap[day] = [];
      } else {
        const hoursList = hoursText.split(", ");
        hoursMap[day] = hoursList.map((hours) => {
          const [openTime, closeTime] = hours.split("〜").map((t) => t.trim());
          return { open: openTime, close: closeTime };
        });
      }
    }
  });

  const foundKey = Object.keys(hoursMap).find((key) => key.startsWith(today));
  if (
    !foundKey ||
    !hoursMap.hasOwnProperty(foundKey) ||
    !Array.isArray(hoursMap[foundKey]) ||
    hoursMap[foundKey]?.length === 0
  ) {
    const nextDayKey = Object.keys(hoursMap).find((key) =>
      key.startsWith(tomorrow)
    );
    if (
      !nextDayKey ||
      !hoursMap.hasOwnProperty(nextDayKey) ||
      !Array.isArray(hoursMap[nextDayKey])
    ) {
      return { isOpen: false, nextOpening: "営業情報なし" };
    }
    return {
      isOpen: false,
      nextOpening: `次の営業: ${nextDayKey} ${hoursMap[nextDayKey][0]?.open} から`,
    };
  }

  const todayHours = hoursMap[foundKey] || [];
  if (!todayHours.length) {
    return { isOpen: false, nextOpening: "情報なし" };
  }

  let nextOpening = "";
  let isOpen = false;

  for (const period of todayHours) {
    let openHour = parseInt(period.open.split(":")[0], 10);
    let openMinute = parseInt(period.open.split(":")[1], 10);
    let closeHour = parseInt(period.close.split(":")[0], 10);
    let closeMinute = parseInt(period.close.split(":")[1], 10);

    let open = now.set("hour", openHour).set("minute", openMinute);
    let close = now.set("hour", closeHour).set("minute", closeMinute);

    if (closeHour >= 24) {
      closeHour -= 24;
      close = now.add(1, "day").set("hour", closeHour).set("minute", closeMinute);
    }

    if (nowRaw.isBetween(open, close, null, "[)")) {
      isOpen = true;
      nextOpening = `${close.format("HH:mm")} まで営業`;
      break;
    }
  }

  if (!isOpen) {
    const currentHour = nowRaw.hour();
    if (currentHour < 6) {
      return { isOpen: false, nextOpening: "" };
    }

    const futureHours = todayHours.filter((period) =>
      dayjs(`${now.format("YYYY-MM-DD")} ${period.open}`).isAfter(now)
    );

    if (futureHours.length > 0) {
      nextOpening = `次の営業: ${today} ${futureHours[0]?.open} から`;
    } else {
      const nextDayKey = Object.keys(hoursMap).find((key) =>
        key.startsWith(tomorrow)
      );
      if (nextDayKey && hoursMap[nextDayKey].length > 0) {
        nextOpening = `次の営業: ${nextDayKey} ${hoursMap[nextDayKey][0]?.open} から`;
      }
    }
  }

  return { isOpen, nextOpening };
};

// ✅ デバイス判定関数
export const getDeviceType = (): "pc" | "mobile" => {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("android")) {
    return "mobile";
  }
  return "pc";
};

// ✅ アクションログを保存する関数
export const logAction = async (
  action: string,
  payload?: Record<string, unknown> // 🔧 any → unknown に変更
) => {
  try {
    const baseLog = {
      action,
      device: getDeviceType(),
      referrer_page: document.referrer || null,
      ...payload,
    };

    await supabase.from("action_logs").insert([baseLog]);
  } catch (error) {
    console.error("❌ ログ保存エラー:", error);
  }
};