"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function FirebaseTest() {
  useEffect(() => {
    const testFirebase = async () => {
      try {
        await addDoc(collection(db, "test"), {
          message: "Firebase connected successfully",
          time: new Date(),
        });
        console.log("Firebase write successful");
      } catch (error) {
        console.error("Firebase error:", error);
      }
    };

    testFirebase();
  }, []);

  return <h1>Check console for Firebase status</h1>;
}