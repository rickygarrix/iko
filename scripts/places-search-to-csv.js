import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // 🔥 明示的に読み込む

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error("❌ GOOGLE_API_KEY が .env.local に設定されていません！");
  process.exit(1);
}

const query = "渋谷 ジャズバー";
const searchEndpoint = "https://places.googleapis.com/v1/places:searchText";
const detailsEndpoint = "https://places.googleapis.com/v1/places/";

const csvWriter = createObjectCsvWriter({
  path: "results_full.csv",
  header: [
    { id: "name", title: "名前" },
    { id: "address", title: "住所" },
    { id: "lat", title: "緯度" },
    { id: "lng", title: "経度" },
    { id: "rating", title: "評価" },
    { id: "userRatingsTotal", title: "レビュー数" },
    { id: "placeId", title: "Place ID" },
    { id: "openingHours", title: "営業時間" },
    { id: "website", title: "公式サイト" },
    { id: "mapUrl", title: "マップリンク" },
  ],
});

async function fetchPlaceDetails(placeId) {
  const fields =
    "openingHours,websiteUri,googleMapsUri";

  try {
    const res = await axios.get(
      `${detailsEndpoint}${placeId}`,
      {
        params: {
          key: API_KEY,
          languageCode: "ja",
          regionCode: "JP",
          fields: fields,
        },
      }
    );

    return {
      openingHours:
        res.data.openingHours?.weekdayDescriptions?.join(" / ") ?? "",
      website: res.data.websiteUri ?? "",
      mapUrl: res.data.googleMapsUri ?? "",
    };
  } catch (err) {
    console.warn(`⚠️ Place Details取得失敗: ${placeId}`, err.response?.data || err.message);
    return {
      openingHours: "",
      website: "",
      mapUrl: "",
    };
  }
}

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
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount",
        },
      }
    );

    const results = res.data.places || [];

    if (results.length === 0) {
      console.warn("⚠️ 検索結果がありませんでした。");
      return;
    }

    const formatted = [];

    for (const place of results) {
      const placeId = place.id;
      const details = await fetchPlaceDetails(placeId);

      formatted.push({
        name: place.displayName?.text ?? "",
        address: place.formattedAddress ?? "",
        lat: place.location?.latitude ?? "",
        lng: place.location?.longitude ?? "",
        rating: place.rating ?? "",
        userRatingsTotal: place.userRatingCount ?? "",
        placeId: placeId,
        openingHours: details.openingHours,
        website: details.website,
        mapUrl: details.mapUrl,
      });
    }

    await csvWriter.writeRecords(formatted);
    console.log("✅ 詳細付きCSV出力完了！results_full.csv を確認してください。");
  } catch (err) {
    console.error("❌ 検索またはCSV出力エラー:", err.response?.data || err.message);
  }
}

searchAndSave();