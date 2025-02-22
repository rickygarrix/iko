const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase のセットアップ
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// テスト用エンドポイント（フロントエンド接続確認用）
app.get('/api/test', (req, res) => {
  res.json({ message: 'バックエンドとフロントエンドの接続確認成功！' });
});

// Supabase からデータ取得用エンドポイント
app.get('/api/test-db', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// サーバー起動
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/api/add-test', async (req, res) => {
  // リクエストボディから 'name' フィールドを取得する例です
  const { name } = req.body;
  const { data, error } = await supabase
    .from('test')
    .insert([{ name }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});