import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Appointment() {
  const [fullName, setFullName] = useState('');
  const [appointments, setAppointments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("account_id");
        if (!userId) return;

        const response = await fetch(`http://192.168.254.100:8080/api/user?account_id=${userId}`);
        const data = await response.json();
        if (data.full_name) setFullName(data.full_name);
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const userId = await AsyncStorage.getItem("account_id");
        if (!userId) return;

        const response = await fetch(`http://192.168.254.100:8080/api/appointments?patient_id=${userId}`);
        const data = await response.json();
        setAppointments(data.appointments || []);
      } catch (error) {
        console.error("❌ Error fetching appointments:", error);
      }
    };

    fetchUserData();
    fetchAppointments();
  }, []);

  // Reschedule (edit) appointment by updating the date/time
  const rescheduleAppointment = async (appointmentId) => {
    // Find the appointment to be updated
    const appointment = appointments.find((appt) => appt.id === appointmentId);
    if (!appointment) {
      Alert.alert("Error", "Appointment not found.");
      return;
    }
    // For demonstration, add one day to the current appointment date/time
    const newDate = new Date(appointment.appointment_date_time);
    newDate.setDate(newDate.getDate() + 1);

    try {
      const response = await fetch(`http://192.168.254.100:8080/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          clinic_id: appointment.clinic_id,
          appointment_date_time: newDate.toISOString(),
          status: appointment.status,
        })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", data.message);
        // Update the appointment in state with the new date/time
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId ? { ...appt, appointment_date_time: newDate.toISOString() } : appt
          )
        );
      } else {
        Alert.alert("Error", data.error || "Failed to update appointment.");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      Alert.alert("Error", "Network error while updating appointment.");
    }
  };

  // Cancel appointment using DELETE method
  const cancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`http://192.168.254.100:8080/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", data.message);
        // Remove the canceled appointment from the state
        setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));
      } else {
        Alert.alert("Error", data.error || "Failed to cancel appointment.");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      Alert.alert("Error", "Network error while canceling appointment.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Profile Section */}
          <View style={styles.profileContainer}>
            <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.profileImage} />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello, </Text>
              <Text style={styles.username}>{fullName}</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search Doctor, Health Issues"
              style={styles.searchInput}
            />
            <FontAwesome5 name="search" size={14} color="#00000080" />
          </View>

          {/* Feature Boxes */}
          <View style={styles.boxRow}>
            <View style={styles.featureBox}>
              <Text style={styles.boxtxt}>Online Consultation</Text>
              <TouchableOpacity style={styles.boxButton}>
                <Text style={styles.boxsubtxt}>Find Doctors</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.featureBox, styles.greenBox]}>
              <Text style={styles.boxtxt}>Nearby Clinics in Naga City</Text>
              <TouchableOpacity style={styles.boxButton}>
                <Text style={styles.boxsubtxt}>Find Clinics</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upcoming Appointments */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Upcoming Appointment</Text>
            <TouchableOpacity onPress={() => router.push("/AppointmentsList")}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {/* Appointment Cards */}
          {appointments.length > 0 ? (
            appointments.map((appt) => (
              <View key={appt.id} style={styles.appointmentCard}>
                <Text style={styles.doctorName}>Dr. {appt.doctor_name}</Text>
                <Text
                  style={[
                    styles.appointmentStatus,
                    appt.status === "pending" ? styles.pendingStatus : styles.onlineStatus,
                  ]}
                >
                  {appt.status === "pending" ? "● Pending" : "● Online"}
                </Text>
                <Text style={styles.dateText}>
                  {new Date(appt.appointment_date_time).toLocaleDateString()}
                </Text>
                <Text style={styles.timeText}>
                  {new Date(appt.appointment_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.rescheduleButton} onPress={() => rescheduleAppointment(appt.id)}>
                    <Text style={styles.buttonText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => cancelAppointment(appt.id)}>
                  <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noAppointmentsText}>No upcoming appointments.</Text>
          )}

          {/* Create New Button */}
          <TouchableOpacity style={styles.createButton} onPress={() => router.push("/CreateAppointment")}>
            <Text style={styles.createButtonText}>Create New</Text>
            <FontAwesome5 name="plus" size={15} color="#FEF7FF" />
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /* Container Layout */
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { flexGrow: 1 },
  content: { padding: 15, paddingBottom: 50 },

  /* Profile Section */
  profileContainer: { alignItems: "center", marginBottom: 20, marginTop: 10 },
  profileImage: { width: 90, height: 90, borderRadius: 50, borderWidth: 2, borderColor: "#D6EEF9", marginBottom: 10 },
  greetingContainer: { flexDirection: "row" },
  greeting: { fontSize: 17, fontWeight: "400" },
  username: { color: "#1170B3", fontWeight: "500", fontSize: 17 },

  /* Search Bar */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 25,
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "#00000080",
    marginVertical: 15,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "500", color: "#00000080" },

  /* Feature Boxes */
  boxRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15 },
  featureBox: { flex: 1, backgroundColor: "#D6EEF9", borderRadius: 20, padding: 15, alignItems: "center", justifyContent: "center", marginHorizontal: 5 },
  greenBox: { backgroundColor: "#C0F6A1" },
  boxtxt: { fontSize: 16, fontWeight: "500", marginBottom: 10, alignSelf: "flex-start" },
  boxButton: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#ccc",
    width: 100,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  boxsubtxt: { fontSize: 10, fontWeight: "500" },

  /* Upcoming Appointments */
  headerSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  viewAll: { fontSize: 12, color: "#0288D0", fontWeight: "500" },
  noAppointmentsText: { textAlign: "center", marginTop: 20, color: "#00000080" },

  /* Single Appointment Container */
  appointmentCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#00000040",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  doctorName: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  appointmentStatus: { fontSize: 14, marginBottom: 5 },
  pendingStatus: { color: "#FFC107" },
  onlineStatus: { color: "#34A853" },
  dateText: { fontSize: 14, marginBottom: 5, color: "#555" },
  timeText: { fontSize: 14, marginBottom: 10, color: "#555" },

  /* Buttons */
  buttonRow: { flexDirection: "row", justifyContent: "space-around" },
  rescheduleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1170B3",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButton: {
    backgroundColor: "#1170B3",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: { fontSize: 14, color: "#1170B3" },
  cancelText: { fontSize: 14, color: "#fff" },

  /* Create New Button */
  createButton: {
    flexDirection: "row",
    width: "55%",
    height: 45,
    borderRadius: 12,
    backgroundColor: "#82C45C",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  createButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold", marginRight: 8 },
});
