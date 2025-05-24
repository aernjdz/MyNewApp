import React from "react";
import { Text, StyleSheet, View, Dimensions, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const Button = ({ icon, text, href }: { icon: any; text: string; href: string }) => (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.link,
        pressed && styles.linkPressed
      ]}
    >
      <View style={styles.linkContent}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color="#ffffff" />
        </View>
        <Text style={styles.linkText}>{text}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Choose a section</Text>

      <Button icon="happy-outline" text="Temperament Test" href="/temperamentTest" />
      <Button icon="document-text-outline" text="TODO List" href="/list" /> 
      
    </View>
  );
}

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1f23",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 12,
    width: width > 500 ? 400 : "90%",
    borderWidth: 2,
    borderColor: "#38b000",
    backgroundColor: "transparent",
  },
  linkPressed: {
    backgroundColor: "#38b00033", // прозорий зелений на натиснення
    transform: [{ scale: 0.98 }],   // легкий "zoom"
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#38b000",
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.8,
  },
});
