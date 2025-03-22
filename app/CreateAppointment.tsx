import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const { width, height } = Dimensions.get("window");

export default function CreateAppointment() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchClinics();
  }, []);

  // Fetch Clinics
  const fetchClinics = async () => {
    try {
      const response = await fetch("https://testinglang.onrender.com/api/clinics");
      const data = await response.json();
      if (response.ok) {
        setClinics(data);
      } else {
        setErrorMessage("Failed to load clinics.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  // Fetch Doctors when a clinic is selected
  const fetchDoctors = async (clinicId) => {
    if (!clinicId) {
      setDoctors([]);
      return;
    }
    try {
      const response = await fetch(`https://testinglang.onrender.com/api/clinics/${clinicId}/doctors`);
      const data = await response.json();
      if (response.ok) {
        setDoctors(data);
      } else {
        setDoctors([]);
        setErrorMessage("No doctors available for this clinic.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  // Handle Booking Appointment
  const handleBookAppointment = async () => {
    if (!name || !selectedClinic || !selectedDoctor || !reason) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
  
    try {
      const account_id = await AsyncStorage.getItem("account_id");
      if (!account_id) {
        setErrorMessage("User not logged in.");
        return;
      }
  
      setErrorMessage("");
  
      const appointmentData = {
        patient_id: parseInt(account_id), // ✅ Maps to Account.account_id
        clinic_id: selectedClinic,
        doctor_id: selectedDoctor,
        appointment_date_time: date.toISOString(),
        status: "pending",
      };
  
      const response = await fetch("https://testinglang.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });
  
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Your appointment has been booked!");
        router.push("/Home");
      } else {
        setErrorMessage(data.message || "Failed to book appointment.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Book an Appointment</Text>

        <View style={styles.container}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Clinic Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select a Clinic</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedClinic}
                onValueChange={(clinicId) => {
                  setSelectedClinic(clinicId);
                  setSelectedDoctor(""); // Reset doctor when clinic changes
                  fetchDoctors(clinicId);
                }}
              >
                <Picker.Item label="Choose a Clinic" value="" />
                {clinics.map((clinic) => (
                  <Picker.Item key={clinic.clinic_id} label={clinic.name} value={clinic.clinic_id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Doctor Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select a Doctor</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDoctor}
                onValueChange={setSelectedDoctor}
                enabled={selectedClinic !== ""}
              >
                <Picker.Item label="Choose a doctor" value="" />
                {doctors.map((doctor) => (
                  <Picker.Item key={doctor.doctor_id} label={doctor.name} value={doctor.doctor_id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select a Date</Text>
            <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.dateText, !date && styles.placeholderText]}>
                {date ? date.toDateString() : "Tap to select a date"}
              </Text>
              <FontAwesome name="calendar" size={20} color="#007bff" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </View>

          {/* Reason Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reason for Consultation</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter reason"
              value={reason}
              onChangeText={setReason}
              multiline
            />
          </View>

          {/* Error Message */}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleBookAppointment}>
            <Text style={styles.buttonText}>Confirm Appointment</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#007bff",
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 20 },
  inputContainer: { marginBottom: height * 0.02 },
  label: { fontSize: width * 0.045, color: "#333", fontWeight: "500" },
  pickerWrapper: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  submitButton: { backgroundColor: "#28B6F6", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  errorText: { color: "red", textAlign: "center", marginTop: 10 },
});

