/**
 * server.js
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
    // 요청하는 도메인과 정확히 일치하도록 슬래시 없이 지정
    origin: 'https://surveyaihealthcare.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));
// Preflight(OPTIONS) 요청 처리
app.options('*', cors());

// =====================
// 2) 미들웨어 설정
// =====================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =====================
// 3) Supabase 연결
// =====================
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// =====================
// 4) 테스트용 라우트 (서버 동작 확인)
// =====================
app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

// =====================
// 5) 예약 API
// =====================
app.post('/api/reservations', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: '이름과 이메일은 필수입니다.' });
    }

    try {
        const { data, error } = await supabase
            .from('reservations')
            .insert([{ name, email, message }]);
        // .select('*');  // 안 써도 OK

        if (error) {
            console.error("Supabase 저장 오류:", error);
            return res.status(500).json({ error: '데이터 저장 중 오류 발생' });
        }

        // data[0] 같은 건 참조하지 않고, 그냥 성공만 알려줌
        return res.status(201).json({ message: '예약 저장 성공!' });
    } catch (err) {
        console.error('서버 내부 오류:', err);
        return res.status(500).json({ error: '서버 내부 오류' });
    }
});
// =====================
// 6) 에러 핸들러 (CORS 헤더를 포함하여 에러 응답 전송)
// =====================
app.use((err, req, res, next) => {
    console.error("서버 내부 오류:", err);
    res.header('Access-Control-Allow-Origin', 'https://surveyaihealthcare.vercel.app');
    res.status(500).json({ error: '서버 내부 오류' });
});

// =====================
// 7) 서버 시작
// =====================
app.listen(port, () => {
    console.log(`✅ 서버 실행 중 (포트: ${port})`);
});
