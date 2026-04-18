import { AppDispatch, RootState } from "@/src/store/store";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
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
        router.replace("/login"); // login py bhej dein
      }
    } catch (err: any) {
      console.log("Change Password Error:", err);
      setErrorMsg(err?.message || err || "Failed to reset password");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="px-10 py-20">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-12 h-12 bg-black rounded-xl items-center justify-center shadow-lg shadow-gray-200">
              <Feather name="shield" size={24} color="white" />
            </View>
            <Text className="mt-4 text-2xl font-black text-black tracking-[-1px]">
              Security.
            </Text>
          </View>

          <Text className="text-[32px] font-black text-black leading-[38px] tracking-[-1px] text-center">
            {step === 1
              ? "Reset Access."
              : step === 2
                ? "Verify OTP."
                : "New Password."}
          </Text>
          <Text className="text-gray-400 text-sm font-medium mt-3 text-center px-4">
            {step === 1
              ? "Enter your email to receive recovery instructions."
              : step === 2
                ? `Enter the 6-digit OTP sent to ${email}.`
                : "Create a new strong password for your account."}
          </Text>

          {/* Form */}
          <View className="mt-12">
            {step === 1 && (
              <View className="mb-8">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">
                  Registered Email
                </Text>
                <View className="bg-gray-50 border border-gray-100 h-14 px-5 rounded-2xl flex-row items-center">
                  <TextInput
                    className="flex-1 text-base font-bold text-black h-full"
                    placeholder="name@company.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>
                <Text className="text-[10px] font-black text-red-500 mt-2 ml-2">
                  {errorMsg}
                </Text>
              </View>
            )}

            {step === 2 && (
              <View className="mb-8">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">
                  Security Code (OTP)
                </Text>
                <View className="bg-gray-50 border border-gray-100 h-14 px-5 rounded-2xl flex-row items-center">
                  <TextInput
                    className="flex-1 text-base font-bold text-black h-full tracking-[8px]"
                    placeholder="000000"
                    placeholderTextColor="#94A3B8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <Text className="text-[10px] font-black text-red-500 mt-2 ml-2">
                  {errorMsg}
                </Text>
              </View>
            )}

            {step === 3 && (
              <View className="mb-8">
                <View className="mb-5">
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">
                    New Password
                  </Text>
                  <View className="bg-gray-50 border border-gray-100 h-14 px-5 rounded-2xl flex-row items-center">
                    <TextInput
                      className="flex-1 text-base font-bold text-black h-full"
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
                      keyboardType={
                        showPassword ? "visible-password" : "default"
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={18}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-2">
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 ml-1">
                    Confirm Password
                  </Text>
                  <View className="bg-gray-50 border border-gray-100 h-14 px-5 rounded-2xl flex-row items-center">
                    <TextInput
                      className="flex-1 text-base font-bold text-black h-full"
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
                      keyboardType={
                        showPassword ? "visible-password" : "default"
                      }
                    />
                  </View>
                </View>

                <Text className="text-[10px] font-black text-red-500 mt-2 ml-2">
                  {errorMsg}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                if (step === 1) handleSendOTP();
                else if (step === 2) handleVerifyOTP();
                else handleChangePassword();
              }}
              activeOpacity={0.8}
              disabled={loading}
              className={`h-14 rounded-2xl items-center justify-center shadow-lg shadow-gray-200 ${
                loading ? "bg-gray-400 shadow-none" : "bg-black shadow-gray-200"
              }`}
            >
              <Text className="text-white text-[15px] font-black uppercase tracking-[2px]">
                {loading
                  ? "Processing..."
                  : step === 1
                    ? "Send Instructions"
                    : step === 2
                      ? "Verify OTP"
                      : "Change Password"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                  setErrorMsg("");
                } else {
                  router.back();
                }
              }}
              className="mt-10 self-center flex-row items-center"
            >
              <Feather name="arrow-left" size={14} color="gray" />
              <Text className="ml-2 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                {step > 1 ? "Go Back" : "Return to login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
