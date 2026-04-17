import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
    changePasswordUser,
    forgetPasswordUser,
    verifyOtpUser,
} from "../redux/authThunks";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleSendOTP = async () => {
    setErrorMsg("");
    if (!email) return setErrorMsg("Email is required");
    try {
      const res = await dispatch(forgetPasswordUser({ email })).unwrap();
      console.log("Send OTP Response:", res);
      if (res.success) setStep(2);
    } catch (err: any) {
      console.log("Send OTP Error:", err);
      setErrorMsg(err?.message || err || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    setErrorMsg("");
    if (!otp) return setErrorMsg("OTP is required");
    try {
      const res = await dispatch(verifyOtpUser({ email, otp })).unwrap();
      console.log("Verify OTP Response:", res);
      if (res.success) setStep(3);
    } catch (err: any) {
      console.log("Verify OTP Error:", err);
      setErrorMsg(err?.message || err || "Invalid OTP");
    }
  };

  const handleChangePassword = async () => {
    setErrorMsg("");
    if (!newPassword || !confirmPassword)
      return setErrorMsg("Both fields are required");
    if (newPassword !== confirmPassword)
      return setErrorMsg("Passwords do not match");
    try {
      const res = await dispatch(
        changePasswordUser({ email, newPassword, confirmPassword }),
      ).unwrap();
      console.log("Change Password Response:", res);
      if (res.success) {
        router.replace("/(auth)/login");
      }
    } catch (err: any) {
      console.log("Change Password Error:", err);
      setErrorMsg(err?.message || err || "Failed to reset password");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-12">
              {/* Header */}
              <View className="items-center mb-10">
                <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-4">
                  <Feather name="shield" size={32} color="white" />
                </View>
                <Text className="text-4xl font-black text-black" style={{ fontFamily: 'Outfit' }}>
                  Reset Password
                </Text>
                <Text className="text-gray-600 text-sm font-medium mt-2 tracking-wider">
                  Recover Your Access
                </Text>
              </View>

              {/* Title */}
              <View className="mb-8">
                <Text className="text-black text-3xl font-bold text-center" style={{ fontFamily: 'Outfit' }}>
                  {step === 1
                    ? "Enter Email"
                    : step === 2
                      ? "Enter Code"
                      : "New Password"}
                </Text>
                <Text className="text-gray-600 text-base font-medium mt-2 text-center">
                  {step === 1
                    ? "Send recovery instructions"
                    : step === 2
                      ? "Verify your identity"
                      : "Create a new password"}
                </Text>
              </View>

              {errorMsg && (
                <View className="mb-6 p-4 border-l-4 border-black bg-gray-50">
                  <Text className="text-black text-sm font-semibold">
                    {errorMsg}
                  </Text>
                </View>
              )}

              {/* Form Card */}
              <View className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                {step === 1 && (
                  <View>
                    <Text className="text-sm font-bold text-black mb-3">
                      Email Address
                    </Text>
                    <View className="border-b border-black pb-4">
                      <TextInput
                        className="text-base text-black font-medium"
                        placeholder="name@company.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!loading}
                      />
                    </View>
                  </View>
                )}

                {step === 2 && (
                  <View>
                    <Text className="text-sm font-bold text-black mb-3">
                      Security Code
                    </Text>
                    <View className="border-b border-black pb-4">
                      <TextInput
                        className="text-base text-black font-medium tracking-widest"
                        placeholder="000000"
                        placeholderTextColor="#9CA3AF"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!loading}
                      />
                    </View>
                    <Text className="text-sm text-gray-600 mt-3">
                      Check your email for the code
                    </Text>
                  </View>
                )}

                {step === 3 && (
                  <View>
                    <View className="mb-6">
                      <Text className="text-sm font-bold text-black mb-3">
                        New Password
                      </Text>
                      <View className="border-b border-black pb-4 flex-row items-center">
                        <TextInput
                          className="flex-1 text-base text-black font-medium"
                          placeholder="••••••••"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry={!showPassword}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="off"
                          editable={!loading}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Feather
                            name={showPassword ? "eye" : "eye-off"}
                          size={18}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mb-2">
                    <Text className="text-sm font-bold text-black mb-3">
                      Confirm Password
                    </Text>
                    <View className="border-b border-black pb-4 flex-row items-center">
                      <TextInput
                        className="flex-1 text-base text-black font-medium"
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        editable={!loading}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => {
                  if (step === 1) handleSendOTP();
                  else if (step === 2) handleVerifyOTP();
                  else handleChangePassword();
                }}
                activeOpacity={0.8}
                disabled={loading}
                className={`h-14 rounded-lg items-center justify-center flex-row gap-2 ${
                  loading ? "bg-gray-300" : "bg-black"
                }`}
              >
                {loading && <Feather name="loader" size={18} color="white" />}
                <Text className="text-white text-base font-bold">
                  {loading
                    ? "Processing..."
                    : step === 1
                      ? "Send Code"
                      : step === 2
                        ? "Verify Code"
                        : "Change Password"}
                </Text>
              </TouchableOpacity>

              {/* Back Link */}
              <View className="items-center mt-8">
                <TouchableOpacity
                  onPress={() => {
                    if (step > 1) {
                      setStep(step - 1);
                      setErrorMsg("");
                    } else {
                      router.back();
                    }
                  }}
                  className="flex-row items-center gap-2"
                >
                  <Feather name="arrow-left" size={16} color="black" />
                  <Text className="text-base font-semibold text-black">
                    {step > 1 ? "Go Back" : "Return to Login"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
