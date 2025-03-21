const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI; // 환경 변수에서 가져옴
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ MongoDB 연결 성공!");
    } catch (error) {
        console.error("❌ MongoDB 연결 실패:", error);
    }
}
connectDB();

app.post('/api/reservations', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: '이름과 이메일은 필수입니다.' });
    }

    try {
        const db = client.db('surveyDB'); // DB 이름 지정
        const collection = db.collection('reservations');
        const newReservation = { name, email, message: message || '', createdAt: new Date() };
        await collection.insertOne(newReservation);
        res.status(201).json({ message: '예약 저장 성공!', reservation: newReservation });
    } catch (error) {
        console.error("❌ 저장 오류:", error);
        res.status(500).json({ error: '데이터 저장 중 오류 발생' });
    }
});

app.listen(port, () => {
    console.log(`✅ 서버 실행 중 (포트: ${port})`);
});
