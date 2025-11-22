import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Login } from "@/lib/imports"
import { connectToDatabase } from '@/lib/mongodb';


export default async function Home() {
  const cookieStore = await cookies();
  const authUser = cookieStore.get("authUser");

  if(!authUser) {
    return (
    <main className="min-h-screen flex-center">
      <Login/>
    </main>
    )
  }

  let userRole: string | null = null;
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');
    const user = await collection.findOne({ username: authUser.value });
    userRole = user?.role || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    redirect('/');
  }

  if (userRole !== 'admin') {
    redirect('/dashboard');
  }else{
    redirect('/admin');
  }

  
}
