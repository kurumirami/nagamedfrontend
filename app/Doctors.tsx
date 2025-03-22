import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function Doctors({ route }) {
  const [doctors, setDoctors] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Get Clinic ID from navigation params (If needed)
  const clinicId = route?.params?.clinicId || 10; // Default to 10 if not provided

  useEffect(() => {
    fetchDoctors();
  }, [clinicId]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`https://testinglang.onrender.com/api/clinics/${clinicId}/doctors`);
      const data = await response.json();
      if (response.ok) {
        setDoctors(data);
      } else {
        setErrorMessage(data.error || "Failed to load doctors.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Doctors</Text>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.doctor_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.name} - {item.specialization}</Text>
            <Text style={styles.cardSubText}>Available: {item.availability}</Text>
            <Text style={styles.cardSubText}>Contact: {item.contact_info}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, marginVertical: 5, borderRadius: 8 },
  cardText: { fontSize: 18, fontWeight: "bold" },
  cardSubText: { fontSize: 14, color: "#666" },
  errorText: { color: "red", textAlign: "center", marginBottom: 10 },
});
