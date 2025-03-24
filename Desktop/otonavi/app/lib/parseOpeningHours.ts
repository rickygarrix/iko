/* eslint-disable prefer-const */
import dayjs from "dayjs";
import "dayjs/locale/ja";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

// ✅ **曜日を日本語に変換**
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

// ✅ **営業時間を解析**
export const parseOpeningHours = (openingHours?: string): { displayText: string; isOpen: boolean; nextOpening?: string } => {
  if (!openingHours) return { displayText: "営業時間情報なし", isOpen: false };

  const nowRaw = dayjs().locale("ja");
  let now = nowRaw;

  // ✅ 6時より前なら前日扱い
  if (nowRaw.hour() < 6) {
    now = nowRaw.subtract(1, "day");
  }

  let today = convertToJapaneseDay(now.format("dddd"));
  let tomorrow = convertToJapaneseDay(now.add(1, "day").format("dddd"));

  const hoursMap: { [key: string]: { open: string; close: string }[] } = {};
  openingHours.split("\n").forEach((line) => {
    const match = line.match(/^(.+?曜)\s*(.+)$/);
    if (match && match[1] && match[2]) {
      const day = match[1].trim();
      let hoursText = match[2].trim();

      if (hoursText === "休み") {
        hoursMap[day] = []; // 休業日は空配列
      } else {
        let hoursList = hoursText.split(", ");
        hoursMap[day] = hoursList.map((hours) => {
          const [openTime, closeTime] = hours.split("〜").map((t) => t.trim());
          return { open: openTime, close: closeTime };
        });
      }
    }
  });

  const foundKey = Object.keys(hoursMap).find((key) => key.startsWith(today));

  if (!foundKey || !hoursMap.hasOwnProperty(foundKey) || !Array.isArray(hoursMap[foundKey]) || hoursMap[foundKey]?.length === 0) {
    // 休業日
    let nextDayKey = Object.keys(hoursMap).find((key) => key.startsWith(tomorrow));
    if (nextDayKey && hoursMap[nextDayKey].length > 0) {
      return { displayText: "本日休業", isOpen: false, nextOpening: `次の営業: ${nextDayKey} ${hoursMap[nextDayKey][0]?.open} から` };
    }
    return { displayText: "本日休業", isOpen: false };
  }

  const todayHours = hoursMap[foundKey] || [];
  if (!todayHours.length) {
    return { displayText: "営業時間情報なし", isOpen: false };
  }

  let isOpen = false;
  let nextOpening = "";

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
      nextOpening = `本日 ${close.format("HH:mm")} まで営業`;
      return { displayText: nextOpening, isOpen, nextOpening };
    }
  }

  if (!isOpen) {
    const currentHour = nowRaw.hour();

    // ✅ **深夜営業終了 〜 6時 の間は「営業時間外」のみを表示**
    if (currentHour < 6) {
      return { displayText: "営業時間外", isOpen: false, nextOpening: "6時の更新をお待ちください" };
    }

    let futureHours = todayHours.filter(period =>
      dayjs(`${now.format("YYYY-MM-DD")} ${period.open}`).isAfter(now)
    );

    if (futureHours.length > 0) {
      // ✅ **今日の営業時間内で次の営業がある場合**
      nextOpening = `次の営業: 本日 ${futureHours[0]?.open} から`;
    } else {
      let nextDayKey = Object.keys(hoursMap).find((key) => key.startsWith(tomorrow));
      if (nextDayKey && hoursMap[nextDayKey].length > 0) {
        // ✅ **翌日以降の営業なら曜日をつける**
        nextOpening = `次の営業: ${nextDayKey} ${hoursMap[nextDayKey][0]?.open} から`;
      }
    }
  }

  // ✅ **「次の営業: 本日」→「本日」に統一**
  if (nextOpening.startsWith("次の営業: 本日")) {
    nextOpening = nextOpening.replace("次の営業: 本日", "本日");
  }

  return {
    displayText: isOpen ? nextOpening : "営業時間外",
    isOpen,
    nextOpening: nextOpening || "6時の更新をお待ちください"
  };
};