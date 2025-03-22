const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// ✅ CORS 설정 - 프론트엔드 주소만 허용
app.use(cors({
    origin: 'https://surveyaihealthcare.vercel.app',
    methods: ['POST', 'GET'],
    credentials: true
}));

// ✅ Supabase 클라이언트 생성
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ 예약 저장 API
app.post('/api/reservations', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: '이름과 이메일은 필수입니다.' });
    }

    const { data, error } = await supabase.from('reservations').insert([
        { name, email, message }
    ]);

    if (error) {
        console.error("❌ Supabase 저장 오류:", error);
        return res.status(500).json({ error: '데이터 저장 중 오류 발생' });
    }

    res.status(201).json({ message: '예약 저장 성공!', reservation: data[0] });
});

// ✅ 서버 시작
app.listen(port, () => {
    console.log(`✅ 서버 실행 중 (포트: ${port})`);
});
