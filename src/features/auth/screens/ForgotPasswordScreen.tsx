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
    <SafeAreaView className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800">
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
            <View className="px-6 py-8">
              {/* Header */}
              <View className="items-center mb-10">
                <View className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl items-center justify-center shadow-2xl mb-4">
                  <Feather name="shield" size={32} color="white" />
                </View>
                <Text className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit' }}>
                  Reset Password
                </Text>
                <Text className="text-amber-300 text-sm font-semibold mt-2 tracking-wider">
                  Recover Your Access
                </Text>
              </View>

              {/* Title */}
              <View className="mb-8">
                <Text className="text-white text-2xl font-bold text-center" style={{ fontFamily: 'Outfit' }}>
                  {step === 1
                    ? "Enter Email"
                    : step === 2
                      ? "Enter OTP"
                      : "Set New Password"}
                </Text>
                <Text className="text-amber-200 text-sm font-medium mt-2 text-center">
                  {step === 1
                    ? "Send recovery instructions"
                    : step === 2
                      ? "Verify your identity"
                      : "Create a strong password"}
                </Text>
              </View>

              {/* Main Card */}
              <View className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
                {errorMsg && (
                  <View className="mb-6 bg-red-50 p-4 rounded-xl border border-red-200 flex-row items-start gap-3">
                    <Feather name="alert-circle" size={20} color="#DC2626" />
                    <Text className="text-red-700 text-sm font-semibold flex-1">
                      {errorMsg}
                    </Text>
                  </View>
                )}
                
                {step === 1 && (
                  <View>
                    <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                      Email Address
                    </Text>
                    <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                      <Feather name="mail" size={18} color="#F59E0B" />
                      <TextInput
                        className="flex-1 text-base text-slate-900 ml-3 font-medium"
                        placeholder="name@company.com"
                        placeholderTextColor="#CBD5E1"
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
                    <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                      Security Code
                    </Text>
                    <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                      <Feather name="key" size={18} color="#F59E0B" />
                      <TextInput
                        className="flex-1 text-base text-slate-900 ml-3 font-medium tracking-widest"
                        placeholder="000000"
                        placeholderTextColor="#CBD5E1"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!loading}
                      />
                    </View>
                    <Text className="text-xs text-slate-500 mt-3">
                      Code sent to {email}
                    </Text>
                  </View>
                )}

                {step === 3 && (
                  <View>
                    <View className="mb-6">
                      <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                        New Password
                      </Text>
                      <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                        <Feather name="lock" size={18} color="#F59E0B" />
                        <TextInput
                          className="flex-1 text-base text-slate-900 ml-3 font-medium"
                          placeholder="••••••••"
                          placeholderTextColor="#CBD5E1"
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
                            color="#F59E0B"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                        Confirm Password
                      </Text>
                      <View className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                        <Feather name="lock" size={18} color="#F59E0B" />
                        <TextInput
                          className="flex-1 text-base text-slate-900 ml-3 font-medium"
                          placeholder="••••••••"
                          placeholderTextColor="#CBD5E1"
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
                  className={`h-14 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg mt-8 ${
                    loading
                      ? "bg-slate-300 shadow-none"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-300"
                  }`}
                >
                  {loading && <Feather name="loader" size={18} color="white" />}
                  <Text className="text-white text-base font-bold tracking-wider">
                    {loading
                      ? "Processing..."
                      : step === 1
                        ? "Send Code"
                        : step === 2
                          ? "Verify Code"
                          : "Change Password"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Back Link */}
              <View className="items-center">
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
                  <Feather name="arrow-left" size={16} color="#D1D5DB" />
                  <Text className="text-sm font-semibold text-slate-300">
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
