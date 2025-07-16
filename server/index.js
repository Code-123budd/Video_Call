import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./db/dbConnect.js";
import authRoutes from "./routes/authRoute.js";
import userroute from "./routes/userroute.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);
const allowedOrigins = const allowedOrigins = [
  'https://video-call-froo.onrender.com',
  'http://localhost:5173',
  'https://your-vercel-site.vercel.app'
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userroute);
app.get('/', (req, res) => {
  res.json("Like this");
});

// Start server and DB connection
(async () => {
  try {
    await dbConnect();
    console.log("✅ Database Connected");

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: allowedOrigins[0],
        methods: ["GET", "POST"],
      }
    });

    console.log("✅ Socket.io Initialized with CORS");

    let onlineUser = [];

    io.on("connection", (socket) => {
      console.log(`🔌 New Connection: ${socket.id}`);
      socket.emit("me", socket.id);

      socket.on("join", (user) => {
        if (!user || !user.id) {
          console.log("❌ Invalid User data on Join");
          return;
        }
        socket.join(user.id);
        const existingUser = onlineUser.find((u) => u.userId === user.id);
        if (existingUser) {
          existingUser.socketId = socket.id;
        } else {
          onlineUser.push({
            userId: user.id,
            name: user.name,
            socketId: socket.id
          });
        }
        io.emit("online-users", onlineUser);
      });
      
      socket.on("callToUser",(data)=>{
        //console.log("Incoming call from",data);
        //console.log("Online users:", onlineUser);
        const call=onlineUser.find((user)=>user.userId === data.callToUserId);
        if(!call ){
          socket.emit("userUnavailable",{message:`User Is Offline`});
          return;
        }
        //emit an event to
        io.to(call.socketId).emit("callToUser",{
            signal:data.signalData,
            from:data.from,
            name:data.name,
            email:data.email,
            profilepic:data.profilepic
        })
      })

      socket.on("answeredCall",(data)=>{
        io.to(data.to).emit("callAccepted",{

        signal:data.signal,
        from:data.from
        })
      })

      socket.on("call-ended",(data)=>{
        io.to(data.to).emit("callEnded",{
          name:data.name,
        })
      })

      socket.on("reject-call",(data)=>{
        io.to(data.to).emit("callRejected",{
          name:data.name,
          profilepic:data.profilepic
        })
      })
      socket.on("disconnect", () => {
        const user = onlineUser.find((u) => u.socketId === socket.id);
        onlineUser = onlineUser.filter((u) => u.socketId !== socket.id);
        io.emit("online-users", onlineUser);
        socket.broadcast.emit("disconnectuser", { disUser: socket.id });
        console.log("⚠️ Disconnected:", socket.id);
      });
    });
    const PORT=process.env.PORT||3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ App Crashed:", error.message);
    process.exit(1);
  }
})();
