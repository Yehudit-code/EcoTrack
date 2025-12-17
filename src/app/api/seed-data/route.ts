import { NextResponse } from "next/server";
import { connectDB } from "@/app/services/server/mongodb";
import mongoose from "mongoose";

export async function POST() {
  try {
    await connectDB();
    
    // Mock user ID for demo
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Sample consumption data for the last 6 months
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const consumptionData = [];
    
    // Generate data for 6 months
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - 1 - i);
      const month = targetDate.getMonth() + 1;
      const year = targetDate.getFullYear();
      
      // Electric consumption (decreasing over time)
      consumptionData.push({
        userId: mockUserId,
        category: "Electricity",
        value: 280 - (i * 10) + Math.random() * 10,
        month,
        year,
        improvementScore: 70 + i * 3,
        tipsGiven: ["Turn off devices when not in use", "Use LED lighting"]
      });
      
      // Water consumption (decreasing over time)
      consumptionData.push({
        userId: mockUserId,
        category: "Water",
        value: 120 - (i * 5) + Math.random() * 5,
        month,
        year,
        improvementScore: 65 + i * 4,
        tipsGiven: ["Reduce shower time", "Fix leaks immediately"]
      });
      
      // Gas consumption (seasonal variation)
      consumptionData.push({
        userId: mockUserId,
        category: "Gas",
        value: 180 - (i * 8) + Math.random() * 15,
        month,
        year,
        improvementScore: 75 + i * 2,
        tipsGiven: ["Lower heating at night", "Check insulation"]
      });
      
      // Transportation (varying)
      consumptionData.push({
        userId: mockUserId,
        category: "Transportation",
        value: 250 + (i * 15) + Math.random() * 20,
        month,
        year,
        improvementScore: 60 - i * 2,
        tipsGiven: ["Use public transport", "Share rides"]
      });
      
      // Waste (decreasing over time)
      consumptionData.push({
        userId: mockUserId,
        category: "Waste",
        value: 100 - (i * 3) + Math.random() * 8,
        month,
        year,
        improvementScore: 80 + i * 2,
        tipsGiven: ["Recycle more", "Buy only what you need"]
      });
    }
    
    // Clear existing data and insert new data
    const db = await connectDB();
    await db.collection('consumptionhabits').deleteMany({});
    await db.collection('consumptionhabits').insertMany(consumptionData);
    
    return NextResponse.json({ 
      message: "Demo data created successfully",
      userId: mockUserId.toString(),
      recordsCreated: consumptionData.length
    });
    
  } catch (error) {
    console.error("❌ Error creating demo data:", error);
    return NextResponse.json({ error: "Failed to create demo data" }, { status: 500 });
  }
}