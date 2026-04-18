import { NextFunction,Response,Request } from "express";

type IpRequestsData={
    count:number;
    startTime:number;
}

const ipRequests:Record<string,IpRequestsData>={};

const blockedIPs:Set<string>=new Set();

const unblockTimer:Map<string,NodeJS.Timeout>= new Map();

const RATE_LIMIT=10;

const WINDOW = 5 * 60 * 1000;

setInterval(() => {
  const currentTime = Date.now();
  for (const ip in ipRequests) {
    const data = ipRequests[ip];
    if (data && currentTime - data.startTime > WINDOW && !blockedIPs.has(ip)) {
      delete ipRequests[ip];
    }
  }
}, WINDOW);

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown";
  const currentTime = Date.now();

  if (blockedIPs.has(ip)) {
    return res.status(429).json({ message: "Too many requests, please try again later." });
  }

  const userData = ipRequests[ip];

  if (!userData) {
    ipRequests[ip] = {
      count: 1,
      startTime: currentTime,
    };
    return next();
  }

  const diff = currentTime - userData.startTime;

  if (diff > WINDOW) {
    // Window expired, start a new one
    ipRequests[ip] = {
      count: 1,
      startTime: currentTime,
    };
    return next();
  }

  if (userData.count >= RATE_LIMIT) {
    blockedIPs.add(ip);
    if (!unblockTimer.has(ip)) {
      const timer = setTimeout(() => {
        blockedIPs.delete(ip);
        delete ipRequests[ip];
        unblockTimer.delete(ip);
      }, WINDOW);
      unblockTimer.set(ip, timer);
    }
    return res.status(429).json({ message: "Too many requests, please try again later." });
  }

  // Still within window and under limit, increment count
  userData.count++;
  next();
};
