import { Dimensions, Platform, StyleSheet } from "react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("screen");

export const styles = StyleSheet.create({
  flex: { flex: 1 },

  root: {
    flex: 1,
    backgroundColor: "#0D1F3C",
  },

  gradientLayer: {
    position: "absolute",
    top: -200,
    left: 0,
    right: 0,
    bottom: -200,
    backgroundColor: "#0D1F3C",
  },

  gradientFill: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT + 400,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoArea: {
    marginBottom: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  logoImage: {
    width: 280,
    height: 130,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 36,
  },

  form: {
    width: "100%",
    maxWidth: 420,
  },

  fieldLabel: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 11,
    fontSize: 14.5,
    color: "#FFFFFF",
  },

  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },

  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 28,
  },

  loginArrow: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  forgotWrapper: {
    alignItems: "center",
    marginTop: 18,
  },

  forgotText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
});
