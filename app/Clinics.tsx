import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function Clinics() {
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    fetch("https://testinglang.onrender.com/api/clinics")
      .then((response) => response.json())
      .then((data) => setClinics(data))
      .catch((error) => console.error("Error fetching clinics:", error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Clinics</Text>
      <FlatList
        data={clinics}
        keyExtractor={(item) => item.clinic_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.address}</Text>
            <Text>{item.contact_info}</Text>
            <Text>Rating: {item.ratings || "N/A"}</Text>
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
  name: { fontSize: 18, fontWeight: "bold" },
});
