const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // 환경 변수 로드

const app = express();
const port = process.env.PORT || 3000;

// ✅ MongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB 연결 성공'))
    .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// ✅ MongoDB 스키마 및 모델 설정
const reservationSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

// ✅ 기본 라우트 (서버 확인용)
app.get('/', (req, res) => {
    res.send('서버가 정상적으로 작동 중입니다.');
});

// ✅ 예약 데이터 저장 API (MongoDB에 저장)
app.post('/api/reservations', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: '이름과 이메일은 필수입니다.' });
        }

        const newReservation = new Reservation({ name, email, message });
        await newReservation.save();

        res.status(201).json({
            message: '예약 정보가 성공적으로 저장되었습니다.',
            reservation: newReservation
        });
    } catch (error) {
        console.error('❌ 저장 오류:', error);
        res.status(500).json({ error: '예약 정보를 저장하는 중 오류가 발생했습니다.' });
    }
});

// ✅ 서버 시작
app.listen(port, () => {
    console.log(`🚀 서버가 포트 ${port}번에서 실행 중입니다.`);
});

// ✅ 서버가 살아있는지 확인하는 엔드포인트
app.get('/ping', (req, res) => {
    res.status(200).send('Server is alive');
});
