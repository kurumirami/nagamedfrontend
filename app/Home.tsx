import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  const [appointments, setAppointments] = useState([]);
  const [fullName, setFullName] = useState("User"); // Default name

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("account_id"); // Retrieve stored user ID
        if (!userId) {
          console.error("❌ No user ID found in AsyncStorage");
          return;
        }

        const response = await fetch(`https://testinglang.onrender.com/api/user?account_id=${userId}`);
        const data = await response.json();
        
        if (data.full_name) setFullName(data.full_name); // ✅ Set Full Name
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const userId = await AsyncStorage.getItem("account_id");
        if (!userId) return;

        const response = await fetch(`https://testinglang.onrender.com/api/appointments?patient_id=${userId}`);
        const data = await response.json();
        setAppointments(data.appointments || []);
      } catch (error) {
        console.error("❌ Error fetching appointments:", error);
      }
    };

    fetchUserData();
    fetchAppointments();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pt1}>Good day, {fullName}!</Text> {/* ✅ Show full name */}

      {/* Menu Items */}
      <View style={styles.pt2}>
        <Link href="/Appointment" asChild>
          <TouchableOpacity style={styles.boxWrapper} activeOpacity={0.7}>
            <View style={styles.box}>
              <Image source={require("../assets/images/bookappointments.png")} style={styles.boxImage} />
            </View>
            <Text style={styles.boxText}>Book Appointment</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/Status" asChild>
          <TouchableOpacity style={styles.boxWrapper} activeOpacity={0.7}>
            <View style={styles.box}>
              <Image source={require("../assets/images/healthrecords.png")} style={styles.boxImage} />
            </View>
            <Text style={styles.boxText}>Health Records</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/Doctors" asChild>
          <TouchableOpacity style={styles.boxWrapper} activeOpacity={0.7}>
            <View style={styles.box}>
              <Image source={require("../assets/images/consultdoctor.png")} style={styles.boxImage} />
            </View>
            <Text style={styles.boxText}>Consult Doctor</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.header2}>
        <Text style={styles.header2txt}>Upcoming Appointments</Text>
      </View>

      <View style={styles.horizontalBoxWrapper}>
        {appointments.length > 0 ? (
          appointments.map((appt, index) => (
            <View key={index} style={styles.horizontalBox}>
              <Text style={styles.maintext}>{appt.doctor_name}</Text> 
              <Text style={styles.subtext}>
                {appt.status} on {new Date(appt.appointment_date_time).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.subtext}>No upcoming appointments.</Text>
        )}
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 15 },
  pt1: { fontSize: 20, fontWeight: "700" },
  pt2: { flexDirection: "row", justifyContent: "space-around", marginVertical: 15 },
  box: { width: 110, height: 110, backgroundColor: "#A7EC80", borderRadius: 16, alignItems: "center", justifyContent: "center", elevation: 4 },
  boxWrapper: { alignItems: "center" },
  boxText: { marginTop: 10, fontSize: 15, fontWeight: "600" },
  boxImage: { width: "70%", height: "70%", resizeMode: "contain" },
  header2: { flexDirection: "row", justifyContent: "space-between" },
  header2txt: { fontSize: 20, fontWeight: "500" },
  header2subtxt: { fontSize: 12, color: "#0288D0", fontWeight: "500" },
  horizontalBoxWrapper: { gap: 10 },
  horizontalBox: { backgroundColor: "#FFFFFF", padding: 15, borderRadius: 16, borderWidth: 1, borderColor: "#00000099", elevation: 4 },
  maintext: { fontSize: 16, fontWeight: "500" },
  subtext: { fontSize: 13, lineHeight: 20, fontWeight: "500" },
});

