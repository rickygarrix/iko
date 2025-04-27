import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ✅ APIキー読み込み
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error("❌ GOOGLE_API_KEY が .env.local に設定されていません！");
  process.exit(1);
}

// ✅ 検索設定
const query = "横浜 ジャズバー";
const searchEndpoint = "https://places.googleapis.com/v1/places:searchText";
const detailsEndpoint = "https://places.googleapis.com/v1/places/";

// ✅ CSV出力設定（storesテーブルと一致）
const csvWriter = createObjectCsvWriter({
  path: "results_yokohama_jazz.csv",
  header: [
    { id: "name", title: "name" },
    { id: "address", title: "address" },
    { id: "latitude", title: "latitude" },
    { id: "longitude", title: "longitude" },
    { id: "opening_hours", title: "opening_hours" },
    { id: "website", title: "website" },
    { id: "instagram", title: "instagram" },
    { id: "map_embed", title: "map_embed" },
  ],
});

// ✅ Place Details取得
async function fetchPlaceDetails(placeId) {
  const fields = "openingHours,websiteUri,googleMapsUri";

  try {
    const res = await axios.get(`${detailsEndpoint}${placeId}`, {
      params: {
        key: API_KEY,
        languageCode: "ja",
        regionCode: "JP",
        fields: fields,
      },
    });

    const website = res.data.websiteUri ?? "";
    const instagram = website.includes("instagram.com") ? website : "";

    const openingHoursArr = res.data.openingHours?.weekdayDescriptions ?? [];
    const openingHours = openingHoursArr.length > 0 ? openingHoursArr.join(" / ") : "";

    return {
      openingHours,
      website,
      instagram,
      mapLink: res.data.googleMapsUri ?? "",
    };
  } catch (err) {
    console.warn(`⚠️ 詳細取得失敗: ${placeId}`, err.response?.data || err.message);
    return {
      openingHours: "",
      website: "",
      instagram: "",
      mapLink: "",
    };
  }
}

// ✅ メイン関数
async function searchAndSave() {
  try {
    const res = await axios.post(
      searchEndpoint,
      {
        textQuery: query,
        languageCode: "ja",
        regionCode: "JP",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location",
        },
      }
    );

    const results = res.data.places || [];
    if (results.length === 0) {
      console.warn("⚠️ 検索結果がありませんでした。");
      return;
    }

    const formatted = [];

    for (const place of results.slice(0, 10)) { // ⭐ 10件だけ取得
      const placeId = place.id;
      const details = await fetchPlaceDetails(placeId);

      formatted.push({
        name: place.displayName?.text ?? "",
        address: place.formattedAddress ?? "",
        latitude: place.location?.latitude ?? "",
        longitude: place.location?.longitude ?? "",
        opening_hours: details.openingHours,
        website: details.website,
        instagram: details.instagram,
        map_embed: `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=place_id:${placeId}`,
      });
    }

    await csvWriter.writeRecords(formatted);
    console.log("✅ 横浜ジャズ版CSV (results_yokohama_jazz.csv) 出力完了！");
  } catch (err) {
    console.error("❌ エラー:", err.response?.data || err.message);
  }
}

searchAndSave();