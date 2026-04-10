import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi MongoDB
const MONGO_URI = "mongodb+srv://dbUser:admin@cluster0.toqswqk.mongodb.net/Database?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('📂 Database: Database');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// === ROUTE 1: GET stats (dari Database 2) ===
app.get('/api/stats', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('Database 2');
    
    const total = await collection.countDocuments({});
    const diabetes = await collection.countDocuments({ Outcome_Actual: 1 });
    const trainData = await collection.countDocuments({ Split: 'Train' });
    const testData = await collection.countDocuments({ Split: 'Test' });

    res.json({
      success: true,
      total,
      diabetes,
      nonDiabetes: total - diabetes,
      trainData,
      testData
    });
  } catch (error) {
    console.error('❌ Error GET /api/stats:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ROUTE 2: GET data (dari Database 2) ===
app.get('/api/data', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('Database 2');
    
    const query = req.query.split ? { Split: req.query.split } : {};
    const data = await collection.find(query).toArray();
    
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('❌ Error GET /api/data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});



// === ROUTE 3: POST predict (PANGGIL VERCEL API) ===
app.post('/api/predict', async (req, res) => {
  try {
    const transactionId = req.body.transactionId || `txn_${Date.now()}`;
    console.log(`📥 [${transactionId}] Received predict request`);

    // Ambil data dari request
    const {
      Glucose, Age, BloodPressure, BMI, Insulin,
      Pregnancies, SkinThickness, DiabetesPedigreeFunction,
      glucose, age, bloodPressure, bmi, insulin,
      pregnancies, skinThickness, diabetesPedigreeFunction,
      patientName, patientGender, source
    } = req.body;

    const g = Glucose ?? glucose;
    const a = Age ?? age;
    const bp = BloodPressure ?? bloodPressure;
    const b = BMI ?? bmi;
    const i = Insulin ?? insulin;
    const p = Pregnancies ?? pregnancies;
    const st = SkinThickness ?? skinThickness;
    const dpf = DiabetesPedigreeFunction ?? diabetesPedigreeFunction;

    // Validasi
    if (g === undefined || g === null || a === undefined || a === null) {
      return res.status(400).json({ success: false, error: 'Glucose dan Age wajib diisi' });
    }

    // ✅ PANGGIL VERCEL API
    const VERCEL_API_URL = 'https://diabetes-ml-api-lyart.vercel.app/predict';
    
    console.log(`🤖 Calling ML API: ${VERCEL_API_URL}`);
    
    const mlApiResponse = await axios.post(VERCEL_API_URL, {
      Pregnancies: p ?? 0,
      Glucose: g,
      BloodPressure: bp ?? 0,
      SkinThickness: st ?? 0,
      Insulin: i ?? 0,
      BMI: b ?? 0,
      DiabetesPedigreeFunction: dpf ?? 0,
      Age: a
    }, {
      timeout: 15000 // 15 detik timeout
    });

    if (!mlApiResponse.data.success) {
      throw new Error('ML API prediction failed');
    }

    const { prediction, probability, riskScore, riskLevel, recommendations } = mlApiResponse.data;

    // Simpan ke MongoDB
    const db = mongoose.connection.db;
    const PredictionCollection = db.collection('Database_3');
    
    const newPrediction = {
      patientName: patientName || 'Tanpa Nama',
      patientGender: patientGender || 'Tidak Diketahui',
      Pregnancies: p ?? 0,
      Glucose: g,
      BloodPressure: bp ?? 0,
      SkinThickness: st ?? 0,
      Insulin: i ?? 0,
      BMI: b ?? 0,
      DiabetesPedigreeFunction: dpf ?? 0,
      Age: a,
      Prediction_Result: prediction,
      Risk_Score: riskScore,
      Risk_Level: riskLevel,
      Recommendations: recommendations,
      Probability: probability,
      source: source || 'web_app',
      status: 'completed',
      transactionId: transactionId,
      createdAt: new Date()
    };

  
    const saved = await PredictionCollection.insertOne(newPrediction);

console.log(`✅ [${transactionId}] Saved: ${patientName}`, saved.insertedId); // Debug log

res.json({
  success: true,
  savedId: saved.insertedId.toString(), // ✅ WAJIB .toString()!
  transactionId: transactionId,
  prediction: prediction,
  probability: probability,
  riskScore: riskScore,
  riskLevel: riskLevel,
  recommendations: recommendations,
  message: 'Prediksi berhasil!'
});

  } catch (error) {
    console.error('❌ Error POST /api/predict:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        success: false, 
        error: 'ML API timeout. Silakan coba lagi.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// === ROUTE 4: GET prediction by ID (untuk cek status hasil) ===
app.get('/api/prediction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;
    const collection = db.collection('Database_3');
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    
    const result = await collection.findOne({ 
      _id: new mongoose.Types.ObjectId(id) 
    });
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Data not found' });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error GET /api/prediction/:id:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   GET  /api/stats`);
  console.log(`   GET  /api/data`);
  console.log(`   POST /api/predict`);
  console.log(`   GET  /api/prediction/:id`);
});