import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

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
    { id: "openingHours", title: "営業時間" },
    { id: "website", title: "公式サイト" },
    { id: "instagram", title: "Instagram" },
    { id: "mapUrl", title: "マップリンク" },
    { id: "mapEmbed", title: "埋め込みリンク" },
  ],
});

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

    return {
      openingHours: res.data.openingHours?.weekdayDescriptions?.join(" / ") ?? "",
      website,
      instagram,
      mapUrl: res.data.googleMapsUri ?? "",
    };
  } catch (err) {
    console.warn(`⚠️ 詳細取得失敗: ${placeId}`, err.response?.data || err.message);
    return {
      openingHours: "",
      website: "",
      instagram: "",
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

    for (const place of results) {
      const placeId = place.id;
      const details = await fetchPlaceDetails(placeId);

      formatted.push({
        name: place.displayName?.text ?? "",
        address: place.formattedAddress ?? "",
        lat: place.location?.latitude ?? "",
        lng: place.location?.longitude ?? "",
        openingHours: details.openingHours,
        website: details.website,
        instagram: details.instagram,
        mapUrl: details.mapUrl,
        mapEmbed: `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=place_id:${placeId}`,
      });
    }

    await csvWriter.writeRecords(formatted);
    console.log("✅ rating / userRatings / placeId を除いたCSV出力完了！");
  } catch (err) {
    console.error("❌ エラー:", err.response?.data || err.message);
  }
}

searchAndSave();