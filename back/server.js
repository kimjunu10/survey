/**
 * server.js (전체 예시)
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// =====================
// 1) CORS 설정
// =====================
app.use(cors({
    // 원래 'https://surveyaihealthcare.vercel.app/' 에서 슬래시(/) 제거
    origin: 'https://surveyaihealthcare.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

// =====================
// 2) Supabase 연결
// =====================
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// =====================
// 3) 미들웨어
// =====================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =====================
// 4) 테스트용 라우트 (서버 동작 확인)
// =====================
app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

// =====================
// 5) API
// =====================
app.post('/api/reservations', async (req, res) => {
    const { name, email, message } = req.body;

    // 필수 값 확인
    if (!name || !email) {
        return res.status(400).json({ error: '이름과 이메일은 필수입니다.' });
    }

    // Supabase에 데이터 삽입
    const { data, error } = await supabase
        .from('reservations')
        .insert([{ name, email, message }]);

    // 에러 처리
    if (error) {
        console.error("❌ Supabase 저장 오류:", error);
        return res.status(500).json({ error: '데이터 저장 중 오류 발생' });
    }

    // 성공 응답
    res.status(201).json({ message: '예약 저장 성공!', reservation: data[0] });
});

// =====================
// 6) 서버 시작
// =====================
app.listen(port, () => {
    console.log(`✅ 서버 실행 중 (포트: ${port})`);
});
